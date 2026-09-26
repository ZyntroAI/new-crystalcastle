# 🔭 Thread Model & Observability

**อัปเดต:** 2026-09-26 • **ที่มา:** Dola AI Integrated Stack Technical Guide v1.0 (2026-09-07)

---

## 1. แนวคิด

Thread Model ให้ distributed tracing ผ่าน **trace ID เดียว** ที่วิ่งผ่านทุก service,
ทุก log และทุกขั้นตอน ทำให้ตาม lifecycle ของ request, build, incident และ deployment ได้ครบ

---

## 2. Data Model

**Trace Object (ระดับงาน)**

```json
{
  "trace_id": "tr_01HXY8ZABC123DEF456",
  "thread_type": "deployment",
  "parent_id": null,
  "root_id": "tr_01HXY8ZABC123DEF456",
  "status": "active",
  "created_at": "2026-09-07T10:00:00+07:00",
  "source": "github_webhook",
  "owner": "team/devsecops",
  "context": {
    "repo": "org/project",
    "branch": "main",
    "env": "production"
  }
}
```

**Span Object (ชั้นงานย่อย)**

```json
{
  "span_id": "sp_001XYZ",
  "trace_id": "tr_01HXY8ZABC123DEF456",
  "name": "security_scan",
  "status": "pass",
  "start_time": "2026-09-07T10:00:01+07:00",
  "end_time": "2026-09-07T10:00:12+07:00",
  "duration_ms": 11000,
  "logs": ["Rule loaded", "Dependency check OK"],
  "error": null
}
```

---

## 3. กฎการตั้ง ID

| เรื่อง | กฎ |
|---|---|
| Prefix | `tr_` สำหรับ thread, `sp_` สำหรับ span |
| Body | Base32 หรือ Hex ยาว 16–24 ตัวอักษร |
| ความสุ่ม | สร้างด้วย cryptographic — ห้ามคาดเดาได้ (กัน enumeration) |

---

## 4. Header Propagation

ทุก service **ต้อง** ส่งต่อ header เหล่านี้:

```http
X-Trace-ID: tr_01HXY8ZABC123DEF456
X-Span-ID: sp_001XYZ
```

**ถ้า header หายไป** → service แรกที่รับ สร้าง trace ID ใหม่

> นี่คือจุดที่พลาดบ่อย: service กลางทางที่สร้าง trace ใหม่แทนที่จะส่งต่อ
> ทำให้ trace ขาดครึ่ง ควรตรวจว่าทุก hop propagate ครบ

---

## 5. รูปแบบการเก็บ

| ชนิดงาน | thread_type | ตัวอย่าง source |
|---|---|---|
| Deployment | `deployment` | `github_webhook` |
| PR Review | `pr_review` | `github_webhook` |
| Incident | `incident` | `vercel_alert` |
| Release | `release` | `github_webhook` |

เชื่อมกับ Obsidian โดยเขียน log ลง vault (ดู [obsidian-integration.md](obsidian-integration.md))

---

## 6. อ่านต่อ

- 5 บทบาทที่สร้าง trace → [architecture.md](architecture.md)
- Monitoring และ alerting → [deployment.md](deployment.md)
