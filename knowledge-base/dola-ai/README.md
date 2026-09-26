# 🤖 Dola AI Integrated Stack — ดัชนีหลัก

**อัปเดต:** 2026-09-26 • **ไฟล์:** 8 • **สถานะ:** ✅ พร้อมใช้งาน
**ที่มา:** Dola AI Integrated Stack Technical Guide v1.0 (2026-09-07, Production-Ready)

Dola AI คือสแต็กที่รวม GitHub workflow, AI model orchestration, Obsidian knowledge
management และ FastAPI backend เข้าเป็นระบบเดียว เพื่อ automate งานใน SDLC
พร้อมมาตรฐานความปลอดภัยและควบคุมต้นทุน

---

## 🔎 ค้นหาด่วน

| อยากได้อะไร | ไปที่ |
|---|---|
| โครงสร้างระบบและ 5 บทบาท | [architecture.md](architecture.md) |
| เลือกโมเดลให้งาน | [model-routing.md](model-routing.md) |
| React state management | [use-scope-hook.md](use-scope-hook.md) |
| ความปลอดภัย API | [api-security.md](api-security.md) |
| Distributed tracing | [thread-model.md](thread-model.md) |
| เชื่อม Obsidian | [obsidian-integration.md](obsidian-integration.md) |
| Deploy และ monitoring | [deployment.md](deployment.md) |

---

## 🗺️ ภาพรวมสแต็ก

```
GitHub ←→ Dola AI (5 Roles) ←→ Obsidian Vault ←→ FastAPI Backend ←→ AI Providers
   ↓ PR/Issue/Release      ↓ Docs/Logs/KB       ↓ Auth/API/DB       ↓ Cost/Performance
```

| องค์ประกอบ | หน้าที่หลัก | เทคโนโลยี |
|---|---|---|
| Dola AI | PR review, issue triage, release, docs, oncall | GitHub Actions, Node.js, Python |
| Obsidian Vault | Knowledge base, docs, templates, logs | Markdown, Local REST API, Dataview |
| FastAPI Backend | API, auth, data, AI orchestration | Python, PostgreSQL, Redis, Prisma |
| AI Providers | Code generation และ analysis | GPT-6 Astra, Gemini Flash, Claude Fable 5.1 |

---

## 🚦 ลำดับการทำงาน

```
Issue → Triager จัดหมวด/assign
          ↓
       PR Manager review + CI gate (coverage ≥80%)
          ↓ อนุมัติ
       Release Manager ออกเวอร์ชัน + changelog
          ↓
       Docs Maintainer ตรวจเอกสาร
          ↓
       Oncall Bot เฝ้า deploy
```

ทุกขั้นบันทึกลง Obsidian และส่ง trace ตาม Thread Model

---

## 📐 แนวปฏิบัติของคลังนี้

- **แหล่งข้อมูลจริงต้องชัดเจน** — อ้างจาก technical guide v1.0 เท่านั้น
  ไม่เติมรายละเอียดที่ไม่มีในต้นฉบับ
- **1 ไฟล์ = 1 เรื่อง** — อ่านจบใน 2 นาที
- **สองภาษา** — เนื้อหาไทย คงศัพท์เทคนิคเป็นภาษาอังกฤษ
- **ระบุวันที่ของต้นฉบับ** — ทุกไฟล์บอกว่ามาจาก guide เวอร์ชันไหน

---

## ⚠️ ข้อควรระวัง

ต้นฉบับ v1.0 อ้างโมเดลที่ตรวจสอบไม่ได้จากเอกสารนี้ (Gemini 3.8 Flash,
Claude Fable 5.1, GPT-6 Astra) — ชื่อและสเปกเป็นไปตามต้นฉบับ
**ก่อนใช้จริงควรยืนยันชื่อโมเดลและราคากับผู้ให้บริการอีกครั้ง**

เอกสารต้นฉบับยังมีช่อง `DATABASE_URL: [REDACTED]` ซึ่งเป็นค่าที่ถูกปิดไว้ —
ใน [deployment.md](deployment.md) เปลี่ยนเป็นตัวแปรสภาพแวดล้อม ให้รันได้จริง
