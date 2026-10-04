
import os
import shutil

base_dir = "/mnt/agents/output/fastapi-solo-backend"

# 1. AI Copilot / Companion Model
copilot_model = """from datetime import datetime
from sqlalchemy import String, Text, DateTime, func, Enum, Integer, Float, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum


class ActivityType(str, enum.Enum):
    # Entertainment
    MOVIE = "movie"           # ดูหนัง
    MUSIC = "music"           # ฟังเพลง
    GAME = "game"             # เล่นเกม
    READ = "read"             # อ่านหนังสือ
    PODCAST = "podcast"       # ฟัง podcast
    
    # Creative
    CREATE_ART = "create_art"       # สร้างผลงานศิลปะ
    WRITE = "write"                 # เขียน
    DESIGN = "design"               # ออกแบบ
    PHOTOGRAPHY = "photography"     # ถ่ายรูป
    VIDEO = "video"                 # ทำวิดีโอ
    
    # Travel
    TRAVEL = "travel"         # เที่ยว
    FOOD = "food"             # กิน
    HOTEL = "hotel"           # ที่พัก
    
    # Business
    SELL = "sell"             # ขายของ
    MARKETING = "marketing"   # การตลาด
    NEGOTIATE = "negotiate"   # ต่อรอง
    
    # Tech
    CODING = "coding"         # เขียนโค้ด
    BUILD_WEB = "build_web"   # ทำเว็บ
    AI_PROJECT = "ai_project" # โปรเจกต์ AI
    
    # Learning
    COURSE = "course"         # เรียนออนไลน์
    WORKSHOP = "workshop"     # เวิร์คช็อป
    STUDY = "study"           # อ่านหนังสือ/บทความ
    
    # Social
    MEETUP = "meetup"         # นัดเจอเพื่อน
    NETWORK = "network"       # สร้างเครือข่าย
    DATE = "date"             # เดท
    
    # Health
    EXERCISE = "exercise"     # ออกกำลังกาย
    MEDITATE = "meditate"     # นั่งสมาธิ
    SLEEP = "sleep"           # นอน
    
    # Finance
    INVEST = "invest"         # ลงทุน
    BUDGET = "budget"         # วางแผนการเงิน
    SIDE_HUSTLE = "side_hustle"  # ทำงานเสริม


class ActivityMood(str, enum.Enum):
    VERY_BAD = "very_bad"
    BAD = "bad"
    NEUTRAL = "neutral"
    GOOD = "good"
    VERY_GOOD = "very_good"
    AMAZING = "amazing"


class CopilotActivity(Base):
    __tablename__ = "copilot_activities"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    # กิจกรรม
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    activity_name: Mapped[str] = mapped_column(String(300), nullable=False)  # e.g., "ดูหนัง Dune Part 2"
    description: Mapped[str | None] = mapped_column(Text)
    
    # รายละเอียด
    duration_minutes: Mapped[int | None] = mapped_column(Integer)
    cost: Mapped[float | None] = mapped_column(Float)  # ค่าใช้จ่าย
    location: Mapped[str | None] = mapped_column(String(300))
    with_people: Mapped[str | None] = mapped_column(Text)  # ใครไปด้วย
    
    # ความรู้สึก
    mood_before: Mapped[str | None] = mapped_column(String(20))
    mood_after: Mapped[str | None] = mapped_column(String(20))
    energy_level: Mapped[int | None] = mapped_column(Integer)  # 1-10
    satisfaction: Mapped[int | None] = mapped_column(Integer)  # 1-10
    
    # AI Analysis
    ai_suggested: Mapped[bool] = mapped_column(default=False)  # AI แนะนำมาไหม
    ai_recommendation_id: Mapped[int | None] = mapped_column(Integer)  # ลิงก์กับ recommendation
    
    # ผลลัพธ์
    outcome: Mapped[str | None] = mapped_column(Text)  # ได้อะไรจากกิจกรรมนี้
    learnings: Mapped[str | None] = mapped_column(Text)  # สิ่งที่เรียนรู้
    would_repeat: Mapped[bool | None] = mapped_column(Boolean)  # อยากทำอีกไหม
    
    # Tags & Categories
    tags: Mapped[str | None] = mapped_column(Text)
    related_skills: Mapped[str | None] = mapped_column(Text)  # เชื่อมกับ skill build
    
    # Metadata
    extra_data: Mapped[dict | None] = mapped_column(JSON)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CopilotRecommendation(Base):
    __tablename__ = "copilot_recommendations"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    # แนะนำอะไร
    recommendation_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # movie, music, travel, business, etc.
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    
    # รายละเอียด
    category: Mapped[str | None] = mapped_column(String(100))  # e.g., "sci-fi", "action", "jazz"
    estimated_cost: Mapped[float | None] = mapped_column(Float)
    estimated_duration: Mapped[int | None] = mapped_column(Integer)  # นาที
    difficulty: Mapped[str | None] = mapped_column(String(20))  # easy, medium, hard
    
    # แหล่งที่มา / ลิงก์
    source_url: Mapped[str | None] = mapped_column(String(500))
    image_url: Mapped[str | None] = mapped_column(String(500))
    
    # AI Reasoning
    reason: Mapped[str | None] = mapped_column(Text)  # ทำไมถึงแนะนำ
    based_on_activities: Mapped[str | None] = mapped_column(Text)  # อิงจากกิจกรรมไหน
    based_on_mood: Mapped[str | None] = mapped_column(String(20))  # อิงจาก mood ไหน
    based_on_skills: Mapped[str | None] = mapped_column(Text)  # อิงจาก skill ไหน
    
    # สถานะ
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, accepted, rejected, completed
    user_feedback: Mapped[str | None] = mapped_column(Text)
    rating: Mapped[int | None] = mapped_column(Integer)  # 1-5
    
    # ผลลัพธ์
    activity_id: Mapped[int | None] = mapped_column(Integer)  # ถ้าทำแล้ว ลิงก์กับ activity
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class CopilotInsight(Base):
    __tablename__ = "copilot_insights"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    
    # ข้อมูลเชิงลึก
    insight_type: Mapped[str] = mapped_column(String(50), nullable=False)  # pattern, trend, suggestion, warning
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    
    # ข้อมูลสนับสนุน
    data_points: Mapped[int | None] = mapped_column(Integer)  # จำนวนกิจกรรมที่วิเคราะห์
    confidence_score: Mapped[float | None] = mapped_column(Float)  # 0-1
    
    # แนะนำต่อ
    suggested_action: Mapped[str | None] = mapped_column(Text)
    related_recommendation_id: Mapped[int | None] = mapped_column(Integer)
    
    # สถานะ
    is_read: Mapped[bool] = mapped_column(default=False)
    is_actioned: Mapped[bool] = mapped_column(default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
"""

with open(f"{base_dir}/app/models/copilot.py", "w") as f:
    f.write(copilot_model)

# Update models init
with open(f"{base_dir}/app/models/__init__.py", "w") as f:
    f.write("""from app.models.user import User
from app.models.contact import ContactForm
from app.models.news import NewsArticle, NewsTicker
from app.models.kpi import KPIDashboard, KPIDataPoint
from app.models.changelog import ChangelogEntry, ChangelogVersion
from app.models.roadmap import RoadmapItem, RoadmapMilestone
from app.models.skill import SkillBuild, SkillLog
from app.models.connection import PublicConnection, ConnectionActivity
from app.models.copilot import CopilotActivity, CopilotRecommendation, CopilotInsight

__all__ = [
    "User", "ContactForm", "NewsArticle", "NewsTicker",
    "KPIDashboard", "KPIDataPoint",
    "ChangelogEntry", "ChangelogVersion",
    "RoadmapItem", "RoadmapMilestone",
    "SkillBuild", "SkillLog",
    "PublicConnection", "ConnectionActivity",
    "CopilotActivity", "CopilotRecommendation", "CopilotInsight",
]
""")

print("Copilot model created")