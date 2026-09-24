# เริ่มต้นใช้งาน

คู่มือนี้พาจากการ clone ไปจนถึงระบบที่ตอบ request ได้

## สิ่งที่ต้องมี

- Python 3.11 ขึ้นไป
- PostgreSQL 14 ขึ้นไป
- `git`

## 1. Clone และเข้าโฟลเดอร์

```bash
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle
```

## 2. สร้าง virtual environment

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
```

## 3. ติดตั้ง dependencies ของ backend

ไฟล์ requirements ของ backend อยู่ที่ `backend/requirements.txt`

```bash
pip install -r backend/requirements.txt
```

!!! note
    ที่ root ของ repository ไม่มี `requirements.txt` อยู่ หลาย workflow ของ CI
    อ้างถึงไฟล์นั้น จึงทำให้ job ฝั่ง Python ล้มตั้งแต่ยังไม่เริ่มทำงาน
    ดูรายละเอียดที่ [การแก้ไขปัญหา](troubleshooting.md)

## 4. ตั้งค่า environment

```bash
cp .env.example .env
```

เปิด `.env` แล้วกำหนดอย่างน้อย `DATABASE_URL` และ `JWT_SECRET`
ห้าม commit ไฟล์นี้ — `.gitignore` ยกเว้นไว้ให้แล้ว

## 5. สตาร์ทเซิร์ฟเวอร์

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 6. ตรวจว่าระบบทำงาน

```bash
curl -s http://localhost:8000/health
```

ควรได้ผลลัพธ์:

```json
{"status": "healthy", "scheduler_running": true}
```

## 7. ดูเอกสารที่ FastAPI สร้างให้

FastAPI มีหน้าเอกสารแบบ interactive ให้ฟรี:

- Swagger UI — <http://localhost:8000/docs>
- ReDoc — <http://localhost:8000/redoc>

## ขั้นต่อไป

- [การตั้งค่า](configuration.md) — environment variable ที่สำคัญ
- [เอกสารอ้างอิง API](api-reference.md) — ทุก endpoint
