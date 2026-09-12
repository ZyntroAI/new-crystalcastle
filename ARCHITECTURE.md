ได้เลยครับ ✅ นี่คือ `ARCHITECTURE.md` ที่สรุปทุกอย่างที่เราทำวันนี้

### *`ARCHITECTURE.md`*
# Platform Architecture: Safe Deploy + Monetization

Up: [[README]]
Status: #active
Last Updated: 2026-04-08

## 1. Overview
แพลตฟอร์มนี้ถูกออกแบบให้ "Deploy เร็ว แต่ปลอดภัย" และ "Track รายได้จาก License ได้"
โดยใช้ 2 เสาหลัก: `Feature Flags` + `Telemetry + Billing`

## 2. Core Components

### A. Feature Flag System - Unleash
ใช้สำหรับเปิด-ปิดฟีเจอร์ และทำ Canary Deploy แบบปลอดภัย

| Component | Description |
| --- | --- |
| **Unleash Server** | `vars.UNLEASH_URL` - Centralized flag management |
| **Composite Action** | [[action: unleash-toggle]] - ใช้ toggle on/off/canary ซ้ำได้ทุก repo |
| **Canary Workflow** | [[Task: Feature Flag Canary]] - Auto 5% → 25% → 100% |
| **Rollback Guard** | `if: always()` + Auto Disable flag ถ้า smoke test fail |
| **Notification** | Slack #feature-flags เมื่อเกิด rollback |

**Flow: Canary Deploy**
```mermaid
graph TD
    A[Deploy v2 OFF] --> B[Enable 5%]
    B --> C{Smoke Test}
    C -->|Pass| D[Enable 25%]
    C -->|Fail| G[Rollback OFF]
    D --> E{Smoke Test}
    E -->|Pass| F[Enable 100%]
    E -->|Fail| G
    F --> H[Success Notify]
    G --> I[Verify Legacy] --> J[Failure Notify]
### B. Monetization & Telemetry System
ใช้สำหรับเก็บข้อมูลการใช้งาน และคิดเงินตามจำนวน User ที่ใช้จริง
Component	Description
**GitHub Marketplace**	ช่องทางขาย + จัดการ billing
**Telemetry Collector**	ส่ง `org_id`, `user_count` แบบ anonymous
**Workflow**	[[Task: License Users]] - รันทุกวัน เก็บลง DB
**Privacy**	[[PRIVACY.md]], [[DATA_REQUEST_TEMPLATE.md]] - GDPR Compliant
**Dashboard**	Grafana: MAU, Revenue, Churn
## 3. GitHub Actions Ecosystem
ทุกอย่างเป็น Reusable + Auditable
.github/
├── actions/
│   ├── unleash-toggle/     # Toggle Unleash Flag
│   ├── task-runner/        # Standard task wrapper
│   ├── notify/             # Slack/Email Notification
│   └── audit/              # บันทึกทุก action ลง log
├── workflows/
│   ├── generated/
│   │   ├── license-users.yml          # [[Task: License Users]]
│   │   └── feature-flag-canary.yml    # [[Task: Feature Flag Canary]]
│   └── reusable/
└── ISSUE_TEMPLATE/
    └── DATA_REQUEST_TEMPLATE.md
## 4. Secrets & Variables
ตั้งค่าที่ `Settings > Secrets and variables > Actions`
Type	Name	ใช้กับ
**Secret**	`UNLEASH_API_TOKEN`	Toggle Flag
**Secret**	`SLACK_BOT_TOKEN`	Notify
**Variable**	`UNLEASH_URL`	Unleash Server URL
**Variable**	`UNLEASH_PROJECT_ID`	default
**Variable**	`APP_URL`	Health check endpoint
## 5. Observability & Safety
1.  *Safety First*: ทุก workflow ที่มี rollback ต้องมี `if: always()`
2.  *Propagation Delay*: รอ 10-15s หลัง toggle flag ให้ SDK sync
3.  *Audit Trail*: ทุกการ toggle flag ถูก log ผ่าน [[action: audit]]
4.  *Health Check*: `/health` ต้องผ่านก่อนและหลัง rollback

## 6. How to Add New Feature
1.  สร้าง Flag ใน Unleash: `newFeature` default=OFF
2.  ใช้ [[action: unleash-toggle]] ใน workflow ของคุณ
3.  เรียก [[Task: Feature Flag Canary]] ผ่าน `workflow_dispatch`
4.  Monitor ที่ Dashboard + Slack

## 7. Roadmap
- [ ] [[Task: Database Migration Canary]]
- [ ] Grafana Dashboard รวม License + Feature Flag
- [ ] Auto-promote ตาม Error Rate < 0.1%
- [ ] Publish [[action: unleash-toggle]] เป็น Public Action

## 8. Contact
Platform Team: #platform-team 
On-call: PagerDuty Rotation

---

เอาไฟล์นี้ไปวางไว้ที่ root repo ได้เลยครับ

ตอนนี้คุณมี:
1.  `ARCHITECTURE.md` → ภาพรวมทั้งหมด
2.  `2 Tasks` → License + Canary
3.  `1 Composite Action` → unleash-toggle
4.  `Privacy + Template` → พร้อม Marketplace

อยากให้ผมเจน `mermaid diagram` เป็นรูป png ให้ด้วยไหมครับ หรือจะให้ทำ `Grafana Dashboard JSON` ต่อเลย?

✅ ปรับปรุง  ARCHITECTURE.md  — สมบูรณ์ ชัดเจน ครบทุกส่วน
 
อัปเดต: 2026-09-13 | รีโปเป้าหมาย: ZyntroAI/new-crystalcastle
เพิ่มเติม: แผนภาพ Mermaid เต็ม, โครงสร้างครบถ้วน, สอดคล้องกับ FIG/Agent Hub/API อัปโหลด
 
 
 
Platform Architecture: Safe Deploy + Monetization
 
Up: [[README]] | Status: #active | Last Updated: 2026-09-13
Related: [[FIG.jsx]], [[Agent Hub]], [[API: File Upload]]
 
 
 
📌 1. ภาพรวม (Overview)
 
แพลตฟอร์มออกแบบมาเพื่อ:
✅ Deploy เร็ว & ปลอดภัย: ใช้ Feature Flags + Canary Release + Rollback Guard
✅ วัดผล & รายได้: Telemetry + Billing + License Tracking
✅ ขยายได้: โมดูลาร์ — เชื่อม FIG.jsx (UI) ↔ Agent Hub (Core) ↔ Storage/Drive
 
🧠 แผนภาพสถาปัตยกรรม (Mermaid)
 
mermaid
  
graph TD
    %% ผู้ใช้ & ส่วนหน้า
    User[ผู้ใช้ / ไคลเอนต์] --> FIG[FIG.jsx: UI/แชท/อัปโหลด]
    
    %% ชั้นกลาง & ควบคุม
    FIG --> Gateway[API Gateway / Auth]
    Gateway --> Unleash[Unleash: Feature Flags]
    Gateway --> AgentHub[Agent Hub: AI Core/รันไทม์]
    
    %% บริการหลัก
    AgentHub --> Storage[Storage API: Drive/ไฟล์]
    AgentHub --> Telemetry[Telemetry Collector]
    AgentHub --> DB[(ฐานข้อมูล: ประวัติ/ใบอนุญาต)]
    
    %% CI/CD & ความปลอดภัย
    Unleash --> CI[GitHub Actions: SHA-pin/Canary]
    CI --> Slack[Slack: แจ้งเตือน/ตรวจสอบ]
    Telemetry --> Grafana[Grafana: แดชบอร์ดรายได้/สถานะ]
    
    %% สไตล์
    classDef front fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef core fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef infra fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    
    class FIG front
    class AgentHub,Unleash core
    class CI,Storage,Grafana infra
 
 
 
 
🧱 2. ส่วนประกอบหลัก (Core Components)
 
🚩 A. Feature Flag System — Unleash
 
วัตถุประสงค์: เปิด/ปิดฟีเจอร์, Canary Deploy, ย้อนกลับทันที
 
ส่วนประกอบ คำอธิบาย 
Unleash Server  vars.UNLEASH_URL  — จัดการส่วนกลาง 
Composite Action  unleash-toggle  — รีใช้ได้ทุกรีโป: on/off/เปอร์เซ็นต์ 
Canary Workflow ค่อยๆ ปล่อย: 5% → 25% → 100% 
Rollback Guard ทดสอบล้ม → ปิดอัตโนมัติ + แจ้งเตือน Slack 
Delay Sync รอ 10–15วินาที หลังเปลี่ยนค่า ให้ SDK ตรงกัน 
 
🔄 ขั้นตอน Canary Deploy
 
mermaid
  
graph LR
A[เริ่ม: v2 ปิด] --> B[เปิด 5%]
B --> C{ทดสอบควัน}
C -->|ผ่าน| D[เปิด 25%]
C -->|ล้ม| G[ย้อนกลับ ปิด]
D --> E{ทดสอบควัน}
E -->|ผ่าน| F[เปิด 100% ✅]
E -->|ล้ม| G
F --> H[แจ้งสำเร็จ]
G --> I[ตรวจสอบเดิม] --> J[แจ้งล้มเหลว]
 
 
💰 B. ระบบรายได้ & การวัดผล (Monetization)
 
วัตถุประสงค์: ติดตามผู้ใช้, คิดเงิน, ปกป้องข้อมูล
 
ส่วนประกอบ คำอธิบาย 
Marketplace GitHub — จัดการขาย/บิล/ใบอนุญาต 
Telemetry ส่ง  org_id ,  user_count  — ไม่ระบุตัวตน 
License Task รันทุกวัน → บันทึกผู้ใช้ลง DB 
ความเป็นส่วนตัว GDPR: [[PRIVACY.md]], [[เทมเพลตขอข้อมูล]] 
แดชบอร์ด Grafana: MAU, รายได้, อัตราการเลิกใช้ 
 
🤖 C. AI & ส่วนโต้ตอบ (FIG ↔ Agent Hub)
 
✅ สอดคล้องกับงานล่าสุด
 
ส่วนประกอบ บทบาท 
FIG.jsx v2.0 ส่วนหน้า: แชท, อัปโหลดไฟล์, ประวัติ, UI ปลอดภัย 
Agent Hub แกนกลาง: ประมวลผล LLM, สตรีม, ตัวเชื่อม, คิวงาน 
Storage API  /api/v1/storage/drive/upload  — รับไฟล์ → Google Drive 
 
 
 
⚙️ 3. GitHub Actions Ecosystem (รีใช้ได้ + ตรวจสอบ)
 
plaintext
  
.github/
├── actions/                # 🧩 แอคชันรวม
│   ├── unleash-toggle/     # เปลี่ยนสถานะฟีเจอร์
│   ├── task-runner/        # ห่องานมาตรฐาน
│   ├── notify/             # Slack/อีเมล
│   ├── audit/              # บันทึกทุกการกระทำ
│   └── security-scan/      # ตรวจไวรัส/ช่องโหว่
│
├── workflows/
│   ├── reusable/           # ♻️ ใช้ซ้ำได้
│   ├── generated/
│   │   ├── license-users.yml
│   │   ├── feature-flag-canary.yml
│   │   └── file-upload.yml  # ✅ เพิ่ม: ตรวจสอบอัปโหลด
│
└── ISSUE_TEMPLATE/
    ├── FEATURE_REQUEST.md
    ├── BUG_REPORT.md
    └── DATA_REQUEST_TEMPLATE.md
 
 
 
 
🔒 4. คีย์ & ตัวแปร (จัดการที่ Repo → Settings)
 
ประเภท ชื่อ ใช้ที่ 
Secret  UNLEASH_API_TOKEN  เปิด/ปิดฟีเจอร์ 
Secret  SLACK_BOT_TOKEN  แจ้งเตือน 
Secret  DRIVE_CREDENTIALS_JSON  อัปโหลด Google Drive ✅ 
Variable  UNLEASH_URL  Unleash Server 
Variable  UNLEASH_PROJECT_ID  โปรเจกต์เริ่มต้น 
Variable  APP_URL  ตรวจสุขภาพ 
 
 
 
📏 5. การสังเกต & ความปลอดภัย
 
1. Safety First: ทุกงานที่ย้อนกลับต้องมี  if: always() 
2. Propagation Delay: รอ 10–15วินาที หลังเปลี่ยน Flag
3. Audit Trail: ทุกการเปลี่ยนแปลงบันทึกผ่าน  action/audit 
4. Health Check:  /health  ต้องผ่านก่อน/หลังทำงาน
5. SHA-Pin: ทุก Action ปักคอมมิตเต็ม — ไม่ใช่แท็ก ❗✅
6. File Limits: ตรวจประเภท/ขนาดก่อนอัปโหลด ✅
 
 
 
🚀 6. วิธีเพิ่มฟีเจอร์ใหม่
 
1. สร้าง Flag: ใน Unleash →  newFeature  เริ่มปิด
2. ใช้ Action: เรียก  unleash-toggle  ใน Workflow
3. ปล่อยแบบคานารี: 5% → 25% → 100%
4. ตรวจสอบ: แดชบอร์ด + Slack + Log
5. เอกสาร: อัปเดต README + สถาปัตยกรรม
 
 
 
🛤️ 7. แผนการพัฒนา (Roadmap)
 
✅ FIG.jsx v2 + API อัปโหลดไฟล์
✅ Agent Hub Integration
📋 Task: Database Migration Canary
📊 Grafana รวม: Flag + License + Upload
🤖 Auto-promote: ถ้าข้อผิดพลาด < 0.1%
📜 เผยแพร่  unleash-toggle  เป็น Public Action
 
 
 
📞 8. ติดต่อ
 
- ทีมแพลตฟอร์ม:  #platform-team 
- รับผิดชอบ: PagerDuty Rotation
- รีโปหลัก: ZyntroAI/new-crystalcastle
 
 
 
📎 ไฟล์แนบที่เกี่ยวข้อง
 
✅ พร้อมวางในราก repo:
 
-  README.md 
-  SECURITY.md 
-  PRIVACY.md 
-  .github/workflows/feature-flag-canary.yml 
-  .github/workflows/license-users.yml 
-  .github/workflows/file-upload.yml  ✅
-  app/components/FIG.jsx 
-  backend/api/v1/storage/drive/upload.py 
 
 
 
ปรับปรุงเสร็จแล้วครับ:
 
- ✅ เพิ่มแผนภาพ Mermaid ชัดเจน
- ✅ ผสาน FIG.jsx + Agent Hub + API อัปโหลด
- ✅ โครงสร้างครบถ้วน, ตัวแปรปลอดภัย
- ✅ รองรับงานทดสอบ Google Drive Upload
 
ต้องการให้ผมส่ง:
 
1. 🖼️ รูป PNG แผนภาพ Mermaid (พร้อมดาวน์โหลด)
2. 📊 JSON แดชบอร์ด Grafana (Flag + License + Upload)
3. 📂 ไฟล์เต็ม ZIP พร้อมวางทับรีโปเลย?
 
บอกได้เลยครับ! 🚀📦🔐
