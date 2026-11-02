import asyncio
import json
import uuid
from datetime import datetime
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from agent.graph import build_graph
import os

app = FastAPI(title="ZyntroAI Agent API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class BriefingRequest(BaseModel):
    briefing_date: str = datetime.utcnow().strftime("%Y-%m-%d")

async def stream_agent(briefing_date: str):
    run_id = str(uuid.uuid4())
    graph = build_graph()
    initial = {
        "run_id": run_id,
        "briefing_date": briefing_date,
        "tasks": [],
        "alerts": [],
        "repo_health": {},
        "knowledge_context": [],
        "draft_briefing": None,
        "status": "starting",
        "approval_required": False,
        "errors": []
    }
    async for event in graph.astream(initial):
        yield f"data: {json.dumps(event)}\n\n"
        await asyncio.sleep(0.01)
    yield f"data: {json.dumps({'run_id': run_id, 'done': True})}\n\n"

@app.post("/api/briefing/stream")
async def briefing_stream(req: BriefingRequest):
    return StreamingResponse(
        stream_agent(req.briefing_date),
        media_type="text/event-stream"
    )

@app.get("/api/tasks")
async def get_tasks():
    path = os.getenv("TASK_JSON_PATH", "tasks/task.json")
    if not os.path.exists(path):
        raise HTTPException(404, "task.json not found")
    async with aiofiles.open(path, "r", encoding="utf-8") as f:
        return json.loads(await f.read())
