from services.notifications import notifier  # ← Add

# Inside wrapped() — completed:
                try:
                    job.result = await processor(payload)
                    job.status = "completed"
                    
                    # 📧💬 Send Email + Slack Alerts
                    file_name = payload.get("options", {}).get("file_name", "document")
                    await notifier.send_complete(
                        job_id=job.job_id,
                        file_name=file_name,
                        pages=job.result.get("pages", 0),
                        confidence=job.result.get("confidence", 0),
                        time_sec=job.result.get("time_seconds", 0),
                        pdf_url=job.result.get("searchable_pdf_url"),
                        text_url=job.result.get("text_extract_url"),
                    )
                    
                    # Broadcast to WebSocket...

# Inside failed block:
                except Exception as e:
                    job.status = "failed"
                    job.error = str(e)
                    
                    # 📧💬 Send Failure Alerts
                    file_name = payload.get("options", {}).get("file_name", "document")
                    await notifier.send_failed(
                        job_id=job.job_id,
                        file_name=file_name,
                        error=job.error,
                    )
