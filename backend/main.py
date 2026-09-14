from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base, AsyncSessionLocal
from config import settings
from routers import workflows, jobs, execution
from services.scheduler import init_scheduler, start_scheduler, stop_scheduler
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Starting up FastAPI application...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables created/verified")
    
    if settings.SCHEDULER_ENABLED:
        async with AsyncSessionLocal() as db:
            await init_scheduler(db)
        start_scheduler()
        logger.info("✅ Scheduler initialized and started")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down FastAPI application...")
    if settings.SCHEDULER_ENABLED:
        stop_scheduler()
    await engine.dispose()

app = FastAPI(
    title="Cron Automation System API",
    description="Backend สำหรับจัดการ Workflow และ Cron Job อัตโนมัติ",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Setup สำหรับ Angular Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(workflows.router)
app.include_router(jobs.router)
app.include_router(execution.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "scheduler_running": True}
