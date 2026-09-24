import asyncio
import os
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import aiohttp
import logging

logger = logging.getLogger("ocr-alerts")

class EmailConfig:
    enabled: bool = False
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_pass: str = os.getenv("SMTP_PASS", "")
    smtp_from: str = os.getenv("SMTP_FROM", "ocr@localhost")
    to_email: str = os.getenv("ALERT_EMAIL", "")

class SlackConfig:
    enabled: bool = False
    webhook_url: str = os.getenv("SLACK_WEBHOOK", "")

class NotificationService:
    def __init__(self):
        self.email = EmailConfig()
        self.email.enabled = bool(
            self.email.smtp_host and self.email.smtp_user and self.email.to_email
        )
        
        self.slack = SlackConfig()
        self.slack.enabled = bool(self.slack.webhook_url)

        if self.email.enabled:
            logger.info(f"📧 Email alerts enabled → {self.email.to_email}")
        if self.slack.enabled:
            logger.info("💬 Slack alerts enabled")

    async def send_complete(
        self,
        job_id: str,
        file_name: str,
        pages: int,
        confidence: float,
        time_sec: float,
        pdf_url: Optional[str] = None,
        text_url: Optional[str] = None,
    ):
        subject = f"✅ OCR Complete — {file_name}"
        body = f"""
Your OCR job has finished!

📄 File: {file_name}
🆔 Job ID: {job_id}
📃 Pages: {pages}
🎯 Confidence: {confidence:.1f}%
⏱️ Time: {time_sec:.1f}s

🔗 Downloads:
- Searchable PDF: {pdf_url or "N/A"}
- Text Extract: {text_url or "N/A"}

— ZyntroAI OCR Engine
        """.strip()

        tasks = []
        if self.email.enabled:
            tasks.append(self._send_email(subject, body))
        if self.slack.enabled:
            tasks.append(self._send_slack_complete(
                job_id, file_name, pages, confidence, time_sec, pdf_url, text_url
            ))
        
        await asyncio.gather(*tasks, return_exceptions=True)

    async def send_failed(
        self,
        job_id: str,
        file_name: str,
        error: str,
    ):
        subject = f"❌ OCR Failed — {file_name}"
        body = f"""
Your OCR job could not be processed.

📄 File: {file_name}
🆔 Job ID: {job_id}
❌ Error: {error}

Please check the file and try again.

— ZyntroAI OCR Engine
        """.strip()

        tasks = []
        if self.email.enabled:
            tasks.append(self._send_email(subject, body))
        if self.slack.enabled:
            tasks.append(self._send_slack_failed(job_id, file_name, error))
        
        await asyncio.gather(*tasks, return_exceptions=True)

    async def _send_email(self, subject: str, body: str):
        try:
            msg = MIMEMultipart()
            msg["From"] = self.email.smtp_from
            msg["To"] = self.email.to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))

            def _send():
                with smtplib.SMTP(self.email.smtp_host, self.email.smtp_port) as server:
                    server.starttls()
                    server.login(self.email.smtp_user, self.email.smtp_pass)
                    server.send_message(msg)

            await asyncio.to_thread(_send)
            logger.info(f"📧 Email sent → {self.email.to_email}")
        except Exception as e:
            logger.error(f"❌ Email failed: {e}")

    async def _send_slack_complete(
        self, job_id, file_name, pages, confidence, time_sec, pdf_url, text_url
    ):
        try:
            blocks = [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": "✅ OCR Job Complete"}
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*File:*\n{file_name}"},
                        {"type": "mrkdwn", "text": f"*Job ID:*\n`{job_id}`"},
                        {"type": "mrkdwn", "text": f"*Pages:*\n{pages}"},
                        {"type": "mrkdwn", "text": f"*Confidence:*\n{confidence:.1f}%"},
                        {"type": "mrkdwn", "text": f"*Duration:*\n{time_sec:.1f}s"},
                    ]
                },
            ]
            if pdf_url or text_url:
                blocks.append({
                    "type": "actions",
                    "elements": [
                        *([{
                            "type": "button",
                            "text": {"type": "plain_text", "text": "📄 Download PDF"},
                            "url": pdf_url,
                        }] if pdf_url else []),
                        *([{
                            "type": "button",
                            "text": {"type": "plain_text", "text": "📝 Text File"},
                            "url": text_url,
                        }] if text_url else []),
                    ]
                })

            async with aiohttp.ClientSession() as session:
                await session.post(self.slack.webhook_url, json={"blocks": blocks})
            
            logger.info("💬 Slack alert sent")
        except Exception as e:
            logger.error(f"❌ Slack failed: {e}")

    async def _send_slack_failed(self, job_id, file_name, error):
        try:
            blocks = [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": "❌ OCR Job Failed"}
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*File:*\n{file_name}"},
                        {"type": "mrkdwn", "text": f"*Job ID:*\n`{job_id}`"},
                    ]
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": f"*Error:*\n```\n{error}\n```"}
                },
            ]

            async with aiohttp.ClientSession() as session:
                await session.post(self.slack.webhook_url, json={"blocks": blocks})
            
            logger.info("💬 Slack failure alert sent")
        except Exception as e:
            logger.error(f"❌ Slack failed: {e}")

# Global instance
notifier = NotificationService()
