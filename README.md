## 🚀 เริ่มพัฒนา

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# แก้ค่าใน .env
uvicorn app.main:app --reload
# เปิด: http://localhost:8000/docs

