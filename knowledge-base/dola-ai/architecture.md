# 🏗️ สถาปัตยกรรม & บทบาท

**อัปเดต:** 2026-09-26 • **ที่มา:** Dola AI Integrated Stack Technical Guide v1.0 (2026-09-07)

---

## 1. System Flow

สแต็กเชื่อม 4 องค์ประกอบหลักเข้าด้วยกัน โดยมี Dola AI เป็นตัวประสาน:

```
GitHub ←→ Dola AI (5 Roles) ←→ Obsidian Vault ←→ FastAPI Backend ←→ AI Providers
   ↓ PR/Issue/Release      ↓ Docs/Logs/KB       ↓ Auth/API/DB       ↓ Cost/Performance
```

| เส้นทาง | สิ่งที่ไหลผ่าน |
|---|---|
| GitHub ↔ Dola AI | PR, Issue, Release |
| Dola AI ↔ Obsidian | Docs, Logs, Knowledge base |
| Obsidian ↔ FastAPI | Auth, API, Database |
| FastAPI ↔ AI Providers | Cost, Performance |

---

## 2. องค์ประกอบ

**ตาราง 2-1: องค์ประกอบของระบบ**

| องค์ประกอบ | หน้าที่หลัก | เทคโนโลยี |
|---|---|---|
| Dola AI | PR review, issue triage, release, docs, oncall | GitHub Actions, Node.js, Python |
| Obsidian Vault | Knowledge base, documentation, templates, logs | Markdown, Local REST API, Dataview |
| FastAPI Backend | API layer, authentication, data, AI orchestration | Python, PostgreSQL, Redis, Prisma |
| AI Providers | LLM สำหรับ code generation และ analysis | GPT-6 Astra, Gemini Flash, Claude Fable 5.1 |

---

## 3. Dola AI 5 บทบาท

แต่ละบทบาททำงานกับ GitHub โดยตรง:

| # | บทบาท | หน้าที่ |
|---|---|---|
| 1 | **PR Manager** | Review PR, ตรวจ CI/CodeQL/coverage (≥80%), อนุมัติหรือปฏิเสธ, auto-merge เมื่อผ่านเกณฑ์ |
| 2 | **Issue Triager** | ติด label อัตโนมัติ, จัดลำดับความสำคัญ, assign ตามชนิด (bug, feature, docs, question) |
| 3 | **Release Manager** | จัดการ semantic versioning, สร้าง changelog, สร้าง release, sync release notes ไป Obsidian |
| 4 | **Docs Maintainer** | ตรวจ README, เช็คลิงก์, ให้เอกสารตรงเวอร์ชัน |
| 5 | **Oncall Bot** | เฝ้า Vercel deployment และ health endpoint, ส่ง Slack alert, log incident ไป Obsidian |

> **หมายเหตุ:** เกณฑ์ coverage ≥80% เป็นข้อกำหนดที่ PR Manager ใช้ตัดสิน —
> ถ้าโปรเจกต์ใช้เกณฑ์อื่น ต้องแก้ที่ตัวจัดการ ไม่ใช่ที่เอกสารนี้

---

## 4. ลำดับการทำงาน

```
Issue → Triager จัดหมวด/assign
          ↓
       PR Manager review + CI gate
          ↓ (อนุมัติ)
       Release Manager ออกเวอร์ชัน + changelog
          ↓
       Docs Maintainer ตรวจเอกสาร
          ↓
       Oncall Bot เฝ้า deploy
```

ทุกขั้นบันทึกลง Obsidian และส่ง trace ตาม Thread Model

---

## 5. อ่านต่อ

- การเลือกโมเดลสำหรับแต่ละบทบาท → [model-routing.md](model-routing.md)
- ความปลอดภัยของ API → [api-security.md](api-security.md)
- การ deploy → [deployment.md](deployment.md)
