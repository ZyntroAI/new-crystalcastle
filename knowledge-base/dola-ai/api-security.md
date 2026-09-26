# 🔐 ความปลอดภัยของ API

**อัปเดต:** 2026-09-26 • **ที่มา:** Dola AI Integrated Stack Technical Guide v1.0 (2026-09-07)

---

## 1. ชั้นป้องกัน 6 ชั้น

ระบบใช้ defense in depth:

| # | ชั้น | ทำอะไร |
|---|---|---|
| 1 | **Authentication** | ยืนยันตัวตนด้วย JWT, API key หรือ OAuth 2.0 |
| 2 | **Authorization** | ควบคุมสิทธิ์ด้วย RBAC และ ABAC |
| 3 | **Data Protection** | เข้ารหัสระหว่างส่ง (TLS 1.3) และตอนเก็บ |
| 4 | **Input Validation** | ตรวจและทำความสะอาด input กัน injection |
| 5 | **Rate Limiting** | กันการใช้งานเกินและ DoS |
| 6 | **Monitoring** | บันทึกเหตุการณ์ความปลอดภัย เฝ้าความผิดปกติ |

---

## 2. วิธี Authentication

**JWT Flow**

```
1. Client ส่ง credentials → POST /token
2. Server ตรวจ แล้วคืน JWT ที่เซ็นแล้ว
3. Client แนบใน header:  Authorization: Bearer <token>
4. Server ตรวจลายเซ็นและวันหมดอายุทุก request
```

**API Key**

- ใช้สำหรับ server-to-server
- ส่งผ่าน header `X-API-Key`
- เก็บเป็นค่า hash เท่านั้น **ไม่เก็บ plain text**

---

## 3. Security Headers

Middleware ของ FastAPI ตั้ง header เหล่านี้:

| Header | ค่า |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |

---

## 4. Rate Limiting

ใช้ Redis:

- ค่าเริ่มต้น: **100 requests/นาที ต่อ client**
- ระบุ client ด้วย API key หรือ IP
- อัลกอริทึม: token bucket + sliding window
- คืน header: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## 5. Secret Management

| ที่เก็บ | ใช้กับ |
|---|---|
| GitHub Secrets | ตัวแปรใน CI/CD |
| ไฟล์ `.env` | **ห้าม commit เข้า Git** |
| HashiCorp Vault | production secret management |
| Environment variable (เข้ารหัส) | Obsidian REST API key |

> **กฎเหล็ก:** secret ห้ามอยู่ในโค้ด ห้ามอยู่ใน prompt ห้ามอยู่ใน log
> ถ้าเคย commit ไปแล้ว ถือว่ารั่ว — ต้อง rotate ไม่ใช่แค่ลบ

---

## 6. Monitoring ที่ต้องเฝ้า

- API response time และ error rate
- Authentication failure และ permission denied
- Rate limit violation
- System health และ resource utilization
- AI provider cost และ cache hit rate

แจ้งเตือน: Slack `#oncall` สำหรับ P1 • email สำหรับ P2

---

## 7. อ่านต่อ

- การเชื่อม Obsidian ที่ต้องใช้ token → [obsidian-integration.md](obsidian-integration.md)
- Docker และ CI/CD → [deployment.md](deployment.md)
