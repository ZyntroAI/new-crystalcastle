<div align="center">

# 🏰 New CrystalCastle — ZyntroAI

**Monorepo แพลตฟอร์ม AI-native: FastAPI · React · Supabase · AI Agent Skills**

[![Repo](https://img.shields.io/badge/GitHub-ZyntroAI%2Fnew--crystalcastle-blue?style=flat-square&logo=github)](https://github.com/ZyntroAI/new-crystalcastle)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[เริ่มต้นอย่างรวดเร็ว](#-เริ่มต้นอย่างรวดเร็ว) •
[การกำหนดค่า](#-การกำหนดค่า) •
[โครงสร้าง](#-โครงสร้าง) •
[เอกสาร](#-เอกสาร) •
[การมีส่วนร่วม](#-การมีส่วนร่วม)

</div>

---

## 📋 สารบัญ

- [ภาพรวม](#-ภาพรวม)
- [โครงสร้าง](#-โครงสร้าง)
- [เริ่มต้นอย่างรวดเร็ว](#-เริ่มต้นอย่างรวดเร็ว)
- [การกำหนดค่า](#-การกำหนดค่า)
- [ทดสอบ](#-ทดสอบ)
- [เอกสาร](#-เอกสาร)
- [ความปลอดภัย](#-ความปลอดภัย)
- [การมีส่วนร่วม](#-การมีส่วนร่วม)
- [ใบอนุญาต](#-ใบอนุญาต)

---

## 🌟 ภาพรวม

**New CrystalCastle** เป็น monorepo ที่รวม backend (FastAPI), ส่วน UI (React),
ฐานข้อมูล (Supabase), ชุด AI Agent Skills และเอกสารทางวิศวกรรมไว้ในที่เดียว

| ส่วน | เทคโนโลยี | ตำแหน่ง |
|---|---|---|
| **Backend** | FastAPI + Python 3.12 (มีบริการฝั่ง Node เสริม) | `backend/` |
| **Frontend** | React + TypeScript + Vite + Tailwind + shadcn/ui | `src/`, `frontend/` |
| **ฐานข้อมูล & Auth** | Supabase (PostgreSQL · migrations · functions) | `supabase/` |
| **AI Skills** | ชุดสกิล + registry (`index.json`) | `skills/` |
| **Security** | CWE protection suites | `security/` |
| **Docs & Knowledge** | เอกสารทางวิศวกรรมและคลังอ้างอิง | `docs/`, `knowledge-base/` |
| **CI/CD** | GitHub Actions (30 workflows) | `.github/workflows/` |

---

## 🏗️ โครงสร้าง

```
new-crystalcastle/
├── backend/                 # FastAPI (Python) + บริการฝั่ง Node
│   ├── main.py              # entry point: app = FastAPI(...)
│   ├── routers/             # jobs · workflows ฯลฯ
│   ├── services/            # business logic
│   ├── models.py · Schemas.py
│   ├── requirements.txt
│   ├── server.js            # บริการฝั่ง Node
│   ├── containers/          # manifests สำหรับ Kubernetes
│   └── prisma/
├── frontend/                # คอมโพเนนต์ React (Tailwind + shadcn/ui)
│   ├── src/
│   └── api/
├── src/                     # แอป Vite/React หลัก (รันจาก root)
├── supabase/                # migrations · functions · config.toml
├── skills/                  # skill registry + ชุดสกิล
├── security/                # cwe1321 · cwe1333
├── knowledge-base/          # mcp-tools · steam-web-api
├── docs/                    # เอกสารทางวิศวกรรม (73 ไฟล์)
├── scripts/                 # สคริปต์จัดการ/ตรวจสอบ repo
├── .github/workflows/       # CI/CD pipelines
├── .env.example             # เทมเพลตคอนฟิกรวม
└── README.md
```

---

## ⚡ เริ่มต้นอย่างรวดเร็ว

### ข้อกำหนดเบื้องต้น

- Python 3.12+
- Node.js 20+ และ npm
- บัญชี Supabase — สร้างฟรีที่ [supabase.com](https://supabase.com)

### 1️⃣ Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# แก้ไข .env — ใส่ค่า SUPABASE_URL, SUPABASE_ANON_KEY, GROQ_API_KEY ของคุณ

uvicorn main:app --reload
```

API รันที่ `http://localhost:8000` และเอกสารอัตโนมัติที่ `http://localhost:8000/docs`

### 2️⃣ Frontend (React / Vite)

```bash
# รันจาก root ของ repo
npm install

cp .env.example .env
# แก้ไข .env — ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY

npm run dev
```

Vite dev server เปิดที่ `http://localhost:5173`

### 3️⃣ Supabase

1. เข้า [supabase.com/dashboard](https://supabase.com/dashboard) → สร้างโปรเจกต์ใหม่
2. ไปที่ **Project Settings → API** แล้วคัดลอกค่า:
   - `Project URL` → `SUPABASE_URL` (backend) และ `NEXT_PUBLIC_SUPABASE_URL` (root)
   - `anon public` → `SUPABASE_ANON_KEY` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → ใช้เฉพาะฝั่ง backend เท่านั้น ห้ามใส่ในฝั่ง frontend
3. เปิดใช้งาน **Authentication → Providers → Email**
4. นำเข้า schema จาก `supabase/migrations/`

---

## ⚙️ การกำหนดค่า

repo นี้ใช้ `.env.example` สองไฟล์ — คัดลอกเป็น `.env` แล้วเติมค่าจริง

### `backend/.env.example`

```env
# Server
PORT=8000
NODE_ENV=development
TRUST_PROXY_HOPS=1

# GitHub App
GITHUB_APP_ID=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=
GITHUB_PRIVATE_KEY_PATH=

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=

# Groq AI
GROQ_API_KEY=

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

### `.env.example` (root)

```env
# Application
APP_NAME="New Crystal Castle"
APP_ENV=production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
API_URL=https://your-domain.com/api

# Auth & Security
API_KEY=
API_SECRET=
JWT_SECRET=changeme_very_long_random_secret_here
REFRESH_TOKEN_SECRET=changeme_very_long_random_refresh_secret_here
DOLA_JWT_SECRET=

# Database
DATABASE_URL=

# AI Provider
AI_PROVIDER=openai

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

> ⚠️ ห้าม commit ไฟล์ `.env` — อยู่ใน `.gitignore` แล้ว

---

## 🧪 ทดสอบ

```bash
# Frontend / root
npm run lint          # eslint . --quiet
npm run typecheck     # tsc -p ./jsconfig.json
npm run build         # vite build

# ชุดสคริปต์จัดการ/ตรวจ repo
npm run scripts:verify    # ตรวจโครงสร้างไฟล์
npm run scripts:smoke     # smoke tests
npm run scripts:check     # verify + smoke
```

ชุดทดสอบฝั่ง backend อยู่ใน `backend/test/` และรันผ่าน `pytest` ภายในโฟลเดอร์ `backend/`

---

## 📚 เอกสาร

| ไฟล์ / โฟลเดอร์ | เนื้อหา |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | สถาปัตยกรรมแพลตฟอร์ม · feature flags · telemetry & billing |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | แนวทาง contribute · มาตรฐาน branch และ commit |
| [`SECURITY.md`](./SECURITY.md) | นโยบายความปลอดภัย · การแจ้งช่องโหว่ |
| [`CHANGELOG.md`](./CHANGELOG.md) | ประวัติการเปลี่ยนแปลง (อ้างเลข PR) |
| [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) | หลักปฏิบัติของชุมชน |
| [`docs/`](./docs) | เอกสารทางวิศวกรรม (workflows · pytest · signing commits ฯลฯ) |
| [`knowledge-base/`](./knowledge-base) | คลังอ้างอิงที่นิ่งแล้ว (mcp-tools · steam-web-api) |
| [`skills/`](./skills) | ชุด AI Agent Skills และ registry (`index.json`) |
| [`security/`](./security) | CWE protection suites (cwe1321 · cwe1333) |

ไฟล์ README ของแต่ละส่วน (`backend/Readme.md`, `supabase/Readme.md`, `knowledge-base/README.md`, `scripts/README.md`) อธิบายรายละเอียดเฉพาะส่วนนั้น ๆ

---

## 🛡️ ความปลอดภัย

- 🔐 ไฟล์ `.env` ถูก ignore ไว้ใน `.gitignore` — ห้าม commit คีย์ใด ๆ
- 🔁 ทุก GitHub Action ในเวิร์กโฟลว์ถูก pin ด้วย commit SHA
- 🔍 มี CodeQL และ dependency review ใน CI
- 🧰 มีชุดป้องกันช่องโหว่ใน `security/` (CWE-1321, CWE-1333)
- 📣 พบช่องโหว่? → อ่านขั้นตอนใน [`SECURITY.md`](./SECURITY.md)

---

## 🤝 การมีส่วนร่วม

```bash
# 1. สร้าง branch
git checkout -b fig/your-feature

# 2. commit ตามมาตรฐาน Conventional Commits
git commit -m "feat: คำอธิบายสั้น ๆ"

# 3. push แล้วเปิด PR เข้า main
git push -u origin fig/your-feature
```

ทุกการเปลี่ยนแปลงเข้า `main` ผ่าน Pull Request เท่านั้น — รายละเอียดเพิ่มเติมดูที่ [`CONTRIBUTING.md`](./CONTRIBUTING.md)

---

## 📄 ใบอนุญาต

MIT License — © 2026 ZyntroAI · ดูรายละเอียดที่ [`LICENSE`](./LICENSE)

<div align="center">

**ZyntroAI** — [GitHub](https://github.com/ZyntroAI) · [Issues](https://github.com/ZyntroAI/new-crystalcastle/issues) · [Discussions](https://github.com/ZyntroAI/new-crystalcastle/discussions)

</div>
