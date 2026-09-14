from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    script: str
    is_active: bool = True

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowResponse(WorkflowBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CronJobBase(BaseModel):
    name: str
    cron_expression: str
    script: str
    is_active: bool = True

class CronJobResponse(CronJobBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ExecutionResult(BaseModel):
    ok: bool
    message: str
    execution_id: Optional[int] = None
    output: Optional[str] = None
    error: Optional[str] = None

class ExecutionLogResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    status: str
    output: Optional[str]
    error: Optional[str]
    executed_at: datetime

    class Config:
        from_attributes = True
