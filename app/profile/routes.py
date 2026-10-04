from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from . import schemas, service

router = APIRouter(prefix="/profile", tags=["👤 Profile"])

@router.get("/{user_id}", response_model=schemas.ProfileResponse)
def read_profile(user_id: str, db: Session = Depends(get_db)):
    """ดึงข้อมูลโปรไฟล์ผู้ใช้"""
    profile = service.get_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="ไม่พบโปรไฟล์")
    return profile

@router.post("/", response_model=schemas.ProfileResponse, status_code=201)
def create_profile(data: schemas.ProfileCreate, db: Session = Depends(get_db)):
    """สร้างโปรไฟล์ใหม่"""
    if service.get_profile(db, data.user_id):
        raise HTTPException(status_code=409, detail="โปรไฟล์มีอยู่แล้ว")
    return service.create_profile(db, data)

@router.patch("/{user_id}", response_model=schemas.ProfileResponse)
def update_profile(
    user_id: str,
    data: schemas.ProfileUpdate,
    db: Session = Depends(get_db)
):
    """แก้ไขข้อมูลโปรไฟล์"""
    updated = service.update_profile(db, user_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="ไม่พบโปรไฟล์")
    return updated
