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