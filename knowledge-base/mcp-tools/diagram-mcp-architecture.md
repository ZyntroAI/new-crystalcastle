# 🗺️ แผนภาพสถาปัตยกรรม MCP — Gateway → MCP Servers

แผนภาพแสดงเส้นทาง request จาก AI clients ผ่าน **MCP Gateway** ซึ่งเป็นจุดควบคุมความปลอดภัยจุดเดียว ไปยัง MCP Servers แต่ละหมวด แล้วออกไปยังระบบภายนอก

📎 **ไฟล์แผนภาพ:** [`diagram-mcp-architecture.svg`](./diagram-mcp-architecture.svg) (SVG — ธีม terracotta-orange, ใช้ได้ใน GitHub / Obsidian / เปิดในเบราว์เซอร์)

---

## 🔄 เส้นทางการไหล (4 ชั้น)

```
1 · AI Clients         →   2 · MCP Gateway       →   3 · MCP Servers      →   4 · External
─────────────────────────────────────────────────────────────────────────────────────────
Claude / IDE Agent          Auth                     📢 การตลาด                SaaS & APIs
CrystalCastleX Agent        Scope (ตาม Tier)         🧩 พัฒนา                 Datastores
Automation / Cron           Redaction                📊 ข้อมูล                Models & Runtimes
                            Audit / Rate-limit       🔗 ทำงานร่วมกัน
                                                     🤖 แกนกลาง AI
```

---

## 🛡️ MCP Gateway — จุดควบคุม 4 กลไก

| กลไก | หน้าที่ | เชื่อมกับ |
|---|---|---|
| **Auth** | ยืนยันตัวตนผู้เรียกและ token ก่อนถึง server | ทุก request |
| **Scope** | จำกัดสิทธิ์ตามระดับ Tier ของเครื่องมือนั้น | `registry.yaml` → `tier` |
| **Redaction** | ปิดบังคีย์/ข้อมูลลับก่อนบันทึกหรือส่งต่อ | `registry.yaml` → `redact` |
| **Audit / Rate-limit** | บันทึกทุกการเรียก + จำกัดอัตราการใช้งาน | OWASP LLM Top 10 |

> หลักการ: **T4 (Gateway/Auth) เป็นประตูเดียว** — ไม่มี client ต่อ MCP Server ตรง ๆ เพื่อให้ enforce scope และ redaction ได้ที่จุดเดียว

---

## 🎚️ ระดับความปลอดภัย (AST Tiering)

| Tier | ความหมาย | ตัวอย่างหมวด |
|---|---|---|
| **T1** | อ่านข้อมูลสาธารณะ | Todo, Team/HR, Doc/Note |
| **T2** | อ่านข้อมูลภายในองค์กร | Notion, Slack, ข้อมูลวิเคราะห์ |
| **T3** | เขียนข้อมูล / รันคำสั่ง | GitHub, Docker/K8s, Shell, Ads |
| **T4** | จัดการสิทธิ์และความปลอดภัย | MCP Gateway / Auth |

---

## 📂 ไฟล์ที่เกี่ยวข้อง

- [`registry.yaml`](./registry.yaml) — แหล่งข้อมูลจริง (source of truth) ของเครื่องมือทั้งหมด: `name` · `tier` · `permissions` · `redact`
- [`dashboard.html`](./dashboard.html) — หน้า dashboard ค้นหา/กรองได้ สร้างจาก `registry.yaml`
- [`README.md`](./README.md) — ดัชนีหลักของคลังเครื่องมือ

🔁 **[กลับหน้าหลัก](README.md)**
