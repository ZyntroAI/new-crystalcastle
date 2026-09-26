# 🚀 Deployment & Operations

**อัปเดต:** 2026-09-26 • **ที่มา:** Dola AI Integrated Stack Technical Guide v1.0 (2026-09-07)

---

## 1. Docker Deployment

FastAPI backend ทำเป็น container และจัดการด้วย docker-compose:

```yaml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: ${DATABASE_URL}     # จาก .env — ห้าม commit
      REDIS_URL: redis://cache:6379/0
    depends_on:
      - db
      - cache

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: skills_db

  cache:
    image: redis:7-alpine
```

> **แก้จากต้นฉบับ:** guide v1.0 เขียน `DATABASE_URL: [REDACTED]` ซึ่งไม่ใช่ค่า
> ที่รันได้ — ในไฟล์นี้ใช้ `${DATABASE_URL}` ให้ docker-compose อ่านจาก environment

---

## 2. CI/CD Pipeline

GitHub Actions 5 ขั้น:

| # | ขั้น | ทำอะไร |
|---|---|---|
| 1 | **Lint** | ตรวจ code style และ static analysis |
| 2 | **Test** | Unit test, integration test, ตรวจ coverage |
| 3 | **Build** | สร้าง Docker image และ push ขึ้น registry |
| 4 | **Security Scan** | CodeQL, dependency scan, container scan |
| 5 | **Deploy** | Deploy อัตโนมัติไป staging และ production |

**ข้อควรระวัง:** ทุก `uses:` ใน workflow ต้อง pin เป็น SHA 40 ตัว
ไม่ใช่ `@v4` — ไม่งั้น supply chain ไม่ปลอดภัย (ดู [api-security.md](api-security.md))

---

## 3. Secret Management

| ที่เก็บ | ใช้กับ |
|---|---|
| GitHub Secrets | ตัวแปรใน CI/CD |
| ไฟล์ `.env` | **ห้าม commit** |
| HashiCorp Vault | production secret management |
| Environment variable (เข้ารหัส) | Obsidian REST API key |

---

## 4. Monitoring & Alerting

เมตริกที่เฝ้า:

- API response time และ error rate
- Authentication failure และ permission denied
- Rate limit violation
- System health และ resource utilization
- AI provider cost และ cache hit rate

**การแจ้งเตือน:**
- P1 → Slack `#oncall`
- P2 → email

---

## 5. Checklist ก่อน deploy

- [ ] CI ทั้ง 5 ขั้นผ่าน
- [ ] ทุก action pin เป็น SHA 40 ตัว
- [ ] ไม่มี secret ในโค้ดหรือ log
- [ ] Health endpoint ตอบสนอง
- [ ] มี rollback path และทดสอบแล้ว
- [ ] Monitoring และ alerting ทำงาน

---

## 6. อ่านต่อ

- ความปลอดภัยของ secret → [api-security.md](api-security.md)
- Incident ที่ Oncall Bot จัดการ → [architecture.md](architecture.md)
