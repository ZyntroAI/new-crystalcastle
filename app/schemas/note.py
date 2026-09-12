python
# app/schemas/note.py
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

class NoteMetadata(BaseModel):
    """Metadata ของไฟล์โน้ต Obsidian"""
    path: str = Field(..., description="Relative path ของไฟล์ใน Vault", example="projects/zyntro.md")
    size: int = Field(..., description="ขนาดของไฟล์ (Bytes)", example=1024)
    mtime: datetime = Field(..., description="เวลาที่มีการแก้ไขล่าสุด")
    tags: List[str] = Field(default_factory=list, description="รายการ Tags ที่สกัดได้จาก Markdown/Frontmatter")
    frontmatter: Dict[str, Any] = Field(default_factory=dict, description="ข้อมูล YAML Frontmatter ดิบ")

class NoteSummaryResponse(BaseModel):
    """Response Schema สำหรับรายการย่อ (ใช้กับ GET /obsidian/notes)"""
    path: str = Field(..., description="Relative path ของไฟล์โน้ต")
    title: str = Field(..., description="ชื่อหัวข้อหลัก หรือชื่อไฟล์")
    tags: List[str] = Field(default_factory=list, description="Tags ที่เกี่ยวข้อง")
    mtime: datetime = Field(..., description="เวลาที่แก้ไขล่าสุด")

    model_config = ConfigDict(from_attributes=True)

class NoteDetailResponse(BaseModel):
    """Response Schema สำหรับข้อมูลโน้ตฉบับเต็ม (ใช้กับ GET /obsidian/notes/{path})"""
    path: str = Field(..., description="Relative path ของไฟล์โน้ต")
    title: str = Field(..., description="ชื่อหัวข้อโน้ต")
    content: str = Field(..., description="เนื้อหา Markdown ดิบ")
    metadata: NoteMetadata = Field(..., description="รายละเอียด Metadata ของโน้ต")

    model_config = ConfigDict(from_attributes=True)

class NoteQueryParams(BaseModel):
    """Query Parameters สำหรับการค้นหาและกรองโน้ต"""
    tag: Optional[str] = Field(None, description="กรองเฉพาะโน้ตที่มี Tag ที่ระบุ")
    search: Optional[str] = Field(None, description="คำค้นหาในชื่อโน้ตหรือเนื้อหา")
    limit: int = Field(20, ge=1, le=100, description="จำนวนรายการสูงสุดต่อหน้า")
    offset: int = Field(0, ge=0, description="จำนวนรายการที่จะข้าม (Offset)")
