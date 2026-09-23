from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models import Workflow
from schemas import WorkflowResponse, ExecutionResult
from services.executor import execute_script, log_execution

router = APIRouter(prefix="/api/workflows", tags=["Workflows"])

@router.get("/", response_model=list[WorkflowResponse])
async def get_workflows(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow))
    return result.scalars().all()

@router.post("/{workflow_id}/execute", response_model=ExecutionResult)
async def execute_workflow(workflow_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    output, error, success = await execute_script(workflow.script)
    log_id = await log_execution(db, "workflow", workflow.id, output, error, success)
    
    return ExecutionResult(
        ok=success,
        message="Workflow executed successfully" if success else "Workflow failed",
        execution_id=log_id,
        output=output,
        error=error
    )

@router.post("/{workflow_id}/toggle", response_model=WorkflowResponse)
async def toggle_workflow(workflow_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id))
    workflow = result.scalar_one_or_none()
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow.is_active = not workflow.is_active
    await db.commit()
    await db.refresh(workflow)
    return workflow
