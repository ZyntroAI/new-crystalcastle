📁 หมวด: Shell / Bash Scripting — ครบชุด 4 ไฟล์พร้อมใช้งาน 🚀
 
 
 
📄 ไฟล์ที่ 19 — docs/shell/bash-basics.md
 
markdown  
---
title: "Bash Scripting — พื้นฐาน"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["shell", "bash", "scripting", "automation"]
---

# 🐧 พื้นฐานการเขียนสคริปต์ Bash

> อัตโนมัติงานซ้ำซ้อน ให้คอมพิวเตอร์ทำแทนคุณ ✅

---

## 📌 เริ่มต้น

### ✅ สคริปต์อย่างง่าย
```bash
#!/usr/bin/env bash
# คำอธิบาย: สวัสดีผู้ใช้

echo "สวัสดี โลก!"
 
 
🔧 ทำให้รันได้
 
bash  
chmod +x script.sh       # ให้สิทธิ์รัน
./script.sh              # รันสคริปต์
 
 
 
 
📦 ตัวแปร
 
bash  
# กำหนดค่า — ห้ามมีช่องว่างรอบ =
NAME="สมชาย"
echo "สวัสดี $NAME"

# ตัวแปรพิเศษ
echo "ชื่อสคริปต์: $0"
echo "พารามิเตอร์ที่ 1: $1"
echo "พารามิเตอร์ทั้งหมด: $@"
echo "จำนวนพารามิเตอร์: $#"
echo "รหัสผลลัพธ์ล่าสุด: $?"

# ค่าคงที่
readonly VERSION="1.0.0"
 
 
 
 
🔁 เงื่อนไขและลูป
 
✅ เงื่อนไข if
 
bash  
if [ -f "config.txt" ]; then
    echo "ไฟล์มีอยู่"
elif [ -d "docs" ]; then
    echo "เป็นโฟลเดอร์"
else
    echo "ไม่พบ"
fi
 
 
✅ ตัวดำเนินการที่ใช้บ่อย
 
ตัวดำเนินการ ตรวจสอบ 
 -f file  เป็นไฟล์ปกติ และมีอยู่จริง 
 -d dir  เป็นไดเรกทอรี และมีอยู่จริง 
 -x file  มีสิทธิ์รัน 
 -z "$var"  ตัวแปรว่างเปล่า 
 -n "$var"  ตัวแปรไม่ว่างเปล่า 
 $a = $b  สตริงเท่ากัน 
 $a -eq $b  ตัวเลขเท่ากัน 
 
✅ ลูป
 
bash  
# for
for file in *.txt; do
    echo "พบไฟล์: $file"
done

# while
count=1
while [ $count -le 5 ]; do
    echo "รอบที่ $count"
    count=$((count + 1))
done
 
 
 
 
✅ สรุปหลักการ
 
🐧 เริ่มด้วย  #!/usr/bin/env bash  เสมอ
📦 ไม่มีช่องว่างรอบเครื่องหมาย  =  ตอนกำหนดตัวแปร
🛡️ ใส่ตัวแปรในเครื่องหมายคำพูด  "$VAR"  เพื่อป้องกันปัญหาช่องว่าง
⚙️ ใช้  $?  ตรวจสอบผลลัพธ์คำสั่งล่าสุด
📝 เขียนความคิดเห็นอธิบายสิ่งที่ทำและทำไม
 
plaintext  

> 📖 **ไฟล์ที่ 19 เสร็จสิ้น**

---

# 📄 ไฟล์ที่ 20 — docs/shell/bash-best-practices.md

```markdown
---
title: "Bash Best Practices"
type: "guide"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["shell", "bash", "best-practices", "reliability"]
---

# ✅ แนวทางเขียน Bash Script ที่น่าเชื่อถือ

> สคริปต์ที่ดี = รันได้บนเครื่องใครก็ได้ บอกสาเหตุเมื่อพัง และไม่ทำลายข้อมูล ✅

---

## 🛡️ เริ่มต้นด้วยความปลอดภัย

```bash
#!/usr/bin/env bash
set -euo pipefail
# -e → หยุดทันทีเมื่อคำสั่งล้มเหลว
# -u → หยุดเมื่อใช้ตัวแปรที่ยังไม่ได้กำหนด
# -o pipefail → ท่อพัง = ทั้งบรรทัดพัง
 
 
 
 
📏 กฎสำคัญ
 
✅ ตรวจสอบสิ่งที่ต้องการก่อนทำงาน
 
bash  
if ! command -v git &> /dev/null; then
    echo "❌ ต้องติดตั้ง Git ก่อนรันสคริปต์นี้"
    exit 1
fi
 
 
✅ ใช้เส้นทางที่ถูกต้อง — ไม่ใช่ hardcode
 
bash  
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.env"
 
 
✅ ข้อความแจ้งเตือนชัดเจน
 
bash  
info() { echo -e "\\033[1;34mℹ️  $*\\033[0m"; }
success() { echo -e "\\033[1;32m✅ $*\\033[0m"; }
warning() { echo -e "\\033[1;33m⚠️  $*\\033[0m"; }
error() { echo -e "\\033[1;31m❌ $*\\033[0m" >&2; }
 
 
 
 
⚠️ สิ่งที่ควรทำ และ ไม่ควรทำ
 
❌ ไม่ควร ✅ ควรทำ 
 rm *   rm -i *  หรือระบุชัดเจน 
 cd folder  `cd folder 
 ls *.txt  ใช้ for loop กับ *.txt โดยตรง 
`curl ... bash` 
ใช้ตัวแปรไม่ใส่  "   "$VAR"  ป้องกันปัญหาช่องว่าง 
 
 
 
✅ สรุปหลักการ
 
🛡️  set -euo pipefail  ทุกไฟล์ — ป้องกันข้อผิดพลาดเงียบๆ
📏 ตรวจสอบความต้องการก่อนเริ่มทำงาน
🔒 ใช้เส้นทางสัมพัทธ์จากที่อยู่สคริปต์ — รันจากที่ไหนก็ได้
⚡ บอกผู้ใช้ว่ากำลังทำอะไร และทำสำเร็จหรือล้มเหลว
🧪 ทดสอบสคริปต์ของคุณก่อนส่งให้คนอื่น
 
plaintext  

> 📖 **ไฟล์ที่ 20 เสร็จสิ้น**

---

# 📄 ไฟล์ที่ 21 — docs/shell/bash-automation.md

```markdown
---
title: "Bash Automation Recipes"
type: "reference"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["shell", "bash", "automation", "recipes"]
---

# 🤖 สูตรสำเร็จ: สคริปต์อัตโนมัติที่ใช้บ่อย

> คัดลอกไปปรับใช้ได้เลย ✅

---

## 📦 1. สำรองข้อมูล

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_SRC="./data"
BACKUP_DEST="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DEST"
tar -czf "${BACKUP_DEST}/${BACKUP_NAME}" "$BACKUP_SRC"

# ลบไฟล์เก่ากว่า 7 วัน
find "$BACKUP_DEST" -name "backup_*.tar.gz" -mtime +7 -delete

echo "✅ สำรองข้อมูลเสร็จ: $BACKUP_NAME"
 
 
 
 
🧹 2. ล้างไฟล์ชั่วคราว
 
bash  
#!/usr/bin/env bash
set -euo pipefail

echo "🧹 กำลังล้างไฟล์ชั่วคราว..."

find . -name "*.tmp" -delete
find . -name "*~" -delete
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

echo "✅ ล้างเสร็จ"
 
 
 
 
🔍 3. ค้นหาและแทนที่ข้อความ
 
bash  
#!/usr/bin/env bash
set -euo pipefail

OLD_TEXT="ข้อความเก่า"
NEW_TEXT="ข้อความใหม่"

grep -rl "$OLD_TEXT" . --include="*.md" --include="*.txt" | while read -r file; do
    sed -i.bak "s/$OLD_TEXT/$NEW_TEXT/g" "$file"
    rm "${file}.bak"
    echo "✅ อัปเดต: $file"
done
 
 
 
 
🚀 4. อัปเดตโปรเจกต์ Git
 
bash  
#!/usr/bin/env bash
set -euo pipefail

echo "🔄 กำลังอัปเดตโปรเจกต์..."
git checkout main
git pull origin main
git submodule update --init --recursive
echo "✅ อัปเดตเสร็จแล้ว"
 
 
 
 
📊 5. ตรวจสอบสภาพแวดล้อมก่อนรัน
 
bash  
#!/usr/bin/env bash
set -euo pipefail

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ ต้องติดตั้ง: $1"
        exit 1
    fi
}

check_command git
check_command docker
check_command python3

echo "✅ ทุกอย่างพร้อมทำงาน!"
 
 
 
 
✅ สรุป
 
🤖 สคริปต์เล็กๆ ช่วยลดงานซ้ำซ้อนได้มาก
📅 ใช้ cron หรือ Task Scheduler เพื่อรันอัตโนมัติตามเวลา
🛡️ ทดสอบสคริปต์ใหม่กับข้อมูลทดสอบก่อนเสมอ
 
plaintext  

> 📖 **ไฟล์ที่ 21 เสร็จสิ้น**

---

# 📄 ไฟล์ที่ 22 — docs/shell/git-commands.md

```markdown
---
title: "Git Quick Reference"
type: "cheatsheet"
status: "active"
created: "2026-10-15"
updated: "2026-10-24"
tags: ["shell", "git", "version-control", "cheatsheet"]
---

# 📋 คู่มือที่มือ: คำสั่ง Git ที่ใช้บ่อย

> พกพาได้ในหัวข้อ — จำไม่ได้ก็เปิดดูได้เร็ว ✅

---

## 🚀 เริ่มต้นโปรเจกต์
```bash
git init                                    # เริ่ม repo ใหม่
git clone <url>                             # โคลน repo มาที่เครื่อง
 
 
📝 บันทึกการเปลี่ยนแปลง
 
bash  
git status                                  # ดูสถานะไฟล์
git add .                                   # เพิ่มทุกไฟล์
git commit -m "ข้อความบันทึก"               # บันทึก
git log --oneline --graph --all             # ดูประวัติแบบย่อ
 
 
🌿 สาขาและการรวม
 
bash  
git branch                                   # ดูสาขาทั้งหมด
git checkout -b ชื่อสาขา                     # สร้าง+ย้ายไปสาขาใหม่
git checkout main                            # ย้ายไปสาขาหลัก
git merge ชื่อสาขา                           # รวมสาขาเข้าหากัน
git branch -d ชื่อสาขา                       # ลบสาขาในเครื่อง
 
 
☁️ ส่งและรับจากระยะไกล
 
bash  
git remote -v                                # ดูที่อยู่ระยะไกล
git push -u origin main                      # ส่งขึ้นครั้งแรก
git push                                     # ส่งครั้งต่อไป
git pull origin main                         # ดึง+รวม
git fetch origin                             # ดึงข้อมูลมาแต่ยังไม่รวม
 
 
🔧 แก้ไขข้อผิดพลาด
 
bash  
git checkout -- .                            # ยกเลิกการเปลี่ยนแปลงที่ยังไม่ commit
git reset HEAD~1 --mixed                     # ยกเลิก commit ล่าสุด กลับมาเป็น staged
git stash                                     # เก็บงานไว้ชั่วคราว
git stash pop                                 # นำงานกลับมา
git revert <รหัส>                            # สร้าง commit ย้อนกลับ
 
 
 
 
✅ คำแนะนำ
 
📝 เขียนข้อความ commit ให้ชัดเจน: "สั้นๆ บอกทำอะไร"
🌿 แยกงานแต่ละอย่างเป็นสาขา — main คือสาขาที่ทำงานได้เสมอ
☁️ รัน  git pull  ก่อนเริ่มงานเสมอ — ลดการชนกัน
🔄 ถ้าพัง ไม่ต้องกลัว — มีประวัติกลับไปยังจุดที่ทำงานได้เสมอ
 
plaintext  

> 📖 **ไฟล์ที่ 19–22 เสร็จสิ้น — จบหมวด Shell/Bash ✅**
> พิมพ์ **"ถัดไป"** เพื่อเข้าสู่หมวด **Docker / Containerization** ครับ! 😊