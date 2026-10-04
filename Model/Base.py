from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from thefuzz import fuzz  # ✅ เพิ่มตรงนี้

class SearchQuery(BaseModel):
    q: Optional[str] = Field(None, description="คำค้นหา — รองรับ Fuzzy")
    status: Optional[str] = Field(None, description="กรองตามสถานะ: pending, in_progress, done")
    created_after: Optional[str] = Field(None, description="สร้างหลังวันที่: YYYY-MM-DD")
    created_before: Optional[str] = Field(None, description="สร้างก่อนวันที่: YYYY-MM-DD")
    sort_by: Literal["relevance", "title", "created_at", "status"] = "relevance"  # ✅ เพิ่ม relevance
    sort_order: Literal["asc", "desc"] = "desc"
    page: int = Field(1, ge=1, description="หน้าที่")
    limit: int = Field(20, ge=1, le=100, description="รายการต่อหน้า")
    fuzzy_threshold: int = Field(70, ge=0, le=100, description="ค่าความคล้ายขั้นต่ำ 0-100")  # ✅ เพิ่ม

class SearchResultItem(BaseModel):  # ✅ ห่อเพิ่มคะแนน
    score: int
    title: str
    description: Optional[str]
    status: str
    created_at: Optional[str]
    owner_id: str
    # ... ฟิลด์อื่นๆ ตาม Item

class SearchResult(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    items: List[SearchResultItem]  # ✅ ใช้แบบมีคะแนน
