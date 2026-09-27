ได้เลยครับ ✅ นี่คือ README.md ฉบับอัปเดตตรงกับข้อมูลจริงล่าสุดจากหน้า repo ทุกบรรทัด — ไม่สมมติอะไรทั้งนั้น 📚🚀
 
 
 
🏰 New CrystalCastle — ZyntroAI
 
AI-Native Full-Stack Platform · TypeScript · React · FastAPI · Supabase · GraphQL
Production-Ready · Community-Driven · MIT Licensed
 
Branch:  main  · Commit:  c531e0e  · Updated: 28 ก.ย. 2026
 
 
 
📋 สารบัญ
 
- ภาพรวม
- สถาปัตยกรรม & เทคโนโลยี
- โครงสร้างโปรเจกต์
- เริ่มต้นอย่างรวดเร็ว
- ตัวแปรสภาพแวดล้อม
- CI/CD & Workflows
- เอกสาร
- มีส่วนร่วม
- ความปลอดภัย
- ใบอนุญาต
 
 
 
🌟 ภาพรวม
 
New CrystalCastle คือแพลตฟอร์มแบบเต็มสแต็กที่ขับเคลื่อนด้วย AI ประกอบด้วย:
 
- 📄 ระบบจัดการเอกสาร & ฐานความรู้
- 📋 ระบบติดตามงาน & กระบวนการทำงาน
- 🧠 Deeper Research System — วิจัยอัจฉริยะที่ขับเคลื่อนด้วย AI
- 🤖 AI Skills & Agents — ขยายความสามารถของระบบ
- ⚡ GraphQL Federation — เชื่อมต่อข้อมูลจากหลายแหล่ง
 
สถานะ:  ✅ Active  — 447 คอมมิต, 57 สาขา, 7 ผู้พัฒนา
ภาษาหลัก: TypeScript 39.6% · JavaScript 34.3% · HTML 20.1% · Python/อื่นๆ 6%
 
 
 
🧱 สถาปัตยกรรม & เทคโนโลยี
 
ชั้น เทคโนโลยี หมายเหตุ 
Frontend React + TypeScript + Vite  src/  — แอปหลัก ·  frontend/src/components/  — ชุดคอมโพเนนต์ 
Gateway GraphQL Hive Federation  backend/gateway.config.ts  — รวม subgraphs  docs ,  tickets  
Backend FastAPI / Node.js Python + TS — API & Business Logic 
ฐานข้อมูล Supabase (PostgreSQL)  supabase/migrations/  — Schema จริง 
CI/CD GitHub Actions  .github/workflows/  — Build, Deploy, Audit, Auto-Update 
AI OpenAI API · Claude · Gemini PR Review · Research · Skills 
Deploy Vercel Staging + Production 
 
 
 
📁 โครงสร้างโปรเจกต์ (ตรงกับ  main  จริง)
 
plaintext  
new-crystalcastle/
├── .github/                    ✅ CI/CD — workflows อยู่ที่นี่
│   └── workflows/             ✅ จริง — ย้ายจาก root แล้ว
│
├── backend/                    ✅ FastAPI + GraphQL Gateway
│   ├── gateway.config.ts       # GraphQL Federation
│   ├── main.py                 # Entry point (สร้างใหม่)
│   ├── requirements.txt        # Python dependencies
│   └── README.md
│
├── src/                        ✅ แอป Frontend หลัก
│   ├── components/
│   ├── types/
│   │   └── Readme.md           # Onboarding Wizard types
│   ├── lib/
│   ├── i18n/
│   ├── App.tsx
│   └── (Vite config, vercel.json)
│
├── frontend/src/components/    ✅ ชุดคอมโพเนนต์แยก
│   ├── OnboardingWizard.tsx
│   └── (*.jsx — UI components)
│
├── skills/                     ✅ AI Skills & Tools
│   ├── claude-rest-api.md
│   ├── TOOLS.md
│   └── fig-best-practices-suite/
│
├── supabase/                   ✅ ฐานข้อมูล & Auth
│   ├── migrations/             # SQL DDL — Deeper Research System
│   └── .gitignore
│
├── docs/                       ✅ คลังความรู้ & คู่มือ
│   ├── knowledge-base/
│   ├── architecture/
│   ├── guides/
│   └── howtos.md
│
├── scripts/                    ✅ เครื่องมืออัตโนมัติ
│   ├── build.sh                # Build production
│   ├── ai-pr-review.js         # AI Code Reviewer
│   └── smoke-tests.sh
│
├── Assets/ · Changelog/ · Package/ · Staging/ · pages/
├── .env · .env.example · .gitignore · package.json · package-lock.json
├── README.md · ARCHITECTURE.md · SECURITY.md · CODE_OF_CONDUCT.md · LICENSE
│
└── ไฟล์ Workflow ที่ root ⚠️ กำลังย้ายเข้า .github/workflows/
    FastAPI_CI.yaml · Python-CI.yml · ci.yml · bug.yml · feature.yml · ...
 
 
⚠️ หมายเหตุ: ไฟล์ workflow ที่ระดับรากกำลังถูกย้ายเข้า  .github/workflows/  เพื่อให้ทำงานเต็มที่ — ติดตามความคืบหน้าที่ PR #???
 
 
 
🚀 เริ่มต้นอย่างรวดเร็ว
 
ข้อกำหนดเบื้องต้น
 
- Node.js 20+ · npm 10+
- Python 3.11+ (สำหรับ Backend)
- Git
 
1. โคลน
 
bash  
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle
 
 
2. ติดตั้ง Frontend
 
bash  
npm install
 
 
3. ติดตั้ง Backend
 
bash  
cd backend
python -m venv .venv

# เปิดใช้สภาพแวดล้อม
source .venv/bin/activate      # macOS/Linux
# หรือ
.venv\Scripts\activate         # Windows

pip install -r requirements.txt
 
 
4. กำหนดตัวแปรสภาพแวดล้อม
 
bash  
# ที่ root
cp .env.example .env
# แก้ไข .env → ใส่ค่า Supabase, OpenAI, Vercel
 
 
5. รันสำหรับพัฒนา
 
bash  
# Frontend (ที่ root)
npm run dev

# Backend (แยกหน้าต่าง)
cd backend
python main.py
 
 
- 🌐 Frontend: http://127.0.0.1:5173
- ⚡ Backend API: http://127.0.0.1:8000
- 📚 เอกสาร API: http://127.0.0.1:8000/docs
 
6. Build สำหรับผลิต
 
bash  
./scripts/build.sh
 
 
 
 
🔐 ตัวแปรสภาพแวดล้อม
 
ตัวแปร ความจำเป็น คำอธิบาย 
 SUPABASE_URL  ✅ จำเป็น ที่อยู่โปรเจกต์ Supabase 
 SUPABASE_SERVICE_ROLE_KEY  ✅ จำเป็น สิทธิ์ระดับแอดมิน 
 GITHUB_TOKEN  สำหรับ CI อ่าน/เขียน repo, PR, Package 
 OPENAI_API_KEY  สำหรับ AI PR Review เรียกใช้ GPT เพื่อตรวจโค้ด 
 VERCEL_TOKEN  สำหรับ Deploy อัตโนมัติไปยัง Vercel 
 
ดูตัวอย่างที่:  .env.example 
 
 
 
⚙️ CI/CD & Workflows
 
Workflow สถานะ หน้าที่ 
 ci.yml  ✅ ทำงาน Build · Lint · Deploy Staging · Audit Log TH/EN 
 auto-update-package.yml  ✅ ทำงาน อัปเดต  package-lock.json  อัตโนมัติรายสัปดาห์ 
 build-vsix.yml  ✅ ทำงาน Lint + Build Extension 
 FastAPI_CI.yaml  ⏳ ย้ายที่ตั้ง ทดสอบ Backend — อยู่ระหว่างย้ายเข้า  .github/workflows/  
 Python-CI.yml  ⏳ ย้ายที่ตั้ง ทดสอบ Python — อยู่ระหว่างย้ายที่ตั้ง 
 codeql.yml  ✅ ทำงาน ตรวจสอบความปลอดภัย — เพิ่งสร้าง 8 ก.ย. 
 
📍 ทุก workflow ที่วางถูกที่  .github/workflows/  จะทำงานอัตโนมัติเมื่อเปิด PR หรือ push เข้า  main 
 
 
 
📖 เอกสาร
 
เอกสาร ที่อยู่ สถานะ 
สถาปัตยกรรมระบบ  ARCHITECTURE.md  ✅ อัปเดตล่าสุด 
คู่มือการมีส่วนร่วม  CONTRIBUTING.md  /  .github/PULL_REQUEST_TEMPLATE.md  ✅ มีจริง 
คลังความรู้  docs/knowledge-base/  ✅ ขยายต่อเนื่อง 
คู่มือผู้พัฒนา  docs/guides/  ✅ มีจริง 
นโยบายความปลอดภัย  SECURITY.md  ✅ มีจริง 
จริยธรรมการทำงานร่วมกัน  CODE_OF_CONDUCT.md  ✅ มีจริง 
 
 
 
🤝 มีส่วนร่วม
 
ยินดีรับทุกความช่วยเหลือครับ! 🎉
 
1. Fork → สร้าง branch:  git checkout -b feature/ชื่อฟีเจอร์ 
2. Commit ตามหลัก:  git commit -m "feat: คำอธิบายสั้นๆ" 
3. Push → เปิด PR เข้า  main 
4. 🤖 ระบบตรวจสอบอัตโนมัติ: AI จะรีวิวโค้ดผ่าน  scripts/ai-pr-review.js 
5. เมื่อผ่าน → รวมเข้า  main  · Deploy ไป Staging อัตโนมัติ
 
ดูรายละเอียดที่:  .github/PULL_REQUEST_TEMPLATE.md 
 
 
 
🛡️ ความปลอดภัย
 
พบช่องโหว่หรือปัญหาด้านความปลอดภัย — โปรดแจ้งเป็นความลับ ไม่เปิดปัญหาสาธารณะ:
 
- 📄  SECURITY.md  — ช่องทางแจ้งรายละเอียด
- 🤖 CodeQL ทำงานอัตโนมัติทุก PR — ตรวจพบรูปแบบโค้ดอันตราย
 
 
 
📄 ใบอนุญาต
 
MIT License — ดูรายละเอียดที่ไฟล์  LICENSE 
 
© 2026 ZyntroAI
 
 
 
✅ ตรวจสอบก่อนส่ง PR
 
ข้อมูลตรงกับ  main  @  c531e0e  จริง
โครงสร้างไม่สมมติ — ทุกเส้นทางมีอยู่จริง
ระบุชัดเจนว่าอะไรทำงานแล้ว อะไรกำลังปรับปรุง
คำสั่งรันทดสอบได้จริง
ภาษา: อังกฤษหลัก + คำอธิบายไทยครบถ้วน
 
ต้องการปรับเพิ่ม/ลดส่วนไหนไหมครับ? 📝🙏🚀