Cron Automation System - Backend
โครงสร้างโฟลเดอร์
backend/
├── main.py              # Entry point
├── config.py            # การตั้งค่า
├── database.py          # Database connection
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── requirements.txt     # Dependencies
├── .env                 # Environment variables
├── data/                # SQLite database folder
├── services/
│   ├── executor.py      # Script execution logic
│   └── scheduler.py     # APScheduler logic
└── routers/
    ├── workflows.py     # Workflow endpoints
    ├── jobs.py          # Cron job endpoints
    └── execution.py     # Execution logs endpoints
วิธีติดตั้งและรัน
1. สร้าง Virtual Environment
python -m venv venv
2. Activate Virtual Environment
Windows:
venvScriptsactivate
Mac/Linux:
source venv/bin/activate
3. ติดตั้ง Dependencies
pip install -r requirements.txt
4. รัน Server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
5. ทดสอบ API
Swagger UI: http://localhost:8000/docs
Health Check: http://localhost:8000/health
API Endpoints
Workflows
GET /api/workflows/ - ดึงรายการ workflows ทั้งหมด
POST /api/workflows/{id}/execute - รัน workflow ด้วยตนเอง
POST /api/workflows/{id}/toggle - เปิด/ปิด workflow
Cron Jobs
POST /api/jobs/{id}/execute - รัน job ด้วยตนเอง
POST /api/jobs/{id}/toggle - เปิด/ปิด job (อัปเดต scheduler แบบ real-time)
Execution Logs
GET /api/execution/logs?limit=50 - ดึงประวัติการรัน
หมายเหตุ
Database จะถูกสร้างอัตโนมัติที่ data/cronflow.db
Scheduler จะโหลด jobs ที่ active จาก database ตอน startup
การ toggle job จะเพิ่ม/ลบจาก scheduler ทันทีโดยไม่ต้องรีสตาร์ท
