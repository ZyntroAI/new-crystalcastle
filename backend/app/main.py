from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.public.routes import router as public_router
from app.public.limiter import init_limiter
from app.profile.routes import router as profile_router

app = FastAPI(
    title="ZyntroAI New-Crystalcastle",
    version="1.0.0"
)

# Rate Limiter
init_limiter(app)

# CORS — เปิดให้ Base44 เรียกได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://base44.com",
        "https://*.base44.com",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# รวม Endpoints
app.include_router(public_router)
app.include_router(profile_router)

# ไฟล์สาธารณะ
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
