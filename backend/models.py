from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    script = Column(Text, nullable=False)  # Shell script หรือ command
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CronJob(Base):
    __tablename__ = "cron_jobs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cron_expression = Column(String, nullable=False)  # e.g., "0 * * * *"
    script = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ExecutionLog(Base):
    __tablename__ = "execution_logs"
    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False)  # 'workflow' or 'job'
    entity_id = Column(Integer, nullable=False)
    status = Column(String, nullable=False)  # 'success' or 'failed'
    output = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
