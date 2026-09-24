import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager

from services.email_monitor import attachment_processor

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start email monitor in background
    email_task = asyncio.create_task(attachment_processor.start())
    
    yield
    
    # Clean shutdown
    await attachment_processor.stop()
    email_task.cancel()
    try:
        await email_task
    except asyncio.CancelledError:
        pass

app = FastAPI(lifespan=lifespan)

# Rest of your routes unchanged
