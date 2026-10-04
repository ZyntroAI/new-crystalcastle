
import os
import shutil

base_dir = "/mnt/agents/output/fastapi-solo-backend"

# 1. Contact Form model
contact_model = """from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, func, Enum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum


class ContactStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class ContactForm(Base):
    __tablename__ = "contact_forms"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="general")  # general, support, feature_request, onboarding
    status: Mapped[str] = mapped_column(String(20), default=ContactStatus.NEW.value)
    
    # Optional: link to a user if they're logged in
    user_id: Mapped[int | None] = mapped_column(index=True, nullable=True)
    
    # Admin notes
    admin_notes: Mapped[str | None] = mapped_column(Text)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
"""

with open(f"{base_dir}/app/models/contact.py", "w") as f:
    f.write(contact_model)

# Update models init
with open(f"{base_dir}/app/models/__init__.py", "w") as f:
    f.write("""from app.models.user import User
from app.models.contact import ContactForm

__all__ = ["User", "ContactForm"]
""")

# 2. Contact schemas
contact_schemas = """from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict


class ContactFormBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)
    category: str = Field(default="general", pattern="^(general|support|feature_request|onboarding)$")


class ContactFormCreate(ContactFormBase):
    pass


class ContactFormUpdate(BaseModel):
    status: str | None = Field(None, pattern="^(new|in_progress|resolved|closed)$")
    admin_notes: str | None = Field(None, max_length=2000)


class ContactFormResponse(ContactFormBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    status: str
    user_id: int | None
    admin_notes: str | None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None


class ContactFormListResponse(BaseModel):
    total: int
    page: int
    per_page: int
    items: list[ContactFormResponse]
"""

with open(f"{base_dir}/app/schemas/contact.py", "w") as f:
    f.write(contact_schemas)

# Update schemas init
with open(f"{base_dir}/app/schemas/__init__.py", "w") as f:
    f.write("""from app.schemas.user import (
    UserBase, UserCreate, UserUpdate, UserResponse, Token, TokenPayload, LoginRequest
)
from app.schemas.common import HealthCheck, PaginatedResponse
from app.schemas.contact import (
    ContactFormBase, ContactFormCreate, ContactFormUpdate,
    ContactFormResponse, ContactFormListResponse
)

__all__ = [
    "UserBase", "UserCreate", "UserUpdate", "UserResponse",
    "Token", "TokenPayload", "LoginRequest",
    "HealthCheck", "PaginatedResponse",
    "ContactFormBase", "ContactFormCreate", "ContactFormUpdate",
    "ContactFormResponse", "ContactFormListResponse",
]
""")

print("Contact form model and schemas created")