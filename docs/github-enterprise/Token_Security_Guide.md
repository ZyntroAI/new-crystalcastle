ได้เลยครับ! นี่คือ คู่มือจัดการ Token อย่างปลอดภัย ฉบับสมบูรณ์ พร้อมนำไปบันทึกใช้งานได้ทันทีครับ 🔐✅
 
 
 
🔐 คู่มือจัดการ Token อย่างปลอดภัย
 
เส้นทาง:  docs/github-enterprise/TokenSecurityGuide.md 
สำหรับ: ทีมพัฒนา ZyntroAI • ทุกคนที่ใช้ GitHub Token
เวอร์ชัน: 1.0 | ระดับ: สำคัญที่สุด 🛡️
 
 
 
📋 สารบัญ
 
- 1. ประเภทของ Token & การเลือกใช้
- 2. สร้าง Token อย่างปลอดภัย
- 3. จัดเก็บ — ห้ามใส่ตรงไหน • ใส่ตรงไหนได้
- 4. ตรวจสอบ — ป้องกันการรั่วไหล
- 5. หากรั่วไหล — ทำทันทีตามนี้
- 6. หมุนเวียน & ยกเลิก
- 7. นโยบายทีม
 
 
 
1. ประเภทของ Token & การเลือกใช้
 
ประเภท อายุสูงสุด สิทธิ์ เหมาะสำหรับ 
Fine-grained PAT ✅ แนะนำ ปรับแต่งได้ เฉพาะที่เก็บ + สิทธิ์จำกัด ใช้งานทั่วไป 
Classic PAT (เก่า) ไม่มีวันหมด ⚠️ ทุกที่เก็บ / เต็มสิทธิ์ หลีกเลี่ยง • ใช้ชั่วคราวเท่านั้น 
GITHUB_TOKEN (ใน CI) เซสชัน • หมดเอง จำกัดตาม job ภายใน Workflow — ไม่ต้องจัดเก็บเอง 
Installation Token (แอป) 1 ชม. • ต่ออายุเอง ตามสิทธิ์แอป ระบบ/บอท/เซิร์ฟเวอร์ 
 
🎯 กฎทอง: เลือกประเภทที่ อายุสั้นที่สุด + สิทธิ์น้อยที่สุด ที่ทำงานได้ครบถ้วน
 
 
 
2. สร้าง Token อย่างปลอดภัย
 
ขั้นตอนที่ถูกต้อง
 
1. เข้า → Settings → Developer settings → Personal access tokens → Generate new token (fine-grained)
2. ตั้งชื่อ:  zyntroai-ชื่อผู้ใช้-วันที่  →  zyntroai-john-20260929 
3. เลือกวันหมดอายุ: ไม่เกิน 90 วัน ⚠️ ห้ามไม่ตั้งวันหมด!
4. ที่เก็บ: เลือกเฉพาะที่จำเป็น — ไม่เลือก "All repositories" เว้นแต่จำเป็นจริงๆ
5. สิทธิ์: เลือก เฉพาะที่ต้องใช้
- อ่านอย่างเดียว →  contents: read 
- เขียนโค้ด →  contents: write 
- จัดการ PR →  pull-requests: write 
- ไม่เลือก  admin: / write:org  หากไม่จำเป็น
6. กดสร้าง → คัดลอกทันที — จะไม่แสดงอีกเลย!
 
❌ ห้ามทำ
 
- ❌ ตั้งชื่อว่า  test  /  temp  / ไม่มีความหมาย
- ❌ ไม่ตั้งวันหมดอายุ → ตลอดกาลอันตรายที่สุด
- ❌ เลือก "All repos" ทั้งที่ไม่จำเป็น
- ❌ สร้างแล้วทิ้งไว้โดยไม่ใช้ → ลบทันทีถ้าไม่ได้ใช้
 
 
 
3. จัดเก็บ — ห้ามใส่ตรงไหน • ใส่ตรงไหนได้
 
❌ ห้ามเด็ดขาด
 
ที่ เหตุผล 
 config.py  ตรงๆ →  TOKEN=ghp_...  ถูก commit รั่วตลอดไป 
 .env.example  /  README.md  เอกสารสาธารณะทุกคนเห็น 
 docker-compose.yml  /  Dockerfile  สร้างภาพแพร่กระจาย 
PR / ความคิดเห็น / แชท ประวัติไม่สามารถลบได้หมด 
คอมเมนต์ในโค้ด คนใหม่เห็นง่าย 
บันทึก/จดที่ไม่เข้ารหัส ขโมยได้ง่าย 
 
✅ เก็บได้ปลอดภัย
 
ที่ วิธี 
ไฟล์  .env  (ในเครื่อง) เพิ่ม  .env  ใน  .gitignore  เสมอ! 
Secrets ใน GitHub →  GITHUB_TOKEN ,  PAT_TOKEN  เก็บที่ repo/org • มองไม่เห็น 
ระบบจัดการความลับ → 1Password, HashiCorp Vault เข้ารหัส • มีบันทึกการเข้าใช้ 
ตัวแปรสภาพแวดล้อม ของระบบ ไม่เขียนลงดิสก์ 
 
✅ ตัวอย่าง .gitignore ที่ถูกต้อง
 
gitignore
  
# ความลับ — ห้ามเคยขึ้น repo
.env
.env.local
.*.env
config/secrets.*
**/secrets/*
!secrets/.placeholder

# ไฟล์ชั่วคราว
*.tmp
*.swp
 
 
✅ ตัวอย่างการโหลดในโค้ด
 
python
  
import os
from dotenv import load_dotenv  # pip install python-dotenv

# โหลดจาก .env ในเครื่อง — ไม่เคย hard-code
load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

if not GITHUB_TOKEN:
    raise RuntimeError(
        "⚠️ ไม่พบ GITHUB_TOKEN "
        "ตั้งค่าในตัวแปรสภาพแวดล้อมหรือไฟล์ .env "
        "ห้ามใส่ตรงในโค้ด!"
    )
 
 
typescript
  
// TypeScript — ไม่ hard-code
const token = process.env.GITHUB_TOKEN;

if (!token) {
  throw new Error("GITHUB_TOKEN not set — check .env or environment");
}
 
 
 
 
4. ตรวจสอบ — ป้องกันการรั่วไหล
 
4.1 ตรวจก่อน Commit ทุกครั้ง
 
สร้าง  .git/hooks/pre-commit :
 
bash
  
#!/bin/bash
# ตรวจพบรูปแบบ Token ก่อนอนุญาตให้ commit

PATTERN="gh[pors]_[A-Za-z0-9]{36,}"

if git diff --cached | grep -E "$PATTERN"; then
  echo "❌ พบรูปแบบ GitHub Token ในโค้ด!"
  echo "ลบออกก่อน commit หรือใช้ .env แทน"
  exit 1
fi

echo "✅ ไม่พบรูปแบบเสี่ยง"
exit 0
 
 
bash
  
chmod +x .git/hooks/pre-commit
 
 
4.2 ตรวจทั้งประวัติที่มีอยู่
 
ใช้  gitleaks  — เครื่องมือมาตรฐานอุตสาหกรรม:
 
bash
  
# ติดตั้ง: docker หรือ binary
gitleaks detect --source . --verbose

# ตรวจเฉพาะ commit ล่าสุด
gitleaks detect --source . --depth 1
 
 
4.3 ตรวจจากภายนอก — GitHub Secret Scanning
 
เปิดที่: Settings → Code security & analysis → Secret scanning → Enable
 
- ✅ GitHub จะตรวจเองอัตโนมัติ
- ✅ รู้จักรูปแบบ GitHub Token + 100+ ผู้ให้บริการอื่น
- ✅ แจ้งเตือน + ยกเลิก Token อัตโนมัติเมื่อพบรั่ว
 
 
 
5. หากรั่วไหล — ทำทันทีตามนี้
 
🚨 ขั้นตอนฉุกเฉิน (ไม่รอช้า)
 
plaintext
  
นาทีที่ 1 → ยกเลิก Token ทันทีในหน้า Settings
นาทีที่ 2 → สร้าง Token ใหม่
นาทีที่ 5 → อัปเดตทุกที่ที่ใช้ — CI, เซิร์ฟเวอร์, ระบบ
ชม. ที่ 1 → ตรวจสอบบันทึกการใช้งานที่:
              Settings → Personal access tokens → Audit log
วันที่ 1 → พิจารณาเปลี่ยนรหัสผ่าน + เปิด 2FA
 
 
ตรวจสอบว่าถูกนำไปใช้หรือไม่
 
- เข้า → Settings → Advanced → Audit log
- กรอง:  action: personal_access_token.used 
- ดู IP/เวลา/ตำแหน่งที่เรียกใช้
 
ล้างประวัติถ้าจำเป็น
 
ถ้า commit รั่วไปแล้ว ต้องล้างจากประวัติ:
 
bash
  
# ใช้ git-filter-repo แนะนำโดย GitHub
git filter-repo --replace-text <(echo 'ghp_xxxxxxxxxxxxxxxx==>REDACTED')

# ดันประวัติใหม่
git push --force-with-lease origin main
 
 
⚠️ แจ้งทีมก่อน — เปลี่ยนประวัติจะกระทบคนอื่นที่ทำงานด้วย
 
 
 
6. หมุนเวียน & ยกเลิกเป็นระยะ
 
กำหนดรอบ
 
ประเภท รอบหมุน 
Fine-grained (มีวันหมด) ต่ออายุก่อนหมด 7 วัน 
Classic (ไม่มีวันหมด) ⚠️ เปลี่ยนทุก 30–60 วัน หรือลบทิ้งเลย 
Token ที่มีสิทธิ์  admin / write:org  ทุก 30 วัน 
หลังจากพนักงานลาออก ทันที • ไม่รอ 
หลังเหตุการณ์ความปลอดภัย ทันที ทุกคน 
 
ตรวจสอบสิ่งที่มีอยู่เป็นประจำ
 
ทุกเดือนเข้า: Settings → Developer settings → Personal access tokens
 
- ❌ ลบที่ไม่ได้ใช้แล้ว
- ❌ ลบที่ไม่มีวันหมด
- ✅ ต่ออายุที่กำลังจะหมด
 
 
 
7. นโยบายทีม ZyntroAI
 
✅ ข้อบังคับ
 
1. ห้าม Hard-code Token เด็ดขาด — ทุกคนต้องใช้  .env  +  .gitignore 
2. ใช้ Fine-grained PAT เท่านั้น — Classic PAT จะถูกปิดเมื่อพบ
3. ตั้งวันหมดอายุทุกครั้ง — ไม่มีข้อยกเว้น
4. สิทธิน้อยที่สุด —  contents: read  ย่อมดีกว่า  write 
5. ลบทันทีเมื่อเลิกใช้ — ไม่ทิ้งค้าง
6. เปิด 2FA บัญชีทุกคน — ป้องกันขโมยบัญชี
7. รั่ว → รายงานทันที — ไม่ซ่อน ทีมช่วยจัดการ
 
📋 เช็คลิสต์ประจำเดือน
 
ตรวจสอบรายการ Token ทั้งหมด
ลบที่ไม่ได้ใช้งาน
หมุนเวียนตามรอบ
ตรวจ Audit Log ว่าผิดปกติหรือไม่
ยืนยันว่า Secret Scanning เปิดครบทุก repo
 
 
 
📌 บันทึกเป็น:  docs/github-enterprise/Token Security Guide.md 
🔗 ที่เกี่ยวข้อง: [[GitHub API]], [[CI/CD Security Best Practices]], [[Secret Scanning Setup]]
📅 อัปเดตล่าสุด: 29 กันยายน 2026
 
 
 
ต้องการเขียนส่วนเพิ่มเติมไหมครับ เช่น:
 
- 🛡️ วิธีเปิด Secret Scanning & Push Protection ทุก repo
- 🤖 ตัวอย่าง Rotation Script อัตโนมัติ
- 📊 รายงาน Audit Log ตรวจสอบการใช้งาน
 
บอกได้เลยครับ! 🚀
