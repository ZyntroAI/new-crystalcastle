from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class ContactForm(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="ชื่อผู้ติดต่อ")
    email: EmailStr = Field(..., description="อีเมล")
    subject: Optional[str] = Field(None, max_length=200)
    message: str = Field(..., min_length=5, max_length=2000, description="ข้อความ")
    source: str = Field("base44", description="ที่มาของข้อมูล")


class WaitlistForm(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    company: Optional[str] = None
    use_case: Optional[str] = Field(None, max_length=500)
    source: str = "base44"


class PublicResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
