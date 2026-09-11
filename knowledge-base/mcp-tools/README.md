# 🧠 คลังเครื่องมือ MCP & AI — ดัชนีหลัก
**อัปเดต:** 2026-09-09 • **รวมทั้งหมด:** 40+ เครื่องมือ • **สถานะ:** ✅ พร้อมใช้งาน

---

## 🔎 ค้นหาด่วน
- 📢 **การตลาด & เนื้อหา** → โฆษณา, สร้างสรรค์, แคมเปญ
- 🧩 **พัฒนา & โค้ด** → GitHub, CI/CD, API, ความปลอดภัย
- 📊 **ข้อมูล & วิเคราะห์** → ฐานข้อมูล, แดชบอร์ด, ส่งออก
- 🔗 **การทำงานร่วมกัน** → Notion, Slack, ปฏิทิน, งาน
- 🤖 **แกนกลาง AI** → AgentMcp, LangChain, พร้อมต์

---

## 📂 เข้าถึงตามหมวดหมู่

### 📢 การตลาด & เนื้อหา
**[ดูรายการเต็ม →](category-marketing.md)**
- AdCreative AI • Google Ads • Meta Ads • Adpliot • A/B Testing

### 🧩 พัฒนา & โค้ด & ระบบ
**[ดูรายการเต็ม →](category-development.md)**
- GitHub/GitLab • Docker/K8s • API/GraphQL • Logging • Security

### 📊 ข้อมูล & ฐานข้อมูล & วิเคราะห์
**[ดูรายการเต็ม →](category-data.md)**
- Airtable • PostgreSQL/Redis • S3 • Dashboards • Search/RAG

### 🔗 การทำงานร่วมกัน & ประสิทธิภาพ
**[ดูรายการเต็ม →](category-collaboration.md)**
- Notion • Slack/Discord • Calendar/Task • Email/Drive • Notes

### 🤖 แกนกลาง AI & การประสานงาน
**[ดูรายการเต็ม →](category-ai-core.md)**
- AgentMcp • AgentMesh • LangChain • Gateway • Context/Memory

---

## 🛡️ มาตรฐานอ้างอิง
- ✅ **OWASP LLM Top10** — ปลอดภัยจากการฉีด/รั่วไหล
- ✅ **AST Tiering** — ระดับความน่าเชื่อถือ T1–T4
- ✅ **MCP Protocol** — โครงสร้างมาตรฐาน, บันทึกครบถ้วน

---

## 🗂️ โครงสร้างไฟล์
```
knowledge-base/mcp-tools/
├─ README.md                      # 🔗 ดัชนีรวม + ค้นหาด่วน
├─ category-marketing.md          # 📢 การตลาด & เนื้อหา
├─ category-development.md        # 🧩 พัฒนา & โค้ด & ระบบ
├─ category-data.md               # 📊 ข้อมูล & ฐานข้อมูล & วิเคราะห์
├─ category-collaboration.md      # 🔗 การทำงานร่วมกัน & ประสิทธิภาพ
├─ category-ai-core.md            # 🤖 แกนกลาง AI & การประสานงาน
├─ registry.yaml                  # 🗂️ แหล่งข้อมูลจริง (name/tier/permissions/redact)
├─ dashboard.html                 # 📊 Dashboard ค้นหา/กรอง (สร้างจาก registry.yaml)
├─ diagram-mcp-architecture.md    # 🗺️ คำอธิบายแผนภาพสถาปัตยกรรม MCP
└─ diagram-mcp-architecture.svg   # 🖼️ แผนภาพ Gateway → MCP Servers
```

---

## 🧰 เครื่องมือประกอบชุดนี้

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| [`registry.yaml`](./registry.yaml) | แหล่งข้อมูลจริงของเครื่องมือทั้งหมด — `name` · `tier` (T1–T4) · `permissions` · `redact` ป้อน dashboard และใช้ enforce scope ที่ gateway |
| [`dashboard.html`](./dashboard.html) | หน้าเดียวจบ ค้นหา + กรองตามหมวด/Tier พร้อมแสดงสิทธิ์และฟิลด์ที่ต้องปิดบัง (เปิดในเบราว์เซอร์ได้เลย) |
| [`diagram-mcp-architecture.md`](./diagram-mcp-architecture.md) | อธิบายเส้นทาง 4 ชั้น: AI Clients → MCP Gateway → MCP Servers → External |
| [`diagram-mcp-architecture.svg`](./diagram-mcp-architecture.svg) | แผนภาพสถาปัตยกรรม (ธีม terracotta-orange) |
