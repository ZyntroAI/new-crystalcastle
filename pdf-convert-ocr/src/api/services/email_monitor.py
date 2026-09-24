import asyncio
import os
import re
from pathlib import Path
from datetime import datetime, timedelta
import aioimaplib
import logging
from typing import List, Dict, Optional
import aiofiles

from services.notifications import notifier
from services.job_queue import job_queue

logger = logging.getLogger("email-monitor")

class EmailConfig:
    enabled: bool = False
    imap_host: str = os.getenv("IMAP_HOST", "")
    imap_port: int = int(os.getenv("IMAP_PORT", "993"))
    imap_user: str = os.getenv("IMAP_USER", "")
    imap_pass: str = os.getenv("IMAP_PASS", "")
    check_interval: int = int(os.getenv("EMAIL_CHECK_INTERVAL", "30"))  # seconds
    watch_folder: str = os.getenv("EMAIL_WATCH_FOLDER", "INBOX")
    processed_folder: str = os.getenv("EMAIL_PROCESSED_FOLDER", "Processed")
    error_folder: str = os.getenv("EMAIL_ERROR_FOLDER", "Errors")
    allowed_extensions: set = {'.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif'}
    max_file_size_mb: int = int(os.getenv("EMAIL_MAX_SIZE_MB", "50"))

config = EmailConfig()
config.enabled = bool(config.imap_host and config.imap_user and config.imap_pass)

class AttachmentProcessor:
    def __init__(self):
        self.temp_dir = Path("/tmp/email-attachments")
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.running = False

    async def start(self):
        if not config.enabled:
            logger.info("📧 Email monitor disabled — missing IMAP credentials")
            return

        logger.info(f"📧 Email Auto-Processor started → {config.imap_user}")
        self.running = True
        
        while self.running:
            try:
                await self.check_inbox()
            except Exception as e:
                logger.error(f"❌ Email check failed: {e}")
            
            await asyncio.sleep(config.check_interval)

    async def stop(self):
        self.running = False
        logger.info("📧 Email monitor stopped")

    async def check_inbox(self):
        imap = aioimaplib.IMAP4_SSL(config.imap_host, config.imap_port)
        try:
            await imap.wait_hello_from_server()
            await imap.login(config.imap_user, config.imap_pass)
            await imap.select(config.watch_folder)

            # Search for unread emails
            _, data = await imap.search('UNSEEN')
            email_ids = data[0].decode().strip().split()
            
            if not email_ids:
                return

            logger.info(f"📥 Found {len(email_ids)} new email(s)")

            for email_id in email_ids:
                try:
                    await self.process_email(imap, email_id)
                except Exception as e:
                    logger.error(f"Failed processing email {email_id}: {e}")
                    await self.move_to_folder(imap, email_id, config.error_folder)

        finally:
            await imap.logout()

    async def process_email(self, imap, email_id: str):
        # Fetch subject, from, and attachments
        _, msg_data = await imap.fetch(email_id, '(RFC822)')
        raw_email = msg_data[1][0]
        
        import email
        from email.policy import default
        
        msg = email.message_from_bytes(raw_email, policy=default)
        subject = msg.get('Subject', 'No Subject')
        from_addr = msg.get('From', 'Unknown')
        
        attachments = await self.extract_attachments(msg)
        
        if not attachments:
            logger.info(f"ℹ️ No attachments in email: {subject}")
            # Mark as read, no action
            await imap.store(email_id, '+FLAGS', '\\Seen')
            return

        processed_files = []
        ocr_results = []

        for att in attachments:
            file_path = att['path']
            file_name = att['filename']
            
            logger.info(f"🔄 Processing attachment: {file_name}")
            
            # Submit to OCR queue
            job_id = f"email-{email_id}-{Path(file_name).stem[:20]}"
            
            result = await job_queue.add_job(
                processor=lambda: self.run_ocr(file_path, file_name, job_id),
                payload={
                    'job_id': job_id,
                    'file_name': file_name,
                    'source': f"email:{from_addr}",
                    'email_subject': subject,
                }
            )
            
            ocr_results.append({
                'file': file_name,
                'job_id': job_id,
                'result': result
            })
            processed_files.append(file_name)

        # Send summary notification
        await self.send_summary_notification(from_addr, subject, ocr_results)
        
        # Move email to processed folder
        await self.move_to_folder(imap, email_id, config.processed_folder)
        
        # Cleanup temp files
        for att in attachments:
            try:
                os.remove(att['path'])
            except:
                pass

    async def extract_attachments(self, msg) -> List[Dict]:
        attachments = []
        
        for part in msg.walk():
            if part.get_content_maintype() == 'multipart':
                continue
            if part.get('Content-Disposition') is None:
                continue

            filename = part.get_filename()
            if not filename:
                continue

            # Decode filename if needed
            from email.header import decode_header
            decoded = decode_header(filename)
            filename = ''.join(
                str(part[0], part[1] or 'utf-8') if isinstance(part[0], bytes) else part[0]
                for part in decoded
            )

            ext = Path(filename).suffix.lower()
            if ext not in config.allowed_extensions:
                logger.info(f"⏭️ Skipped unsupported file: {filename} ({ext})")
                continue

            payload = part.get_payload(decode=True)
            if not payload:
                continue

            size_mb = len(payload) / (1024 * 1024)
            if size_mb > config.max_file_size_mb:
                logger.warning(f"⚠️ File too large: {filename} ({size_mb:.1f} MB)")
                continue

            # Save to temp
            safe_name = re.sub(r'[^\w.\-]', '_', filename)
            temp_path = self.temp_dir / f"{datetime.now().timestamp()}_{safe_name}"
            
            async with aiofiles.open(temp_path, 'wb') as f:
                await f.write(payload)

            attachments.append({
                'filename': filename,
                'path': str(temp_path),
                'size_mb': round(size_mb, 2)
            })

        return attachments

    async def run_ocr(self, file_path: str, file_name: str, job_id: str):
        from lib.ocr import runOcr  # Your existing OCR function
        
        result = await runOcr(file_path, {
            'lang': 'th+en',
            'outputPath': str(Path(file_path).with_suffix('-searchable.pdf')),
            'saveText': True,
            'backend': 'auto'
        })
        
        return result

    async def send_summary_notification(self, sender: str, subject: str, results: List[Dict]):
        # Count successes/failures
        success = [r for r in results if not r.get('error')]
        failed = [r for r in results if r.get('error')]

        if success:
            await notifier.send_complete(
                job_id=f"email-batch-{datetime.now().strftime('%Y%m%d%H%M')}",
                file_name=f"{len(success)} attachment(s) from: {subject[:50]}",
                pages=sum(r['result'].get('pages', 0) for r in success),
                confidence=sum(r['result'].get('confidence', 0) for r in success) / len(success) if success else 0,
                time_sec=0,
                pdf_url=None,  # Generate from your file server
                text_url=None,
            )

        for f in failed:
            await notifier.send_failed(
                job_id=f['job_id'],
                file_name=f['file'],
                error=f.get('error', 'Unknown error')
            )

    async def move_to_folder(self, imap, email_id: str, target_folder: str):
        try:
            # Create folder if not exists
            await imap.create(target_folder)
        except:
            pass  # Usually already exists
        
        # Copy then delete (safer than move)
        await imap.copy(email_id, target_folder)
        await imap.store(email_id, '+FLAGS', '\\Deleted')
        await imap.expunge()

# Global instance
attachment_processor = AttachmentProcessor()
