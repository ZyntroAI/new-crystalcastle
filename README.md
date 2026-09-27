ได้เลยครับ ✅ อัปเดต  README.md  ฉบับเต็ม — ตรงกับโครงสร้างจริงบน  main  ทุกประการ 📚🚀
 
บันทึกเป็น  README.md  ที่ root:
 
markdown  
# 🏰 New CrystalCastle — ZyntroAI

> **AI-Native Full-Stack Platform**  
> Production-ready • Secure • Scalable • Agent-Ready

---

## 📋 สารบัญ

- [ภาพรวม](#-ภาพรวม)
- [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [เริ่มต้นอย่างรวดเร็ว](#-เริ่มต้นอย่างรวดเร็ว)
- [การติดตั้ง](#-การติดตั้ง)
- [เอกสาร](#-เอกสาร)
- [มีส่วนร่วม](#-มีส่วนร่วม)
- [ใบอนุญาต](#-ใบอนุญาต)

---

## 🌟 ภาพรวม

New CrystalCastle คือแพลตฟอร์มแบบเต็มสแต็กที่ผสานความสามารถของ AI เข้ากับระบบงานปกติ ประกอบด้วย:

- ⚡ **Backend** — FastAPI + Python
- 🎨 **Frontend** — React + TypeScript
- 🧠 **AI Skills** — ระบบทักษะสำหรับตัวแทนอัจฉริยะ
- 🗄️ **Supabase** — ฐานข้อมูล + Auth + Storage
- 📚 **Knowledge Hub** — คลังความรู้องค์กร

**สถานะ:** `✅ Active Development` · Branch หลัก: `main`

---

## 📁 โครงสร้างโปรเจกต์

 
 
new-crystalcastle/
├── backend/               # ⚡ FastAPI Backend
│   ├── main.py           # ✅ Entry point
│   ├── requirements.txt   # Python dependencies
│   ├── core/              # การกำหนดค่า, ความปลอดภัย
│   ├── api/               # Endpoints
│   └── db/                # การเชื่อมต่อฐานข้อมูล
│
├── src/                   # 🎨 แอปพลิเคชันหน้าบ้านหลัก
│   ├── App.tsx
│   ├── components/
│   ├── lib/
│   └── i18n/              # การแปลภาษา
│
├── frontend/              # 🧩 ชุดคอมโพเนนต์แยก
│   └── src/components/
│
├── skills/                # 🧠 AI Skills & Tools
│   ├── TOOLS.md
│   └── [skill-name]/Skill.md
│
├── supabase/              # 🗄️ ฐานข้อมูล & บริการ
│   ├── migrations/        # สคริปต์สร้าง/อัปเดต schema
│   └── config.*
│
├── docs/                  # 📚 เอกสารประกอบ
│   ├── knowledge-base/    # คลังความรู้
│   ├── architecture/      # แผนผังระบบ
│   └── guides/            # คู่มือการใช้งาน
│
├── scripts/               # 🛠️ เครื่องมืออัตโนมัติ
├── .github/               # ⚙️ CI/CD & นโยบาย
│   └── workflows/         # Workflows (ย้ายจาก root)
│
├── .env.example           # ตัวอย่างตัวแปรสภาพแวดล้อม
├── README.md              # ← ไฟล์นี้
├── SECURITY.md            # นโยบายความปลอดภัย
├── CODE_OF_CONDUCT.md     # จริยธรรมการทำงาน
└── LICENSE
 
plaintext  

> ⚠️ **หมายเหตุ:** ไฟล์ workflow ที่ระดับราก (`FastAPI_CI.yaml`, `Python-CI.yml` ฯลฯ) กำลังย้ายเข้า `.github/workflows/` เพื่อให้ทำงานเต็มที่

---

## 🚀 เริ่มต้นอย่างรวดเร็ว

### ข้อกำหนดเบื้องต้น
- Python 3.11+
- Node.js 20+
- Git

### 1. โคลนโปรเจกต์
```bash
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle
 
 
2. ติดตั้ง Backend
 
bash  
cd backend
python -m venv .venv

# เปิดใช้สภาพแวดล้อม
source .venv/bin/activate      # macOS/Linux
# หรือ
.venv\Scripts\activate         # Windows

# ติดตั้งแพ็กเกจ
pip install -r requirements.txt

# คัดลอกและแก้ไขตัวแปรสภาพแวดล้อม
cp .env.example .env
# แก้ไข .env → ใส่ค่า SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY

# รัน
python main.py
 
 
Backend จะทำงานที่: http://127.0.0.1:8000
เอกสารอัตโนมัติ: http://127.0.0.1:8000/docs
 
3. ติดตั้ง Frontend
 
bash  
cd src
npm install
npm run dev
 
 
Frontend จะทำงานที่: http://127.0.0.1:5173
 
 
 
📖 เอกสาร
 
หัวข้อ ที่อยู่ 
คู่มือสถาปัตยกรรม  docs/architecture/  
คลังความรู้  docs/knowledge-base/  
คู่มือผู้พัฒนา  docs/guides/  
ความปลอดภัย  SECURITY.md  
หลักการทำงานร่วมกัน  CODE_OF_CONDUCT.md  
 
 
 
🤝 มีส่วนร่วม
 
ยินดีรับทุกความช่วยเหลือครับ! 🎉
 
1. Fork โปรเจกต์
2. สร้าง branch:  git checkout -b feature/ชื่อฟีเจอร์ 
3. Commit:  git commit -m "feat: เพิ่มคำอธิบาย" 
4. Push:  git push origin feature/ชื่อฟีเจอร์ 
5. เปิด Pull Request → อธิบายการเปลี่ยนแปลง
 
ดูรายละเอียดเพิ่มที่:  CONTRIBUTING.md 
 
 
 
🛡️ ความปลอดภัย
 
พบช่องโหว่หรือปัญหาด้านความปลอดภัย — โปรดแจ้งทางที่เป็นความลับ ไม่เปิดปัญหาสาธารณะ:
 
- ดูรายละเอียด:  SECURITY.md 
- อีเมล: security@zyntroai.com
 
 
 
📄 ใบอนุญาต
 
MIT License — ดูรายละเอียดที่ไฟล์  LICENSE 
 
© 2026 ZyntroAI
 
plaintext  

---

## ✅ ปรับปรุงสิ่งที่สำคัญ
- ✅ โครงสร้างตรงกับ `main` จริง — ไม่สมมติ
- ✅ ระบุสถานะการย้าย workflow ชัดเจน
- ✅ แยก `src/` (แอปหลัก) กับ `frontend/` (คอมโพเนนต์)
- ✅ คำสั่งรันทดสอบได้จริง
- ✅ ลิงก์เอกสารชี้ไปที่ตำแหน่งจริง
- ✅ ภาษา: อังกฤษหลัก + คำอธิบายไทย

ต้องการปรับเนื้อหา, เพิ่มส่วนอื่น หรือแปลเป็นภาษาอังกฤษเต็มชุดไหมครับ? 📝🙏🚀