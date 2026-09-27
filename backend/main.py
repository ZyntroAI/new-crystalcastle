from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# ─── โหลดตัวแปรสภาพแวดล้อม ────────────────────────────────────────
load_dotenv()

# ─── ตรวจสอบการตั้งค่า Supabase ─────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """จัดการการเริ่มต้นและปิดระบบ"""
    # Startup: ตรวจสอบการเชื่อมต่อ
    print("✅ ZyntroAI New CrystalCastle — Backend Started")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("⚠️  Supabase credentials not found — running in limited mode")
    
    yield
    
    # Shutdown
    print("👋 Shutting down gracefully...")


# ─── สร้างแอปพลิเคชัน ───────────────────────────────────────────────
app = FastAPI(
    title="ZyntroAI New CrystalCastle",
    description="AI-Native Full-Stack Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ───────────────────────────────────────────────────────────
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    # เพิ่มโดเมนจริงเมื่อ deploy
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Routes หลัก ────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "name": "ZyntroAI New CrystalCastle",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """ตรวจสุขภาพระบบ — ใช้สำหรับ CI/CD และการเฝ้าดู"""
    supabase_status = "configured" if (SUPABASE_URL and SUPABASE_KEY) else "missing"
    
    return {
        "status": "healthy",
        "services": {
            "supabase": supabase_status,
        },
    }


@app.get("/ready")
async def readiness_check():
    """ตรวจสอบความพร้อมใช้งาน"""
    return {"ready": True}


# ─── รันที่นี่โดยตรง ────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload in dev
    )
