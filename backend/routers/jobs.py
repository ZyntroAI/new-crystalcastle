from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import CronJob
from schemas import CronJobResponse, ExecutionResult
from services.executor import execute_script, log_execution
from services.scheduler import scheduler, run_scheduled_job

router = APIRouter(prefix="/api/jobs", tags=["Cron Jobs"])

@router.post("/{job_id}/execute", response_model=ExecutionResult)
async def execute_job(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CronJob).where(CronJob.id == job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    output, error, success = await execute_script(job.script)
    log_id = await log_execution(db, "job", job.id, output, error, success)
    
    return ExecutionResult(
        ok=success,
        message="Job executed successfully" if success else "Job failed",
        execution_id=log_id,
        output=output,
        error=error
    )

@router.post("/{job_id}/toggle", response_model=CronJobResponse)
async def toggle_job(job_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CronJob).where(CronJob.id == job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.is_active = not job.is_active
    
    # อัปเดต Scheduler แบบ Real-time
    job_id_str = f"job_{job.id}"
    if job.is_active:
        # สร้างฟังก์ชัน wrapper ใหม่
        def job_factory(j_id, j_script):
            async def wrapped_job():
                from database import AsyncSessionLocal
                async with AsyncSessionLocal() as session:
                    await run_scheduled_job(session, j_id, j_script)
            return wrapped_job
            
        scheduler.add_job(
            job_factory(job.id, job.script),
            CronTrigger.from_crontab(job.cron_expression),
            id=job_id_str,
            replace_existing=True
        )
    else:
        scheduler.remove_job(job_id_str)
        
    await db.commit()
    await db.refresh(job)
    return job
