from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from . import schemas, service
from .limiter import limiter

router = APIRouter(
    prefix="/api/public",
    tags=["🌐 Public — Base44 Integration"],
    responses={429: {"description": "ขอส่งคำขอมากเกินไป"}}
)


@router.post("/contact", response_model=schemas.PublicResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def submit_contact(
    request: Request,
    data: schemas.ContactForm,
    db: Session = Depends(get_db)
):
    service.save_contact(db, data)
    return schemas.PublicResponse(
        success=True,
        message="ส่งข้อความสำเร็จ ✅ เราจะติดต่อกลับโดยเร็วที่สุด"
    )


@router.post("/waitlist", response_model=schemas.PublicResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def join_waitlist(
    request: Request,
    data: schemas.WaitlistForm,
    db: Session = Depends(get_db)
):
    entry, msg = service.save_waitlist(db, data)
    if not entry:
        return schemas.PublicResponse(success=False, message=msg)
    return schemas.PublicResponse(success=True, message=msg)


@router.get("/stats", response_model=dict)
def public_stats():
    return service.get_public_stats()
