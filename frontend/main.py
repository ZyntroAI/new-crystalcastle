from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from agent_local import ZyntroMobileAgent, AgentRequest
from config import HOST, PORT

app = FastAPI(title="ZyntroAI Mobile Agent", version="1.0.0")

# เปิดให้เข้าถึงจากทุกที่ในเครือข่าย
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# เริ่มต้น Agent
agent = ZyntroMobileAgent()

@app.get("/")
def root():
    return {
        "project": "ZyntroAI Mobile Agent",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "POST /api/ask": "ส่งคำถามให้ AI",
            "GET /api/status": "ตรวจสอบสถานะ",
            "GET /api/health": "ตรวจสอบการทำงาน"
        }
    }

@app.get("/api/health")
def health():
    return {"status": "online", "platform": "mobile-termux"}

@app.get("/api/status")
def status():
    return agent.status_check()

@app.post("/api/ask")
def ask_ai(req: AgentRequest):
    """ส่งคำถามให้ AI ที่รันอยู่ในเครื่อง"""
    if not req.message.strip():
        raise HTTPException(400, "กรุณาระบุข้อความ")

    result = agent.ask(req.message, req.mode)
    if result.get("status") == "failed":
        raise HTTPException(500, result.get("error", "เกิดข้อผิดพลาด"))
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
