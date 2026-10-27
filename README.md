🚀 main.py — FastAPI สำหรับ New CrystalCastle
 
ไฟล์นี้เป็นจุดเริ่มต้นของ FastAPI Application พร้อมโครงสร้างมาตรฐาน ความปลอดภัย และเอกสารอัตโนมัติ ✅
 
 
 
📄 main.py — ฉบับสมบูรณ์
 
python  
#!/usr/bin/env python3
"""
🏰 New CrystalCastle — FastAPI Application
============================================
โปรเจกต์: https://github.com/ZyntroAI/new-crystalcastle
จุดเริ่มต้น API Server — รัน: `uvicorn main:app --reload`
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from datetime import datetime
import os

__version__ = "0.1.0"
__author__ = "ZyntroAI"


# ==========================================
# 🔄 Lifespan — จัดการการเริ่มและปิดระบบ
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """รันเมื่อระบบเริ่มและเมื่อปิดระบบ"""
    # ✅ Startup — ทำก่อนเริ่มรัน
    print("🚀 กำลังเริ่มระบบ New CrystalCastle...")
    
    # ตรวจสอบ/สร้างโฟลเดอร์ที่จำเป็น
    required_dirs = ["logs", "data"]
    for dir_name in required_dirs:
        os.makedirs(dir_name, exist_ok=True)
    
    print(f"✅ ระบบพร้อมใช้งาน — เวอร์ชัน {__version__}")
    yield
    
    # 🧹 Shutdown — ทำก่อนปิดระบบ
    print("👋 กำลังปิดระบบ...")
    # ปิดการเชื่อมต่อฐานข้อมูล/แคช ที่นี่
    print("✅ ปิดระบบเรียบร้อยแล้ว")


# ==========================================
# � สร้างแอปพลิเคชัน FastAPI
# ==========================================
app = FastAPI(
    title="New CrystalCastle API",
    description="🏰 ระบบบริการหลังบ้านสำหรับ New CrystalCastle",
    version=__version__,
    docs_url="/docs",          # Swagger UI ที่ /docs
    redoc_url="/redoc",        # ReDoc ที่ /redoc
    lifespan=lifespan,
    contact={
        "name": "ZyntroAI",
        "url": "https://github.com/ZyntroAI/new-crystalcastle"
    }
)


# ==========================================
# 🔒 CORS — การตั้งค่าความปลอดภัย
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: เปลี่ยนเป็นโดเมนจริงเมื่อขึ้น production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 📊 Middleware — บันทึกเวลาทำงาน
# ==========================================
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Version"] = __version__
    return response


# ==========================================
# 🛡️ Error Handler — จัดการข้อผิดพลาด
# ==========================================
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "timestamp": datetime.now().isoformat(),
            "error": "Internal Server Error",
            "message": str(exc),
            "path": request.url.path,
            "version": __version__
        }
    )


# ==========================================
# ✅ Health Check — ตรวจสอบสถานะระบบ
# ==========================================
@app.get("/", tags=["System"])
async def root():
    """หน้าแรก — ข้อมูลระบบ"""
    return {
        "name": "New CrystalCastle API",
        "version": __version__,
        "status": "running",
        "docs": "/docs",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health", tags=["System"])
async def health_check():
    """ตรวจสอบความพร้อมของระบบ"""
    return {
        "status": "healthy",
        "version": __version__,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/ready", tags=["System"])
async def readiness_check():
    """ตรวจสอบความพร้อมสำหรับ Kubernetes/Docker"""
    return {"status": "ready"}


# ==========================================
# 📌 เพิ่ม Endpoint ของคุณที่นี่
# ==========================================
# ตัวอย่าง:
# from api import users, items
# app.include_router(users.router, prefix="/api/users", tags=["Users"])
# app.include_router(items.router, prefix="/api/items", tags=["Items"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # ปิดใน production
        log_level="info"
    )
 
 
 
 
📁 requirements.txt — แพ็กเกจที่ต้องใช้
 
txt  
fastapi==0.115.0
uvicorn==0.31.0
python-multipart==0.0.12
pydantic==2.9.2
pydantic-settings==2.6.0
 
 
 
 
📁 โครงสร้างโปรเจกต์ที่แนะนำ
 
plaintext  
new-crystalcastle/
├── main.py                  ← ไฟล์จุดเริ่มต้น (ด้านบน)
├── requirements.txt         ← แพ็กเกจที่ต้องใช้
├── .env.example            ← ตัวอย่างตัวแปรสภาพแวดล้อม
├── .gitignore              ← ไฟล์ที่ไม่ต้องการเก็บใน Git
├── api/                    ← โมดูล API แยกตามฟีเจอร์
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── users.py        ← ตัวอย่าง: จัดการผู้ใช้
│   │   └── items.py        ← ตัวอย่าง: จัดการรายการ
├── core/                   ← โค้ดหลัก
│   ├── __init__.py
│   ├── config.py           ← การตั้งค่า
│   ├── security.py         ← JWT, Password Hash
│   └── database.py         ← การเชื่อมต่อฐานข้อมูล
├── models/                 ← Pydantic Schemas / DB Models
│   ├── __init__.py
│   └── schemas.py
├── logs/                   ← บันทึกการทำงาน
└── data/                   ← ข้อมูล
 
 
 
 
🚀 วิธีรันระบบ
 
ขั้นตอนที่ 1: ติดตั้ง
 
bash  
# สร้าง Virtual Environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# ติดตั้งแพ็กเกจ
pip install -r requirements.txt
 
 
ขั้นตอนที่ 2: เริ่มรัน
 
bash  
# โหมดพัฒนา (มี Auto-reload)
uvicorn main:app --reload

# หรือรันโดยตรง
python main.py
 
 
ขั้นตอนที่ 3: เข้าใช้งาน
 
- 🌐 API หน้าแรก: http://localhost:8000
- 📖 เอกสารอัตโนมัติ (Swagger): http://localhost:8000/docs
- 📘 เอกสารแบบ ReDoc: http://localhost:8000/redoc
- ❤️ ตรวจสอบสถานะ: http://localhost:8000/health
 
 
 
✅ สิ่งที่ได้ในไฟล์นี้
 
- ✅ FastAPI มาตรฐาน — พร้อมใช้งานทันที
- ✅ เอกสารอัตโนมัติ — /docs และ /redoc
- ✅ CORS พร้อมตั้งค่า — รองรับเรียกจาก Frontend
- ✅ Lifespan Handler — จัดการ Startup/Shutdown
- ✅ Error Handling กลาง — รูปแบบข้อผิดพลาดเดียวกันทั้งระบบ
- ✅ Health Check — พร้อมใช้งานกับ Docker/Kubernetes
- ✅ Middleware บันทึกเวลา — แสดงเวลาที่ใช้ประมวลผล
 
ต้องการเพิ่มอะไรต่อไหมครับ เช่น การเชื่อมต่อฐานข้อมูล, ระบบล็อกอิน JWT, หรือตัวอย่าง Endpoint แยกตามโมดูล 😊