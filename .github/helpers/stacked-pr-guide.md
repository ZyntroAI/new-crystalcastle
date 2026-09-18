# 🧱 คู่มือ: การทำงานกับ Stacked PRs

## ✅ รูปแบบมาตรฐาน
- **ชื่อ:** `[STACK n/m] ชื่อเรื่อง`
- **สาขา:** `stack/ชื่อ-ส่วน`
- **เป้าหมาย:** ชี้ไปยังสาขาก่อนหน้า (ไม่ใช่ main)

## 🚀 คำสั่ง Git ย่อ
```bash
# 1. เริ่มสแต็ก
git checkout main -b stack/part-1

# 2. สร้างชั้นถัดไป
git checkout stack/part-1 -b stack/part-2

# 3. อัปเดตเมื่อฐานเปลี่ยน
git rebase --update-refs origin/main

# 4. ย้ายเป้าหมายเมื่อรวมแล้ว
gh pr edit --base main

