# 🛠️ Tools — ดัชนีเครื่องมือและไฟล์อ้างอิง

**อัปเดต:** 2026-09-24 • **หมวด:** 4 • **สถานะ:** ✅ พร้อมใช้งาน

ดัชนีไฟล์เครื่องมือและเอกสารอ้างอิงที่อยู่ระดับ root ของ repo นี้
ทุกไฟล์ในตารางมีอยู่จริง — ถ้าย้ายหรือลบไฟล์ ต้องอัปเดตตารางนี้ด้วย

---

## 📋 ทะเบียนไฟล์

| ไฟล์ | ใช้ทำอะไร | ชนิด |
|---|---|---|
| [`files_purpose_sheet_20260808_111802_generated_by_zyntromedia.csv`](files_purpose_sheet_20260808_111802_generated_by_zyntromedia.csv) | อธิบายหน้าที่ของไฟล์แต่ละไฟล์ในโปรเจกต์ | ตาราง CSV |
| [`Sheet_07092026.csv`](Sheet_07092026.csv) | ทะเบียน workflow — component / trigger / purpose | ตาราง CSV |
| [`anydo-schema.ts`](anydo-schema.ts) | Type schema งานแบบ Anydo (Priority, Task, Project) พร้อมใช้กับ React/TS | TypeScript |
| [`PROMPT_TEMPLATE.txt.md`](PROMPT_TEMPLATE.txt.md) | เทมเพลต prompt สำหรับ agent สรุปโน้ตวิชาการ (NotebookLM) | เทมเพลต |
| [`commitmessage.md`](commitmessage.md) | แนวทางเขียน commit message | คู่มือ |
| [`writing-block.md`](writing-block.md) | บล็อกการเขียน | คู่มือ |

---

## 🗂️ หมวดเครื่องมือ

### 📊 ทะเบียนและตาราง
- `files_purpose_sheet_*.csv` — แหล่งอ้างอิงว่าไฟล์ไหนทำหน้าที่อะไร
- `Sheet_07092026.csv` — ภาพรวม workflow ทั้ง repo

### 🧩 Schema และชนิดข้อมูล
- `anydo-schema.ts` — โมเดลงาน ถ้าจะต่อ UI หรือ DB ให้เริ่มจากไฟล์นี้

### 📝 เทมเพลตและแนวทางเขียน
- `PROMPT_TEMPLATE.txt.md` — เทมเพลต prompt
- `commitmessage.md` — รูปแบบ commit
- `writing-block.md` — แนวทางเขียนบล็อก

### ⚙️ กำหนดการทำงานและ CI
- ดู [`.github/workflows/`](.github/workflows/) — ไฟล์ workflow จริงของ CI
- ดู [`ci/`](ci/) — สคริปต์และงานที่เกี่ยวกับ CI

---

## 🔍 ค้นหาด่วน

| อยากได้อะไร | ไปที่ |
|---|---|
| เครื่องมือ MCP & AI | [knowledge-base/mcp-tools/README.md](knowledge-base/mcp-tools/README.md) |
| คลังความรู้ทั้งหมด | [knowledge-base/README.md](knowledge-base/README.md) |
| ทะเบียน skills | [skills/index.json](skills/index.json) |

---

## 📐 แนวปฏิบัติของไฟล์นี้

- **ทุกเส้นทางต้องมีไฟล์จริงอยู่จริง** — ลิงก์ที่ชี้ของที่ไม่มี ถือเป็นบั๊กของดัชนี ไม่ใช่ของปลายทาง
- **อัปเดตวันที่ทุกครั้งที่แก้**
- ไฟล์นี้เป็น *index* ไม่ใช่ *source of truth* — เนื้อหาจริงอยู่ในไฟล์ปลายทาง
