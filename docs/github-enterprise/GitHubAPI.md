ได้เลยครับ! นี่คือ เอกสาร GitHub API ฉบับสมบูรณ์ ที่ตรงกับโครงสร้างของ  new-crystalcastle  ครับ 📚🔐
 
 
 
📖 GitHub API — คู่มือการใช้งาน
 
เส้นทาง:  docs/github-enterprise/GitHub API.md 
สำหรับ: GitHub Public & GitHub Enterprise Server
เวอร์ชัน: v3 / REST API + GraphQL
อัปเดต: 29 กันยายน 2026
 
 
 
📋 สารบัญ
 
- 1. ภาพรวม
- 2. Endpoint & URL
- 3. การยืนยันตัวตน
- 4. เวอร์ชัน & ขอบเขต
- 5. ตัวอย่างโค้ด
- 6. อัตราการจำกัด
- 7. ข้อผิดพลาดที่พบบ่อย
- 8. Enterprise vs Public
 
 
 
1. ภาพรวม
 
GitHub มี API หลัก 2 ชนิด:
 
ประเภท รูปแบบ ใช้เมื่อ 
REST API (v3)  GET /repos/{owner}/{repo}  การเรียกข้อมูลทั่วไป, ทำงานง่ายๆ 
GraphQL API (v4) POST + Query ดึงข้อมูลเฉพาะที่ต้องการ, ลดจำนวนเรียก 
 
💡 สำหรับ Enterprise Server URL จะเปลี่ยนจาก  api.github.com  →  [โดเมน]/api/v3  /  [โดเมน]/api/graphql 
 
 
 
2. Endpoint & URL
 
GitHub Public (ปัจจุบันใช้งานจริง)
 
ประเภท URL ฐาน 
เว็บไซต์  https://github.com  
REST API  https://api.github.com  
GraphQL API  https://api.github.com/graphql  
 
GitHub Enterprise Server (อนาคต / ต้องปรับใช้ก่อน)
 
ประเภท URL ฐาน 
เว็บไซต์  https://github.zyntroai.com  
REST API  https://github.zyntroai.com/api/v3  
GraphQL API  https://github.zyntroai.com/api/graphql  
 
⚠️ ตรวจสอบก่อนใช้:  github.zyntroai.com  ต้องมี DNS จริงและเข้าถึงได้ก่อน — ปัจจุบันใช้  github.com  ครับ
 
 
 
3. การยืนยันตัวตน
 
3.1 Personal Access Token (แนะนำ)
 
bash
  
# Header มาตรฐาน
Authorization: Bearer ghp_xxxxxxxxxxxxxxxxxxxx
# หรือ
Authorization: token ghp_xxxxxxxxxxxxxxxxxxxx
 
 
3.2 กำหนดขอบเขต Token (Scopes)
 
สิทธิ์ ความหมาย ระดับแนะนำ 
 repo  เข้าถึงทุกที่เก็บ เต็มสิทธิ์ (รอบรหัส) 
 repo:status  อ่าน/เขียนสถานะ CI ขั้นต่ำแนะนำ 
 repo_deployment  จัดการ deployment ตามความจำเป็น 
 read:user  อ่านข้อมูลโปรไฟล์ผู้ใช้ ขั้นต่ำแนะนำ 
 write:org  จัดการองค์กร ผู้ดูแลระบบเท่านั้น 
 
3.3 ตัวอย่างการเรียกด้วย cURL
 
bash
  
# ✅ Public GitHub
curl -H "Authorization: token ${GITHUB_TOKEN}" \
  https://api.github.com/repos/ZyntroAI/new-crystalcastle

# ✅ Enterprise Server (เมื่อพร้อม)
curl -H "Authorization: token ${GHE_TOKEN}" \
  https://github.zyntroai.com/api/v3/repos/ZyntroAI/new-crystalcastle
 
 
 
 
4. เวอร์ชัน & ขอบเขต
 
กำหนดเวอร์ชัน (Header แนะนำ)
 
http
  
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
 
 
ปรับแต่งผลลัพธ์
 
bash
  
# ส่งคืนฟิลด์น้อยลง
curl -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/ZyntroAI/new-crystalcastle?per_page=5"
 
 
 
 
5. ตัวอย่างโค้ด — พร้อมใช้
 
Python (PyGitHub)
 
python
  
from github import Github
import os

# เลือก endpoint ตามสภาพแวดล้อม
USE_ENTERPRISE = os.getenv("USE_GHE", "false").lower() == "true"
TOKEN = os.getenv("GITHUB_TOKEN")

if USE_ENTERPRISE:
    BASE_URL = "https://github.zyntroai.com"
    g = Github(base_url=BASE_URL, login_or_token=TOKEN)
else:
    g = Github(login_or_token=TOKEN)

# ทดสอบเชื่อมต่อ
user = g.get_user()
print(f"✅ เชื่อมต่อสำเร็จ: {user.login}")

# ดึงข้อมูลที่เก็บ
repo = g.get_repo("ZyntroAI/new-crystalcastle")
print(f"📦 ที่เก็บ: {repo.name} ⭐ {repo.stargazers_count}")
 
 
JavaScript / Fetch
 
javascript
  
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
const API_BASE = Deno.env.get("USE_GHE") === "true"
  ? "https://github.zyntroai.com/api/v3"
  : "https://api.github.com";

async function getRepo(owner, name) {
  const res = await fetch(`${API_BASE}/repos/${owner}/${name}`, {
    headers: {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  return await res.json();
}
 
 
Action ใน Workflow
 
yaml
  
- name: เรียก GitHub API
  uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      const repo = await github.rest.repos.get({
        owner: 'ZyntroAI',
        repo: 'new-crystalcastle'
      });
      console.log(repo.data.description);
 
 
 
 
6. อัตราการจำกัด
 
ประเภท ขีดจำกัด (Public) Enterprise 
ส่วนตัว 5,000 ครั้ง/ชม. ปรับแต่งได้สูงกว่า 
สาธารณะ/ไม่ระบุตัวตน 60 ครั้ง/ชม. ไม่รองรับโดยค่าเริ่มต้น 
แอปพลิเคชัน (Installation) 15,000 ครั้ง/ชม. ปรับแต่งได้ 
 
ตรวจสอบโควต้า
 
bash
  
curl -H "Authorization: token ${GITHUB_TOKEN}" \
  https://api.github.com/rate_limit
 
 
-  remaining  → จำนวนที่เหลือ
-  reset  → เวลารีเซ็ต (Unix timestamp)
 
 
 
7. ข้อผิดพลาดที่พบบ่อย
 
รหัส สาเหตุ วิธีแก้ 
401 Unauthorized Token ไม่ถูก/หมดอายุ/ไม่มีสิทธิ์ สร้าง token ใหม่ ตรวจสอบ scopes 
403 Forbidden หมดโควต้า หรือไม่มีสิทธิ์เข้าถึง รอหรือขอสิทธิ์เพิ่ม 
404 Not Found ผิด URL หรือไม่มีสิทธิ์เห็น ตรวจชื่อเจ้าของ/ที่เก็บ • ตรวจสิทธิ์ token 
503 Service Unavailable GitHub ไม่เสถียรชั่วคราว รอและลองใหม่ • เพิ่ม retry 
Connection refused Enterprise ยังไม่เปิด กลับไปใช้  api.github.com  ชั่วคราว 
 
 
 
8. GitHub Enterprise vs Public
 
รายการ Public (ปัจจุบัน) Enterprise Server (อนาคต) 
URL API  https://api.github.com   https://[โดเมน]/api/v3  
GraphQL  api.github.com/graphql   [โดเมน]/api/graphql  
ขีดจำกัด มาตรฐาน ปรับแต่งได้ 
SSO / LDAP ภายนอก รองรับภายในองค์กร 
การควบคุมข้อมูล บนคลาวด์ ในศูนย์ข้อมูลเอง 
การติดตั้ง ไม่ต้อง ต้องจัดเตรียมเซิร์ฟเวอร์ 
 
✅ คำแนะนำการเปลี่ยนผ่าน
 
1. เขียนโค้ด รองรับ 2 โหมด ตัวแปร  USE_GHE  สลับได้
2. ทดสอบบน  github.com  ก่อนเสมอ
3. เมื่อ  github.zyntroai.com  พร้อม → เปลี่ยนค่า env เท่านั้น ไม่ต้องแก้โค้ด
4. ตรวจสอบสิทธิ์และ SSO กับทีมก่อนย้าย
 
 
 
📌 ตัวแปรสภาพแวดล้อมแนะนำ
 
env
  
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
USE_GHE=false
GHE_DOMAIN=https://github.zyntroai.com
 
 
 
 
✅ เอกสารนี้วางที่:  docs/github-enterprise/GitHub API.md 
🔗 ที่เกี่ยวข้อง: [[GitHub Enterprise Server Setup]], [[Token Security Best Practices]], [[CI/CD Permissions]]
📅 อัปเดตล่าสุด: 29 กันยายน 2026
 
 
 
ต้องการให้เขียนส่วนเพิ่มเติมไหมครับ เช่น:
 
- 🔐 คู่มือจัดการ Token อย่างปลอดภัย
- 📊 ตัวอย่าง GraphQL Query เฉพาะการใช้งานของเรา
- 🧪 ชุดทดสอบการสลับระหว่าง Public ↔ Enterprise
 
บอกได้เลยครับ! 🚀
