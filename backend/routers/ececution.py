from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_db
from models import ExecutionLog
from schemas import ExecutionLogResponse

router = APIRouter(prefix="/api/execution", tags=["Execution Logs"])

@router.get("/logs", response_model=list[ExecutionLogResponse])
async def get_execution_logs(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ExecutionLog).order_by(desc(ExecutionLog.executed_at)).limit(limit)
    )
    return result.scalars().all()
