Got it — here are the complete, production-ready scripts from your screenshot plus the full implementations to make them work end-to-end 👇
 
 
 
🔒  app/core/security.py  — Full Security Module
 
python  
from datetime import datetime, timedelta, UTC
from typing import Optional
from jose import jwt
from passlib.context import CryptContext

# --------------------------
# Configuration
# --------------------------
SECRET_KEY = "change-this-in-production-strong-random-key"  # ⚠️ Replace with env var!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing context
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

# --------------------------
# Password Utilities
# --------------------------
def hash_password(password: str) -> str:
    """Hash plain text password with bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored hash"""
    return pwd_context.verify(plain_password, hashed_password)

# --------------------------
# JWT Token Utilities
# --------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate signed JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode & validate JWT, returns payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.JWTError:
        return {}
 
 
 
 
🧑‍💻  app/models/user.py  — Full SQLAlchemy User Model
 
python  
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.core.database import Base  # Your declarative base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
 
 
 
 
📦 Dependencies Needed ( requirements.txt )
 
txt  
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
sqlalchemy==2.0.23
python-multipart==0.0.6
pydantic==2.5.0
 
 
 
 
⚠️ Critical Security Fixes
 
1. Never hardcode  SECRET_KEY  — load from environment:
 
python  
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
# Then use: settings.SECRET_KEY
 
 
2. Generate a strong key:
 
bash  
openssl rand -hex 32
 
 
3. Add  .env  to  .gitignore  — never commit secrets!
 
 
 
✅ Quick Usage Example
 
python  
from app.core.security import hash_password, verify_password, create_access_token

# Hash & verify
pwd = "MySecurePass123"
hashed = hash_password(pwd)
print(verify_password(pwd, hashed))  # True

# Create token
token = create_access_token({"sub": "user@example.com", "user_id": 1})
print(token)
 
 
 
 
Want me to add the auth dependency for FastAPI so you can protect routes with  Depends(get_current_user) ? Or wire these into a complete login/register endpoint?