ได้เลยครับ! นี่คือ คู่มือเปิดใช้ Secret Scanning & Push Protection ฉบับสมบูรณ์ ทั้งระดับที่เก็บและองค์กรครับ 🛡️✅
 
 
 
🛡️ เปิดใช้ Secret Scanning & Push Protection — คู่มือฉบับเต็ม
 
เส้นทาง:  docs/github-enterprise/Secret Scanning Setup.md 
สำหรับ: ทุกที่เก็บ ZyntroAI / zyntromedia
ระดับ: สำคัญที่สุด • ต้องเปิดทุกแห่ง 🚫
 
 
 
📋 สารบัญ
 
- 1. คืออะไร & ทำไมต้องเปิด
- 2. เปิดระดับที่เก็บ (รายแห่ง)
- 3. เปิดระดับองค์กร (ทุกแห่งอัตโนมัติ)
- 4. ตรวจสอบสถานะ & ทดสอบ
- 5. จัดการข้อยกเว้น
- 6. สรุปสิ่งที่จะเกิดขึ้น
 
 
 
1. คืออะไร & ทำไมต้องเปิด
 
คุณสมบัติ หน้าที่ 
Secret Scanning 🧐 ตรวจหารูปแบบรหัส/โทเคนในทุกครั้งที่มีการ Push — แจ้งเตือน + ยกเลิกอัตโนมัติ 
Push Protection 🚫 ป้องกันไม่ให้ Push รหัสเข้าไปได้เลย — บล็อกทันทีก่อนเข้า repo 
 
ทำไมต้องเปิดทุกแห่ง
 
- ✅ ตรวจจับ GitHub Token + 100+ ผู้ให้บริการอื่น (AWS, Stripe, Slack, ฯลฯ)
- ✅ ยกเลิกโทเคนที่รั่ว อัตโนมัติทันที ไม่ต้องรอคนพบ
- ✅ บล็อกก่อนเกิด — ไม่ให้รหัสเข้าไปอยู่ในประวัติเลย
- ✅ ฟรี! สำหรับที่เก็บสาธารณะ และ Enterprise plan
- ⚠️ ถ้าปิด — รหัสรั่วแล้วต้องล้างประวัติเอง เสี่ยงถูกโจมตี
 
 
 
2. เปิดระดับที่เก็บ (รายแห่ง)
 
ขั้นตอนด้วยตนเอง
 
1. เข้า repo → แท็บ Settings
2. เลือกเมนูด้านซ้าย: Code security & analysis
3. กด Enable ที่ข้างๆ แต่ละรายการ:
- ✅ Secret scanning → เปิด
- ✅ Push protection → เปิด (แนะนำ Strong protection)
4. เสร็จ! ✅
 
เปิดด้วย GitHub CLI (เร็วกว่าเยอะ!)
 
bash
  
# ติดตั้ง gh CLI ถ้ายังไม่มี
gh auth login

# เปิดที่เก็บเดี่ยว
gh secret-scanning enable --repo ZyntroAI/new-crystalcastle
gh secret-scanning push-protection enable --repo ZyntroAI/new-crystalcastle

# ตรวจสอบสถานะ
gh secret-scanning status --repo ZyntroAI/new-crystalcastle
 
 
เปิดด้วย API
 
bash
  
# Secret Scanning
curl -X PUT \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  https://api.github.com/repos/ZyntroAI/new-crystalcastle/secret-scanning/enable

# Push Protection
curl -X PUT \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  https://api.github.com/repos/ZyntroAI/new-crystalcastle/secret-scanning/push-protection
 
 
 
 
3. เปิดระดับองค์กร (ทุกแห่งอัตโนมัติ) ✅ แนะนำ
 
เปิดครั้งเดียว → ที่เก็บเก่า+ใหม่เปิดอัตโนมัติ ไม่ต้องทำทีละแห่ง
 
ขั้นตอนผ่านหน้าเว็บ
 
1. เข้า → องค์กร Settings
2. เมนูซ้าย: Code security & analysis
3. หัวข้อ: Secret scanning → กด Enable for all repositories
4. ติ๊กเลือก:
- ✅ Automatically enable for new repositories
- ✅ Push protection → Full protection
5. บันทึก ✅
 
ผ่าน GitHub CLI
 
bash
  
# เปิดทุกที่เก็บในองค์กร
gh org security-enable ZyntroAI \
  --secret-scanning \
  --push-protection \
  --apply-to all

# ตรวจสอบว่าครบไหม
gh repo list ZyntroAI --limit 200 | while read -r line; do
  repo=$(echo "$line" | cut -f1 -d' ')
  status=$(gh secret-scanning status --repo "$repo" 2>/dev/null || echo "❌ ไม่สามารถตรวจสอบ")
  echo "$repo → $status"
done
 
 
ผ่าน API
 
bash
  
# อัปเดตนโยบายองค์กร
curl -X PATCH \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/orgs/ZyntroAI/code-security/config \
  -d '{
    "secret_scanning_default_config": {
      "state": "enabled",
      "push_protection": "enabled",
      "enable_for_new_repos": true
    }
  }'
 
 
ตรวจสอบว่าทุกแห่งเปิดแล้ว
 
bash
  
# รายงานสถานะทุก repo
gh api -X GET /orgs/ZyntroAI/repos --paginate \
  --jq '.[] | select(.archived==false) | {name, default_branch, security_and_analysis}'
 
 
 
 
4. ตรวจสอบสถานะ & ทดสอบ
 
เช็คว่าเปิดจริงไหม
 
- เข้า repo → Security แท็บ → Secret scanning
- ถ้าเห็น "✅ Enabled" พร้อมรายการพบ → ถูกต้องแล้ว
 
ทดสอบจริง (ปลอดภัย ไม่แพร่จริง)
 
สร้างไฟล์ทดสอบในเครื่อง:
 
bash
  
# ทดสอบ Push Protection — สร้างไฟล์ชั่วคราว
echo "ghp_testfakefortesting123456789012345678901234" > test-secret.txt

# พยายาม Push — ควรถูกบล็อกทันที!
git add test-secret.txt
git commit -m "test: should be blocked"
git push origin main
 
 
ผลที่คาด:
 
plaintext
  
❌ GitHub found a secret in your push and blocked it.
Secret scanning push protection is enabled.
 
 
→ ถ้าบล็อก = ทำงานถูกต้อง ✅ → ลบไฟล์ทิ้งได้เลย
 
ดูรายการที่ตรวจพบ
 
- แท็บ Security → Secret scanning → Alerts
- แสดง: พบที่ไหน, ใคร Push, สถานะ, ยกเลิกหรือยัง
 
 
 
5. จัดการข้อยกเว้น
 
กรณีจำเป็นต้องขอข้ามชั่วคราว
 
บางครั้งต้องใส่รูปแบบคล้ายโทเคนแต่ไม่ใช่จริง — มีวิธีจัดการ:
 
5.1 ปิดชั่วคราวตอน Push (Push Protection)
 
bash
  
# เพิ่มข้อความพิเศษใน commit message
git commit -m "update config: add example token [skip secret-scanning]"
 
 
⚠️ ใช้เท่าที่จำเป็น บันทึกเหตุผลไว้เสมอ
 
5.2 เพิ่มข้อยกเว้นถาวร (ระวัง!)
 
ใน repo → Settings → Code security & analysis → Secret scanning → Exclusions
 
- เพิ่มรูปแบบ/ไฟล์/บรรทัดที่ต้องการยกเว้น
- หลีกเลี่ยงเท่าที่ทำได้ — ทุกบรรทัดที่ยกเว้น = จุดอ่อน
 
5.3 ปิดบางประเภท
 
ถ้าประเภทที่แจ้งเตือนผิดบ่อย → ปิดเฉพาะประเภทนั้น ไม่ปิดทั้งระบบ:
 
- Settings → Secret scanning → Custom patterns / Disable detectors
 
 
 
6. สรุปสิ่งที่จะเกิดขึ้นเมื่อเปิดแล้ว
 
เมื่อพบรหัสใน Push
 
1. 🚫 Push Protection บล็อกทันที — ไม่ให้เข้า repo
2. หรือ ถ้าผ่านไปได้ → 🧐 Secret Scanning แจ้งเตือน ทันที
3. 📧 แจ้งอีเมลถึงเจ้าของ + ผู้ดูแล
4. 🔄 โทเคนถูกยกเลิกอัตโนมัติ (ถ้าเป็น GitHub Token)
5. 📋 บันทึกเหตุการณ์ใน Security → Alerts
 
เช็คลิสต์กดปุ่มเปิด
 
ทุกที่เก็บ ไม่เป็นส่วนตัว/เก็บเงียบ — สิทธิ์ครบ
สมาชิกทราบล่วงหน้า — อาจถูกบล็อกตอน Push
มีผู้ดูแลตรวจสอบแจ้งเตือนเป็นประจำ
ทดสอบด้วย  ghp_testfake...  แล้วบล็อกจริง ✅
 
 
 
📌 บันทึกเป็น:  docs/github-enterprise/Secret Scanning Setup.md 
🔗 ที่เกี่ยวข้อง: [[Token Security Guide]], [[GitHub API]], [[CI/CD Permissions]]
📅 อัปเดตล่าสุด: 29 กันยายน 2026
 
 
 
ต้องการช่วย:
 
- 📊 สร้าง รายงานสถานะ ว่าที่เก็บไหนเปิด/ยังไม่เปิด บ้างไหมครับ?
- ⚡ เขียน สคริปต์เปิดทีเดียวทุกแห่ง แบบครบชุด
 
บอกได้เลยครับ! 🚀
