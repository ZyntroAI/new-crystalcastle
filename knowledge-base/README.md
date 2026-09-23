# 📚 Knowledge Base — ดัชนีรวม

**อัปเดต:** 2026-09-12 • **หมวด:** 2 • **สถานะ:** ✅ พร้อมใช้งาน

คลังความรู้ของ repo นี้ — เอกสารอ้างอิง แคตตาล็อกเครื่องมือ และสื่อประกอบ (ไดอะแกรม/อินโฟกราฟิก)
จัดเป็นโฟลเดอร์ตามหัวข้อ แต่ละโฟลเดอร์มี `README.md` ของตัวเองเป็นดัชนีย่อย

---

## 🗂️ หมวดความรู้

### 🧠 เครื่องมือ MCP & AI
**[ดูรายการเต็ม →](mcp-tools/README.md)** — คลังเครื่องมือ MCP & AI 40+ รายการ
แบ่ง 5 หมวดย่อย: การตลาด & เนื้อหา · พัฒนา & โค้ด & ระบบ · ข้อมูล & ฐานข้อมูล & วิเคราะห์ ·
การทำงานร่วมกัน & ประสิทธิภาพ · แกนกลาง AI & การประสานงาน
พร้อมระดับความปลอดภัย T1–T4 (อ้างอิง OWASP LLM Top 10) จาก `registry.yaml` ซึ่งเป็นแหล่งข้อมูลจริง

- 📄 `README.md` — ดัชนีรวม + ค้นหาด่วน
- 📄 `category-*.md` — 5 หมวดย่อย
- 🗂️ `registry.yaml` — แหล่งข้อมูลจริง (name/tier/permissions/redact)
- 📊 `dashboard.html` — Dashboard ค้นหา/กรอง (สร้างจาก registry.yaml)
- 🗺️ `diagram-mcp-architecture.svg` + `.md` — แผนภาพสถาปัตยกรรม Gateway → MCP Servers

### 🎮 Steam Web API — REST API Performance
**[ดูรายละเอียดเต็ม →](steam-web-api/README.md)** — ชุดอินโฟกราฟิกสรุปงานค้นคว้าเรื่อง
Steamlink / Steam Web API ในมุมประสิทธิภาพของ REST API พร้อมการเปรียบเปรยกับกระบวนการ
Root Canal (รักษารากฟัน): *ขจัดจุดอ่อน → เติมกลไกใหม่ → คืนพลังให้ระบบ*

- 🖼️ `steam-web-api-root-canal-infographic.html` — ต้นฉบับ SVG/HTML 16:9 (ฟอนต์ไทยฝังในไฟล์ เปิดออฟไลน์ได้)
- 🖼️ `steam-web-api-root-canal-infographic-1920x1080.png` — PNG สำหรับสไลด์/เว็บ
- 🖼️ `steam-web-api-root-canal-infographic-3840x2160.png` — PNG 4K สำหรับพิมพ์/ฉาย
- 🐍 `build_infographic.py` — สคริปต์สร้าง SVG ใหม่ (แก้ข้อความ/สี/เลย์เอาต์ได้)
- 📄 `README.md` — เอกสารประกอบ เนื้อหาบนภาพ และวิธีสร้างใหม่

---

## 🔍 ค้นหาด่วน

| อยากได้อะไร | ไปที่ |
|---|---|
| เครื่องมือ MCP สำหรับงานการตลาด | [mcp-tools/category-marketing.md](mcp-tools/category-marketing.md) |
| เครื่องมือสำหรับ CI/CD, Docker, Security | [mcp-tools/category-development.md](mcp-tools/category-development.md) |
| ระดับความปลอดภัยของแต่ละเครื่องมือ | [mcp-tools/registry.yaml](mcp-tools/registry.yaml) |
| แผนภาพสถาปัตยกรรม MCP | [mcp-tools/diagram-mcp-architecture.svg](mcp-tools/diagram-mcp-architecture.svg) |
| แนวปฏิบัติ REST API ประสิทธิภาพสูง | [steam-web-api/README.md](steam-web-api/README.md) |
| อินโฟกราฟิกสำหรับรายงาน/สไลด์ | [steam-web-api/](steam-web-api/) |

---

## 📐 แนวปฏิบัติของคลังนี้

- **แหล่งข้อมูลจริงต้องชัดเจน** — ข้อมูลที่เครื่องอ่านได้ (เช่น `registry.yaml`) เป็น source of truth
  เอกสาร Markdown และสื่อประกอบสร้าง/อ้างจากแหล่งนั้น ไม่ใช่ทางกลับกัน
- **สื่อประกอบเป็นไฟล์ที่แก้ไขได้** — ไดอะแกรมและอินโฟกราฟิกเก็บเป็น SVG/HTML ต้นฉบับ
  ไม่ใช่แค่ภาพแบน ช่วยให้แก้ข้อความ/สีได้โดยไม่ต้องวาดใหม่
- **สองภาษา** — เนื้อหาและ UI ใช้ภาษาไทย โดยคงศัพท์เทคนิคเป็นภาษาอังกฤษ
- **อ้างแหล่งที่มาเสมอ** — ทุกเอกสารระบุที่มาและวันที่อัปเดต

---

## 🗂️ โครงสร้างโฟลเดอร์

```
knowledge-base/
├─ README.md                          # 📚 ดัชนีรวม (ไฟล์นี้)
├─ mcp-tools/                         # 🧠 คลังเครื่องมือ MCP & AI
│  ├─ README.md                       #    ดัชนีรวม + ค้นหาด่วน
│  ├─ category-{marketing,development,data,collaboration,ai-core}.md
│  ├─ registry.yaml                   #    แหล่งข้อมูลจริง
│  ├─ dashboard.html                  #    Dashboard ค้นหา/กรอง
│  └─ diagram-mcp-architecture.{md,svg}
└─ steam-web-api/                     # 🎮 Steam Web API — REST API Performance
   ├─ README.md                       #    เอกสารประกอบ
   ├─ steam-web-api-root-canal-infographic.{html,png}
   ├─ build_infographic.py            #    สคริปต์สร้างใหม่
   └─ NotoSansThai.ttf                #    ฟอนต์ที่ฝังใน HTML (OFL 1.1)
```

> **หมายเหตุ:** `docs/` เก็บเอกสารงานที่ยังดำเนินอยู่ (guidelines, runbook, agreement)
> ส่วน `knowledge-base/` เก็บเอกสารอ้างอิงที่นิ่งแล้ว — ทั้งคู่มี README/index ของตัวเอง
