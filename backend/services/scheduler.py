from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models import CronJob
from services.executor import execute_script, log_execution
import logging

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def run_scheduled_job(db: AsyncSession, job_id: int, script: str):
    logger.info(f"⏰ Running scheduled job {job_id}")
    output, error, success = await execute_script(script)
    await log_execution(db, "job", job_id, output, error, success)
    logger.info(f"✅ Job {job_id} completed with status: {'success' if success else 'failed'}")

async def init_scheduler(db: AsyncSession):
    """โหลด Cron Jobs จาก Database เข้า Scheduler"""
    result = await db.execute(select(CronJob).where(CronJob.is_active == True))
    jobs = result.scalars().all()
    
    for job in jobs:
        try:
            # ใช้ closure เพื่อจับค่า job_id และ script ปัจจุบัน
            def job_factory(j_id, j_script):
                async def wrapped_job():
                    # สร้าง session ใหม่สำหรับแต่ละการรัน
                    from database import AsyncSessionLocal
                    async with AsyncSessionLocal() as session:
                        await run_scheduled_job(session, j_id, j_script)
                return wrapped_job

            scheduler.add_job(
                job_factory(job.id, job.script),
                CronTrigger.from_crontab(job.cron_expression),
                id=f"job_{job.id}",
                replace_existing=True
            )
            logger.info(f"📅 Scheduled job {job.id} with cron: {job.cron_expression}")
        except Exception as e:
            logger.error(f"❌ Failed to schedule job {job.id}: {e}")

def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("🚀 APScheduler started")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        logger.info("🛑 APScheduler stopped")
