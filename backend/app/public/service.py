import uuid
from sqlalchemy.orm import Session
from . import models, schemas


def save_contact(db: Session, data: schemas.ContactForm):
    entry = models.ContactInquiry(
        id=str(uuid.uuid4()),
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
        source=data.source
    )
    db.add(entry)
    db.commit()
    return entry


def save_waitlist(db: Session, data: schemas.WaitlistForm):
    existing = db.query(models.WaitlistEntry).filter(
        models.WaitlistEntry.email == data.email
    ).first()
    if existing:
        return None, "อีเมลนี้ได้ลงทะเบียนแล้ว"

    entry = models.WaitlistEntry(
        id=str(uuid.uuid4()),
        email=data.email,
        full_name=data.full_name,
        company=data.company,
        use_case=data.use_case,
        source=data.source
    )
    db.add(entry)
    db.commit()
    return entry, "ลงทะเบียนสำเร็จ"


def get_public_stats():
    return {
        "status": "operational",
        "version": "1.0.0",
        "platform": "ZyntroAI New-Crystalcastle",
        "ready": True
    }
