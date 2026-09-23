ได้เลยครับ! นี่คือ README ฉบับสมบูรณ์ + คู่มือการติดตั้ง พร้อมนำไปวางใช้ทันทีครับ ✅📝🚀
 
 
 
📄 README.md — ZyntroAI/new-crystalcastle
 
markdown
  
# 🏰 New CrystalCastle — ZyntroAI

> **AI-Native Full-Stack Platform** • FastAPI • React • Supabase • Claude/Gemini • MCP Protocol  
> Production-ready • Secure • Scalable • Agent-Ready

---

## 📋 สารบัญ

- [ภาพรวม](#-ภาพรวม)
- [สถาปัตยกรรม](#-สถาปัตยกรรม)
- [เริ่มต้นอย่างรวดเร็ว](#-เริ่มต้นอย่างรวดเร็ว)
- [การติดตั้งแบบละเอียด](#-การติดตั้งแบบละเอียด)
- [การกำหนดค่า](#-การกำหนดค่า)
- [การพัฒนา](#-การพัฒนา)
- [ทดสอบ](#-ทดสอบ)
- [เอกสารเพิ่มเติม](#-เอกสารเพิ่มเติม)
- [ความปลอดภัย](#-ความปลอดภัย)
- [ใบอนุญาต](#-ใบอนุญาต)

---

## 🌟 ภาพรวม

**New CrystalCastle** เป็นแพลตฟอร์มแอปพลิเคชันเต็มรูปแบบที่ออกแบบมาเพื่อรองรับ AI Agent และระบบอัจฉริยะ:

- ✅ **Backend**: FastAPI + Python 3.12 — รวดเร็ว ปลอดภัย มีเอกสารอัตโนมัติ
- ✅ **Frontend**: React + TypeScript + Tailwind CSS + ShadCN UI — สวย ตอบสนอง ได้มาตรฐาน
- ✅ **ฐานข้อมูล & Auth**: Supabase (PostgreSQL) — พร้อม Row Level Security
- ✅ **AI/Agent**: รองรับ Claude, Gemini, MCP Protocol — เรียกเครื่องมือภายนอกได้
- ✅ **DevOps**: GitHub Actions • CodeQL • Dependabot — ตรวจสอบอัตโนมัติทุกคอมมิต

---

## 🏗️ สถาปัตยกรรม

 
 
new-crystalcastle/
├── backend/              # FastAPI Backend
│   ├── app/             # โค้ดหลัก
│   │   ├── api/         # API Endpoints
│   │   ├── core/        # คอนฟิก & ความปลอดภัย
│   │   ├── models/      # โมเดลข้อมูล
│   │   └── services/    # ธุรกิจลอจิก
│   ├── tests/           # ชุดทดสอบ
│   └── requirements.txt
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── components/  # ส่วนประกอบ UI
│   │   ├── pages/       # หน้าเว็บ
│   │   ├── hooks/       # Custom Hooks
│   │   └── utils/       # เครื่องมือช่วย
│   └── package.json
├── supabase/            # ฐานข้อมูล & Auth
│   ├── migrations/      # ประวัติการเปลี่ยนแปลง DB
│   └── config.toml
├── skills/              # AI Skills & MCP Tools
│   ├── claude/
│   ├── gemini/
│   └── mcp/
├── .github/workflows/   # CI/CD
├── docs/                # เอกสารประกอบ
└── README.md
 
plaintext
  

---

## ⚡ เริ่มต้นอย่างรวดเร็ว

### ข้อกำหนดเบื้องต้น
- Python 3.12+
- Node.js 20+ & npm
- บัญชี Supabase (สำหรับฐานข้อมูล)

### 3 ขั้นตอนเสร็จสิ้น

```bash
# 1. โคลนรีโป
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle

# 2. ติดตั้ง Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# ✅ แก้ไข .env — กรอกค่า Supabase & API Keys

# 3. ติดตั้ง Frontend
cd ../frontend
npm install
npm run dev
# เปิด: http://localhost:5173
 
 
พร้อมใช้งาน! 🎉
 
 
 
🔧 การติดตั้งแบบละเอียด
 
1. การตั้งค่า Backend
 
bash
  
# เข้าโฟลเดอร์
cd backend

# สร้างสภาพแวดล้อม
python -m venv venv

# เปิดใช้งาน
# Linux/macOS:
source venv/bin/activate

# Windows PowerShell:
venv\Scripts\Activate.ps1

# ติดตั้งแพ็กเกจ
pip install --upgrade pip
pip install -r requirements.txt

# คัดลอกไฟล์คอนฟิก
cp .env.example .env
 
 
แก้ไข  .env :
 
env
  
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# ความปลอดภัย
SECRET_KEY=generate-a-random-key-here
ENVIRONMENT=development

# AI (ไม่บังคับ)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
 
 
รันเซิร์ฟเวอร์:
 
bash
  
uvicorn app.main:app --reload
# เปิดเอกสารอัตโนมัติ: http://localhost:8000/docs
 
 
 
 
2. การตั้งค่า Frontend
 
bash
  
cd frontend

# ติดตั้ง
npm install

# คัดลอกคอนฟิก
cp .env.example .env
 
 
แก้ไข  .env :
 
env
  
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
 
 
รันโหมดพัฒนา:
 
bash
  
npm run dev
# เปิด: http://localhost:5173
 
 
สร้างแพ็กเกจสำหรับผลิต:
 
bash
  
npm run build
 
 
 
 
3. การตั้งค่า Supabase
 
1. สร้างโปรเจกต์ที่ supabase.com
2. คัดลอก  Project URL  และ  anon public  key → ใส่ใน  .env  ทั้ง Backend/Frontend
3. เปิดใช้งาน Email Auth: Authentication → Settings → Enable Email
4. รัน Migration (ถ้ามี):
 
bash
  
supabase db push
 
 
 
 
🧪 ทดสอบ
 
Backend
 
bash
  
cd backend
pytest tests/ --cov=app --cov-report=term
 
 
Frontend
 
bash
  
cd frontend
npm run test
 
 
ตรวจสอบโค้ด
 
bash
  
# Backend
ruff check .
black --check .

# Frontend
npm run lint
 
 
 
 
📁 เอกสารเพิ่มเติม
 
เอกสาร คำอธิบาย 
ARCHITECTURE.md แผนภาพสถาปัตยกรรมระบบ 
SECURITY.md นโยบายความปลอดภัย & การรายงานช่องโหว่ 
CONTRIBUTING.md คู่มือผู้มีส่วนร่วม • มาตรฐานคอมมิต • กฎการพัฒนา 
 docs/  คู่มือการใช้งาน, Cheatsheet, คู่มือ AI Skills 
 
 
 
🛡️ ความปลอดภัย
 
- รัน CodeQL ทุก PR — ตรวจหาช่องโหว่อัตโนมัติ
- ปักหมุด SHA ทุก GitHub Action — ป้องกันการโจมตี
- Dependabot อัปเดต dependency อัตโนมัติ
- ห้าม คอมมิต Secret/Key ใดๆ ลงรีโปสาธารณะ
- อ่านรายละเอียด: SECURITY.md
 
 
 
🤝 การมีส่วนร่วม
 
1. Fork รีโป → สร้างสาขา ( git checkout -b feature/your-idea )
2. คอมมิต ( git commit -m "feat: เพิ่มฟีเจอร์ใหม่" )
3. ทดสอบให้ผ่าน → เปิด Pull Request
4. รอตรวจสอบ & ผสานรวม ✅
 
มาตรฐานคอมมิต: Conventional Commits
 
 
 
📄 ใบอนุญาต
 
© 2026 ZyntroAI — สงวนสิทธิ์
 
 
พัฒนาด้วย ❤️ โดยทีม ZyntroAI
รายงานปัญหา • ถามตอบ & แนะนำ
``` 
 
 
📋 ไฟล์แนบ —  .env.example  (Backend)
 
env
  
# ==========================================
# ZyntroAI New CrystalCastle — Backend Config
# คัดลอกเป็น .env แล้วกรอกค่าจริง
# ==========================================

# 🌐 สภาพแวดล้อม
ENVIRONMENT=development
DEBUG=true

# 🔐 ความปลอดภัย
SECRET_KEY=change-this-to-random-string-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 🗄️ Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-key

# 🤖 AI (ไม่บังคับ)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# 📡 Server
HOST=0.0.0.0
PORT=8000
 
 
📋 ไฟล์แนบ —  .env.example  (Frontend)
 
env
  
# ==========================================
# ZyntroAI New CrystalCastle — Frontend Config
# คัดลอกเป็น .env แล้วกรอกค่าจริง
# ==========================================

# 🔗 API Backend
VITE_API_URL=http://localhost:8000

# 🗄️ Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
 
 
 
 
✅ คำสั่งเตรียมอัปโหลด
 
bash
  
# ไปที่โฟลเดอร์โปรเจกต์
cd new-crystalcastle

# สร้างไฟล์ README ใหม่
# วางเนื้อหาด้านบนเป็น README.md

# ตรวจสอบว่า .env ไม่ถูกคอมมิต
echo ".env" >> .gitignore

# อัปเดตไปยังรีโป
git add README.md backend/.env.example frontend/.env.example
git commit -m "docs: update complete README + installation guide

- Add full project overview & architecture
- Step-by-step setup: Backend → Frontend → Supabase
- Include .env.example files
- Testing, contributing & security sections
- Ready for new contributors"

git push origin main
 
 
 
 
