# 🛠️ คู่มือการพัฒนา — New CrystalCastle

> ขั้นตอนการติดตั้ง รัน และส่งโค้ดเข้าโปรเจกต์

## ✅ ข้อกำหนด
- Node.js 20+ · npm 10+
- Python 3.11+
- Git

## 1️⃣ ติดตั้ง
```bash
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle

# Frontend
npm install

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # ใส่ค่า Supabase
