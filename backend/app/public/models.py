from sqlalchemy import Column, String, Text, DateTime, Boolean
from datetime import datetime
from app.database import Base


class ContactInquiry(Base):
    __tablename__ = "public_contact"

    id = Column(String(36), primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    subject = Column(String(200))
    message = Column(Text, nullable=False)
    source = Column(String(50), default="web")
    is_read = Column(Boolean, default=False)
    is_replied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class WaitlistEntry(Base):
    __tablename__ = "public_waitlist"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(100))
    company = Column(String(200))
    use_case = Column(Text)
    source = Column(String(50), default="web")
    invited = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
