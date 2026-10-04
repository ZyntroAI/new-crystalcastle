ได้เลยครับ ✅ เพิ่ม Fuzzy Search ด้วย  thefuzz  ให้ตรวจจับคำคล้าย/ผิดพิมพ์ได้ พร้อมเก็บคะแนนความตรงกับ 🔍✨
 
 
 
markdown  
---
title: API Search Tool
version: 1.1.0
status: active
category: backend
tags:
  - zyntroai
  - api
  - search
  - fuzzy-search
  - query
  - pagination
  - filtering
created: 2026-10-04
language: th-TH
repository: ZyntroAI/new-crystalcastle
dependencies:
  - thefuzz>=0.20.0
---

# 🔍 API Search Tool — Fuzzy Search พร้อมระบบเดิม

## 📋 อัปเดตใหม่
- ✅ **Fuzzy Search** — ยอมรับคำผิดพิมพ์/สะกดคล้าย
- ✅ ปรับแต่งค่าความคล้ายได้ (`fuzzy_threshold`)
- ✅ เรียงตามคะแนนความตรงกับเป็นอันดับแรก
- ✅ ทำงานร่วมกับกรอง/ช่วงเวลา/แบ่งหน้าเดิมได้สมบูรณ์

---

## 📦 ติดตั้งก่อนใช้
```bash
pip install thefuzz
# หรือ requirements.txt
echo "thefuzz>=0.20.0" >> requirements.txt
 
 
 
 
🧱 Models (อัปเดต)
 
python  
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
 
 
 
 
🔌 Endpoint (อัปเดตแบบเต็ม)
 
python  
@app.post("/api/items/search", response_model=SearchResult)
def search_items(
    query: SearchQuery,
    current_user: User = Depends(get_current_user)
):
    # 🔒 เฉพาะรายการของผู้ใช้
    results = [i for i in items_db if i.owner_id == current_user.id]

    # ─── 1. ค้นหาแบบ Fuzzy ───
    scored = []
    if query.q:
        kw = query.q.lower()
        for item in results:
            # คำนวณคะแนนความคล้าย
            score_title = fuzz.partial_ratio(kw, item.title.lower())
            score_desc = fuzz.partial_ratio(kw, (item.description or "").lower())
            score = max(score_title, score_desc)

            if score >= query.fuzzy_threshold:
                scored.append({"item": item, "score": score})
        # แทนที่ results ด้วยรายการที่มีคะแนน
        results_scored = scored
    else:
        # ไม่มีคำค้นหา → ทุกรายการ คะแนนเต็ม 100
        results_scored = [{"item": i, "score": 100} for i in results]

    # ─── 2. กรองสถานะ ───
    if query.status:
        results_scored = [
            r for r in results_scored
            if r["item"].status == query.status
        ]

    # ─── 3. กรองช่วงวันที่ ───
    if query.created_after:
        try:
            after = datetime.strptime(query.created_after, "%Y-%m-%d")
            results_scored = [
                r for r in results_scored
                if r["item"].created_at
                and datetime.fromisoformat(r["item"].created_at) >= after
            ]
        except ValueError:
            pass

    if query.created_before:
        try:
            before = datetime.strptime(query.created_before, "%Y-%m-%d")
            results_scored = [
                r for r in results_scored
                if r["item"].created_at
                and datetime.fromisoformat(r["item"].created_at) <= before
            ]
        except ValueError:
            pass

    # ─── 4. เรียงลำดับ ───
    reverse = query.sort_order == "desc"
    if query.sort_by == "relevance":
        # ความตรงกับมากไปน้อย
        results_scored.sort(key=lambda r: r["score"], reverse=reverse)
    else:
        # เรียงตามฟิลด์ปกติ
        results_scored.sort(
            key=lambda r: getattr(r["item"], query.sort_by) or "",
            reverse=reverse
        )

    # ─── 5. แบ่งหน้า ───
    total = len(results_scored)
    start = (query.page - 1) * query.limit
    page_scored = results_scored[start : start + query.limit]

    # แปลงเป็นผลลัพธ์พร้อมคะแนน
    return SearchResult(
        total=total,
        page=query.page,
        limit=query.limit,
        total_pages=(total + query.limit - 1) // query.limit,
        items=[
            SearchResultItem(
                score=r["score"],
                title=r["item"].title,
                description=r["item"].description,
                status=r["item"].status,
                created_at=r["item"].created_at,
                owner_id=r["item"].owner_id,
                # ... ฟิลด์อื่นๆ
            )
            for r in page_scored
        ]
    )
 
 
 
 
📝 ตัวอย่างเรียกใช้
 
bash  
curl -X POST /api/items/search \
  -H "Content-Type: application/json" \
  -d '{
    "q": "เอกสร",
    "fuzzy_threshold": 65,
    "sort_by": "relevance",
    "page": 1,
    "limit": 10
  }'
 
 
ผลลัพธ์:
 
json  
{
  "total": 8,
  "page": 1,
  "limit": 10,
  "total_pages": 1,
  "items": [
    {
      "score": 92,
      "title": "เอกสารรายงานประจำเดือน",
      "status": "done"
    },
    {
      "score": 78,
      "title": "เอกสารประกอบการประชุม",
      "status": "in_progress"
    }
  ]
}
 
 
 
 
⚙️ คำแนะนำค่า  fuzzy_threshold 
 
- 85–100 → ตรงเป๊ะ ส่วนต่างน้อยมาก
- 70–84 → ยอมผิดพิมพ์เล็กน้อย (ค่าเริ่มต้น)
- 55–69 → คล้ายกันมาก อาจได้ผลลัพธ์เยอะ
- <55 → ได้เยอะมาก อาจไม่เกี่ยวข้อง
 
 
 
ต้องการปรับอะไรต่อไหมครับ — เช่น เลือกอัลกอริทึม ( ratio / partial_ratio / token_sort_ratio ), เพิ่มน้ำหนักให้ชื่อมากกว่าคำอธิบาย, หรือ รองรับภาษาไทยแบบเฉพาะ? 🚀✨