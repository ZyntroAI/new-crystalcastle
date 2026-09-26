# 📝 Obsidian REST API Integration

**อัปเดต:** 2026-09-26 • **ที่มา:** Dola AI Integrated Stack Technical Guide v1.0 (2026-09-07)

---

## 1. Plugin ที่ใช้

**Local REST API** สำหรับ Obsidian (ผู้พัฒนา: coddingtonbear)

| ค่า | ตั้งไว้ |
|---|---|
| Port | `27124` (ค่าเริ่มต้น) |
| Host | `127.0.0.1` (local เท่านั้น) |
| Authentication | Bearer token |
| Protocol | HTTPS พร้อม self-signed certificate |

---

## 2. Endpoints

**ตาราง 7-1: Obsidian REST API Endpoints**

| Method | Path | ทำอะไร |
|---|---|---|
| `GET` | `/vault/` | ดูข้อมูล vault |
| `GET` | `/vault/{path}` | อ่านเนื้อหาโน้ต |
| `POST` | `/vault/{path}` | สร้างหรืออัปเดตโน้ต |
| `PATCH` | `/vault/{path}` | แก้ไขบางส่วน |
| `DELETE` | `/vault/{path}` | ลบโน้ต |

---

## 3. Python Client

```python
import requests
from typing import Optional, Tuple

OBSIDIAN_URL = "https://127.0.0.1:27124"
API_KEY = "your-api-key-here"     # โหลดจาก env ไม่ใช่ hardcode
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "text/markdown"
}
VERIFY_SSL = False                # self-signed ภายในเครื่องเท่านั้น


def write_note(path: str, content: str) -> Tuple[int, dict]:
    res = requests.post(
        f"{OBSIDIAN_URL}/vault/{path}",
        headers=HEADERS,
        data=content,
        verify=VERIFY_SSL
    )
    return res.status_code, res.json()


def read_note(path: str) -> Optional[str]:
    res = requests.get(
        f"{OBSIDIAN_URL}/vault/{path}",
        headers=HEADERS,
        verify=VERIFY_SSL
    )
    return res.text if res.status_code == 200 else None
```

---

## 4. ความปลอดภัย

- **ห้ามเปิดสู่สาธารณะ** — เข้าถึงได้เฉพาะ local หรือผ่าน VPN
- **Token** — เก็บใน environment variable หรือ secret manager
- **CORS** — จำกัด origin เฉพาะ service ที่เชื่อถือได้
- **Access log** — บันทึกทุกการเข้าถึงไว้ที่ `Obsidian/Logs/API.md`

> ⚠️ `VERIFY_SSL = False` ปลอดภัยเฉพาะเมื่อต่อกับ `127.0.0.1`
> ถ้าเปลี่ยน host ไปที่อื่น ต้องเปิดการตรวจ certificate กลับ

---

## 5. บันทึกอะไรลง vault

| เนื้อหา | ที่เก็บ |
|---|---|
| Release notes | `Obsidian/Releases/<version>.md` |
| Incident log | `Obsidian/Logs/Incidents/<date>.md` |
| API access log | `Obsidian/Logs/API.md` |
| Knowledge base | `Obsidian/Knowledge/<topic>.md` |

---

## 6. อ่านต่อ

- Trace ที่เขียนลง log → [thread-model.md](thread-model.md)
- การจัดการ secret → [api-security.md](api-security.md)
