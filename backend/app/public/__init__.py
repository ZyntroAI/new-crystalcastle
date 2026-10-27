"""
🌐 Public Endpoints — เชื่อม Base44 / ส่วนสาธารณะ
ไม่ต้อง Authentication — ปลอดภัยด้วย Rate Limit + Validation
"""
from .routes import router

__all__ = ["router"]
