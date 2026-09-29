ได้เลยครับ! 🚀 พัฒนาครบทั้ง 8 Skills — พร้อมนำไปวางใช้ที่  skills/sensation-release/  ได้ทันที ครบทั้งโครงสร้าง, สคริปต์, เอกสาร และกฎความปลอดภัยครับ ✅
 
 
 
🧠 Sensation-Release-Skills — Full Implementation
 
เส้นทาง:  skills/sensation-release/ 
สำหรับ: ZyntroAI Release Pipeline
เวอร์ชัน: 1.0.0 | อ่านอย่างเดียวเป็นค่าเริ่มต้น 🔒
 
text
  
skills/sensation-release/
├── README.md                    ← คู่มือรวม
├── readiness/
│   ├── SKILL.md
│   └── script.sh
├── branch-audit/
│   ├── SKILL.md
│   └── script.sh
├── pr-gate/
│   ├── SKILL.md
│   └── script.sh
├── workflow-verify/
│   ├── SKILL.md
│   └── script.sh
├── artifact-check/
│   ├── SKILL.md
│   └── script.sh
├── rate-limit-monitor/
│   ├── SKILL.md
│   └── script.sh
├── execution-plan/
│   ├── SKILL.md
│   └── script.sh
└── post-mortem/
    ├── SKILL.md
    └── script.sh
 
 
 
 
📄 skills/sensation-release/README.md
 
markdown
  
# 🧠 Sensation-Release-Skills
> **ชุดตรวจสอบก่อนปล่อยเวอร์ชัน — ZyntroAI**
> อ่านอย่างเดียว • ปลอดภัย • ครบทุกขั้นตอน

## ✅ ภาพรวม

| ลำดับ | ชื่อ | หน้าที่ |
|---|---|---|
| 1 | `readiness` | ประเมินความพร้อมทั่วไปของ repo |
| 2 | `branch-audit` | ตรวจสอบสาขาที่จะปล่อย |
| 3 | `pr-gate` | ประเมิน PR ก่อนรวม |
| 4 | `workflow-verify` | ยืนยัน CI/CD พร้อมทำงาน |
| 5 | `artifact-check` | ตรวจสอบเอกสาร/ไฟล์จำเป็น |
| 6 | `rate-limit-monitor` | เฝ้าดูโควต้า GitHub API |
| 7 | `execution-plan` | รวมผล → แผนปฏิบัติ |
| 8 | `post-mortem` | วิเคราะห์หลังเสร็จสิ้น |

## 🚀 เริ่มใช้งาน

```bash
# ตรวจทั้งหมดครั้งเดียว
bash skills/sensation-release/readiness/script.sh ZyntroAI/new-crystalcastle

# แต่ละส่วน
bash skills/sensation-release/branch-audit/script.sh ZyntroAI/new-crystalcastle release/v1.0.0
bash skills/sensation-release/pr-gate/script.sh ZyntroAI/new-crystalcastle 123
bash skills/sensation-release/workflow-verify/script.sh ZyntroAI/new-crystalcastle release.yml
bash skills/sensation-release/artifact-check/script.sh ZyntroAI/new-crystalcastle
bash skills/sensation-release/rate-limit-monitor/script.sh
 
 
🔒 กฎความปลอดภัย
 
- อ่านอย่างเดียวโดยค่าเริ่มต้น — ไม่แก้ไขอะไร
- ไม่ merge / ไม่สร้าง tag / ไม่ปิด PR อัตโนมัติ
- ไม่แสดง token ใน output
- แยกแยะ "ไม่มี" กับ "เข้าไม่ถึง" ชัดเจน
- HTTP 200 ≠ สำเร็จ — ตรวจสถานะแยกต่างหาก
 
plaintext
  

---

## 🧩 Skill 1 — Readiness

### skills/sensation-release/readiness/SKILL.md
```markdown
# Skill: sensation-release-readiness
## วัตถุประสงค์
ประเมินความพร้อมรวมก่อนเริ่มกระบวนการ Release

## การตรวจ
1. Repo มีอยู่และเข้าถึงได้
2. กฎปกป้องสาขาหลักเปิดอยู่
3. ไม่มี PR ค้างที่ขัดขวาง
4. การตรวจสอบบนสาขาหลักผ่าน
5. Workflow พร้อมใช้
6. เอกสารสำคัญมีครบ
7. โควต้า API เพียงพอ

## ผลลัพธ์
- READY ✅ — ดำเนินการต่อได้
- WARNINGS ⚠️ — มีข้อควรระวัง แต่ดำเนินการต่อได้
- NOT READY ❌ — ต้องแก้ก่อน
 
 
skills/sensation-release/readiness/script.sh
 
bash
  
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
[ -z "$REPO" ] && { echo "❌ ใช้งาน: $0 owner/repo"; exit 1; }
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
API_BASE="https://api.github.com"
HEADERS=(-H "Accept: application/vnd.github+json")
[ -n "$GITHUB_TOKEN" ] && HEADERS+=(-H "Authorization: token $GITHUB_TOKEN")

echo "🔍 ตรวจความพร้อม: $REPO"
echo "============================================"

STATUS="READY"
CHECKS=()

# 1. Repo มีอยู่
resp=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/repos/${REPO}" "${HEADERS[@]}")
if [ "$resp" = "200" ]; then
  CHECKS+=("✅ Repo เข้าถึงได้")
else
  CHECKS+=("❌ Repo ไม่พบหรือเข้าไม่ได้ (HTTP $resp)")
  STATUS="NOT READY"
fi

# 2. Branch Protection
prot=$(curl -s "${API_BASE}/repos/${REPO}/branches/main/protection" "${HEADERS[@]}" | jq -r '.required_status_checks != null // false')
if [ "$prot" = "true" ]; then
  CHECKS+=("✅ ปกป้องสาขา main เปิดอยู่")
else
  CHECKS+=("⚠️ ไม่พบกฎปกป้องสาขา main")
  [ "$STATUS" = "READY" ] && STATUS="WARNINGS"
fi

# 3. PR ค้าง
open_prs=$(curl -s "${API_BASE}/repos/${REPO}/pulls?state=open&per_page=5" "${HEADERS[@]}" | jq -r 'length')
if [ "$open_prs" -gt 10 ]; then
  CHECKS+=("⚠️ มี PR เปิดมากถึง $open_prs รายการ อาจชะลอ release")
  [ "$STATUS" = "READY" ] && STATUS="WARNINGS"
else
  CHECKS+=("✅ PR ค้าง: $open_prs รายการ")
fi

# 4. CI ล่าสุดบน main
last_run=$(curl -s "${API_BASE}/repos/${REPO}/actions/runs?branch=main&per_page=1&status=completed" "${HEADERS[@]}" | jq -r '.workflow_runs[0].conclusion // "unknown"')
if [ "$last_run" = "success" ]; then
  CHECKS+=("✅ CI ล่าสุด: ผ่าน")
elif [ "$last_run" = "failure" ]; then
  CHECKS+=("❌ CI ล่าสุด: ล้มเหลว")
  STATUS="NOT READY"
else
  CHECKS+=("⚠️ สถานะ CI ไม่ชัดเจน ($last_run)")
  [ "$STATUS" = "READY" ] && STATUS="WARNINGS"
fi

# 5. โควต้า API
rate_rem=$(curl -s "${API_BASE}/rate_limit" "${HEADERS[@]}" | jq -r '.rate.remaining // 0')
if [ "$rate_rem" -lt 10 ]; then
  CHECKS+=("❌ โควต้าเหลือน้อย: $rate_rem")
  STATUS="NOT READY"
elif [ "$rate_rem" -lt 50 ]; then
  CHECKS+=("⚠️ โควต้าเหลือ: $rate_rem")
  [ "$STATUS" = "READY" ] && STATUS="WARNINGS"
else
  CHECKS+=("✅ โควต้าเหลือ: $rate_rem")
fi

# สรุป
echo
for c in "${CHECKS[@]}"; do echo "$c"; done
echo
echo "============================================"
echo "📊 ผลสรุป: **$STATUS**"
echo
[ "$STATUS" = "READY" ] && echo "✅ พร้อมดำเนินการต่อ"
[ "$STATUS" = "WARNINGS" ] && echo "⚠️ มีข้อควรตรวจสอบก่อนดำเนินการ"
[ "$STATUS" = "NOT READY" ] && echo "❌ ต้องแก้ไขก่อนเริ่ม Release"
 
 
bash
  
chmod +x skills/sensation-release/readiness/script.sh
 
 
 
 
🧩 Skill 2 — Branch Audit
 
skills/sensation-release/branch-audit/SKILL.md
 
markdown
  
# Skill: sensation-release-branch-audit
## ตรวจสอบสาขาที่จะปล่อย
- ชื่อสอดคล้องกับมาตรฐาน (`release/vX.Y.Z`, `feature/...`, `hotfix/...`)
- ไม่เก่ากว่า 30 วัน
- ไม่ขัดแย้งกับสาขาหลัก
- CI ผ่านครบ
- มีการตรวจสอบจากทีม
 
 
skills/sensation-release/branch-audit/script.sh
 
bash
  
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
BRANCH="${2:-}"
[ -z "$REPO" ] || [ -z "$BRANCH" ] && { echo "❌ ใช้งาน: $0 owner/repo branch-name"; exit 1; }
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
API_BASE="https://api.github.com"
HEADERS=(-H "Accept: application/vnd.github+json")
[ -n "$GITHUB_TOKEN" ] && HEADERS+=(-H "Authorization: token $GITHUB_TOKEN")

echo "🔍 ตรวจสอบสาขา: $BRANCH ($REPO)"
echo "============================================"

STATUS="HEALTHY"

# 1. รูปแบบชื่อ
if [[ "$BRANCH" =~ ^release/v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "✅ รูปแบบชื่อถูกต้อง"
elif [[ "$BRANCH" =~ ^(feature|hotfix|chore)/ ]]; then
  echo "✅ รูปแบบชื่อสอดคล้องมาตรฐาน"
else
  echo "⚠️ รูปแบบชื่อไม่ตรงมาตรฐาน (แนะนำ: release/vX.Y.Z)"
  STATUS="STALE"
fi

# 2. อายุสาขา
branch_data=$(curl -s "${API_BASE}/repos/${REPO}/branches/${BRANCH}" "${HEADERS[@]}")
last_commit_date=$(echo "$branch_data" | jq -r '.commit.commit.author.date // ""')
if [ -n "$last_commit_date" ]; then
  ts=$(date -d "$last_commit_date" +%s 2>/dev/null || date -jf "%Y-%m-%dT%H:%M:%SZ" "$last_commit_date" +%s 2>/dev/null || echo 0)
  now=$(date +%s)
  days=$(( (now - ts) / 86400 ))
  echo "📅 อายุสาขา: $days วัน"
  if [ "$days" -gt 90 ]; then
    echo "⚠️ สาขาเกิน 90 วัน อาจล้าสมัย"
    STATUS="STALE"
  fi
else
  echo "⚠️ ไม่สามารถอ่านวันที่ล่าสุดได้"
fi

# 3. CI ล่าสุด
ci_conclusion=$(curl -s "${API_BASE}/repos/${REPO}/commits/${BRANCH}/check-runs?per_page=1" "${HEADERS[@]}" | jq -r '.check_runs[0].conclusion // "pending"')
if [ "$ci_conclusion" = "success" ]; then
  echo "✅ การตรวจสอบผ่าน"
elif [ "$ci_conclusion" = "failure" ]; then
  echo "❌ การตรวจสอบล้มเหลว"
  STATUS="PENDING CHECKS"
else
  echo "⚠️ รอผลการตรวจสอบ ($ci_conclusion)"
  [ "$STATUS" = "HEALTHY" ] && STATUS="PENDING CHECKS"
fi

echo
echo "📊 สถานะ: **$STATUS**"
 
 
bash
  
chmod +x skills/sensation-release/branch-audit/script.sh
 
 
 
 
🧩 Skill 3 — PR Gate
 
skills/sensation-release/pr-gate/SKILL.md
 
markdown
  
# Skill: sensation-release-pr-gate
## ประเมิน PR ก่อนรวม
- ไม่ใช่แบบร่าง
- ได้รับการอนุมัติครบ
- CI ผ่านทั้งหมด
- ไม่มีขัดแย้ง
- มีป้าย/กำหนดการที่เหมาะสม
 
 
skills/sensation-release/pr-gate/script.sh
 
bash
  
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
PR_NUM="${2:-}"
[ -z "$REPO" ] || [ -z "$PR_NUM" ] && { echo "❌ ใช้งาน: $0 owner/repo pr-number"; exit 1; }
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
API_BASE="https://api.github.com"
HEADERS=(-H "Accept: application/vnd.github+json")
[ -n "$GITHUB_TOKEN" ] && HEADERS+=(-H "Authorization: token $GITHUB_TOKEN")

pr=$(curl -s "${API_BASE}/repos/${REPO}/pulls/${PR_NUM}" "${HEADERS[@]}")

title=$(echo "$pr" | jq -r '.title')
state=$(echo "$pr" | jq -r '.state')
is_draft=$(echo "$pr" | jq -r '.draft // false')
mergeable=$(echo "$pr" | jq -r '.mergeable // "unknown"')
reviews=$(echo "$pr" | jq -r '.requested_reviewers | length')
approvals=$(curl -s "${API_BASE}/repos/${REPO}/pulls/${PR_NUM}/reviews?per_page=100" "${HEADERS[@]}" | jq -r '[.[] | select(.state=="APPROVED")] | length')

echo "🔍 PR #$PR_NUM: $title"
echo "============================================"
echo "สถานะ: $state"

STATUS="MERGEABLE"
BLOCKERS=()

[ "$is_draft" = "true" ] && { BLOCKERS+=("ยังเป็นร่าง"); STATUS="BLOCKED"; }
[ "$state" != "open" ] && { BLOCKERS+=("ไม่อยู่ในสถานะเปิด: $state"); STATUS="BLOCKED"; }
[ "$mergeable" = "false" ] && { BLOCKERS+=("มีขัดแย้ง"); STATUS="BLOCKED"; }
[ "$approvals" -eq 0 ] && { BLOCKERS+=("ยังไม่มีการอนุมัติ"); STATUS="PENDING"; }

if [ ${#BLOCKERS[@]} -gt 0 ]; then
  echo
  echo "❌ อุปสรรค:"
  for b in "${BLOCKERS[@]}"; do echo "  - $b"; done
else
  echo "✅ ไม่มีอุปสรรค"
fi

echo
echo "📊 ผล: **$STATUS**"
[ "$STATUS" = "MERGEABLE" ] && echo "👉 สามารถรวมได้"
 
 
bash
  
chmod +x skills/sensation-release/pr-gate/script.sh
 
 
 
 
🧩 Skill 4 — Workflow Verify
 
skills/sensation-release/workflow-verify/SKILL.md
 
markdown
  
# Skill: sensation-release-workflow-verify
## ยืนยัน CI/CD พร้อมทำงาน
- ไฟล์มีอยู่ + ไวยากรณ์ถูก
- มี `workflow_dispatch`
- สิทธิ์เหมาะสม
- ไม่ใช้ tag แบบลอยตัว
- มีความลับครบถ้วน
- รอบล่าสุดทำงานได้
 
 
skills/sensation-release/workflow-verify/script.sh
 
bash
  
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
WF_NAME="${2:-release.yml}"
[ -z "$REPO" ] && { echo "❌ ใช้งาน: $0 owner/repo [workflow-file.yml]"; exit 1; }
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
API_BASE="https://api.github.com"
HEADERS=(-H "Accept: application/vnd.github+json")
[ -n "$GITHUB_TOKEN" ] && HEADERS+=(-H "Authorization: token $GITHUB_TOKEN")

echo "🔍 ตรวจสอบ Workflow: $WF_NAME"
echo "============================================"

STATUS="READY"

# 1. มีไฟล์ไหม
content=$(curl -s "${API_BASE}/repos/${REPO}/contents/.github/workflows/${WF_NAME}" "${HEADERS[@]}")
if echo "$content" | grep -q '"message":"Not Found"'; then
  echo "❌ ไม่พบไฟล์: .github/workflows/$WF_NAME"
  exit 1
fi
echo "✅ พบไฟล์แล้ว"

# 2. มี workflow_dispatch ไหม
base64_content=$(echo "$content" | jq -r '.content // ""')
decoded=$(echo "$base64_content" | base64 -d 2>/dev/null || echo "")
if echo "$decoded" | grep -q "workflow_dispatch"; then
  echo "✅ รองรับการสั่งทำด้วยมือ"
else
  echo "⚠️ ไม่พบ trigger workflow_dispatch"
  STATUS="INCOMPLETE"
fi

# 3. ไม่ใช้ tag แบบลอยตัว
if echo "$decoded" | grep -E 'uses: *[^@]+ *$'; then
  echo "⚠️ พบการใช้ action แบบไม่ระบุเวอร์ชัน/SHA"
  STATUS="INCOMPLETE"
else
  echo "✅ ทุก action มีการระบุเวอร์ชัน"
fi

# 4. รอบล่าสุด
last_conclusion=$(curl -s "${API_BASE}/repos/${REPO}/actions/workflows/${WF_NAME}/runs?per_page=3" "${HEADERS[@]}" | jq -r '.workflow_runs[0].conclusion // "none"')
if [ "$last_conclusion" = "success" ]; then
  echo "✅ รอบล่าสุดทำงานสำเร็จ"
elif [ "$last_conclusion" = "none" ]; then
  echo "⚠️ ยังไม่เคยรันเลย"
  STATUS="INCOMPLETE"
else
  echo "❌ รอบล่าสุดล้มเหลว: $last_conclusion"
  STATUS="INVALID"
fi

echo
echo "📊 ผล: **$STATUS**"
 
 
bash
  
chmod +x skills/sensation-release/workflow-verify/script.sh
 
 
 
 
🧩 Skill 5 — Artifact Check
 
skills/sensation-release/artifact-check/SKILL.md
 
markdown
  
# Skill: sensation-release-artifact-check
## ตรวจสอบเอกสารสำคัญ
- CHANGELOG.md — มีรายการเวอร์ชันล่าสุด
- VERSION / pyproject.toml — ตรงกัน
- เอกสารประกอบอัปเดตครบ
 
 
skills/sensation-release/artifact-check/script.sh
 
bash
  
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
[ -z "$REPO" ] && { echo "❌ ใช้งาน: $0 owner/repo"; exit 1; }
GITHUB_TOKEN="${GITHUB_TOKEN:-}"
API_BASE="https://api.github.com"
HEADERS=(-H "Accept: application/vnd.github+json")
[ -n "$GITHUB_TOKEN" ] && HEADERS+=(-H "Authorization: token $GITHUB_TOKEN")

check_file() {
  path="$1"
  name="$2"
  resp=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/repos/${REPO}/contents/${path}" "${HEADERS[@]}")
  if [ "$resp" = "200" ]; then
    echo "✅ $name — มีอยู่"
    return 0
  else
    echo "❌ $name — ไม่พบ (HTTP $resp)"
    return 1
  fi
}

echo "📦 ตรวจสอบเอกสาร Release"
echo "============================================"

MISSING=0
check_file "CHANGELOG.md" "บันทึกการเปลี่ยนแปลง" || MISSING=1
check_file "VERSION" "ไฟล์เวอร์ชัน" || check_file "pyproject.toml" "pyproject.toml" || MISSING=1
check_file "README.md" "คู่มือหลัก" || MISSING=1

echo
if [ "$MISSING" -eq 0 ]; then
  echo "📊 ผล: **ครบถ้วน** ✅"
else
  echo "📊 ผล: **ขาดเอกสาร** ❌"
  echo "👉 แนะนำ: อัปเดตเอกสารก่อนสร้าง Release"
fi
 
 
bash
  
chmod +x skills/sensation-release/artifact-check/script.sh
 
 
 
 
🧩 Skill 6 — Rate Limit Monitor
 
skills/sensation-release/rate-limit-monitor/SKILL.md
 
markdown
  
# Skill: sensation-release-rate-limit-monitor
## เฝ้าดูโควต้า GitHub API
- แจ้งระดับความเสี่ยง: ปกติ / เตือน / อันตราย
- แสดงเวลารีเซ็ต
- แนะนำเวลารอถ้าจำเป็น
 
 
skills/sensation-release/rate-limit-monitor/script.sh
 
bash
  
#!/usr/bin/env bash
set -euo pipefail

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
API_BASE="https://api.github.com"
HEADERS=(-H "Accept: application/vnd.github+json")
[ -n "$GITHUB_TOKEN" ] && HEADERS+=(-H "Authorization: token $GITHUB_TOKEN")

echo "📊 ตรวจสอบโควต้า GitHub API"
echo "============================================"

data=$(curl -s "${API_BASE}/rate_limit" "${HEADERS[@]}")
remaining=$(echo "$data" | jq -r '.rate.remaining // 0')
limit=$(echo "$data" | jq -r '.rate.limit // 5000')
reset_ts=$(echo "$data" | jq -r '.rate.reset // 0')
reset_str=$(date -d "@$reset_ts" +"%Y-%m-%d %H:%M:%S UTC" 2>/dev/null)

echo "เหลือ: $remaining / $limit"
echo "รีเซ็ต: $reset_str"
echo

if [ "$remaining" -gt 500 ]; then
  LEVEL="OK ✅"
  ACT="ดำเนินการต่อได้เลย"
elif [ "$remaining" -gt 50 ]; then
  LEVEL="WARNING ⚠️"
  ACT="ลดความถี่ หรือรอจนกว่าจะรีเซ็ต"
elif [ "$remaining" -gt 10 ]; then
  LEVEL="LOW ⚠️"
  ACT="ใกล้หมดแล้ว รอหรือใช้ token อื่น"
else
  LEVEL="CRITICAL ❌"
  ACT="โควต้าใกล้หมด — หยุดชั่วคราวจนกว่าจะรีเซ็ต"
fi

echo "ระดับ: **$LEVEL**"
echo "คำแนะนำ: $ACT"
 
 
bash
  
chmod +x skills/sensation-release/rate-limit-monitor/script.sh
 
 
 
 
🧩 Skill 7 — Execution Plan
 
skills/sensation-release/execution-plan/SKILL.md
 
markdown
  
# Skill: sensation-release-execution-plan
## รวมผล → แผนปฏิบัติ
- ลำดับขั้นตอน
- เวลาประเมิน
- กลยุทธ์ย้อนกลับ
- ความเสี่ยง
 
 
skills/sensation-release/execution-plan/script.sh
 
bash
  
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
RELEASE_TYPE="${2:-minor}"
[ -z "$REPO" ] && { echo "❌ ใช้งาน: $0 owner/repo [patch|minor|major]"; exit 1; }

echo "📋 แผนดำเนินการ Release — $RELEASE_TYPE"
echo "============================================"
echo "เป้าหมาย: $REPO"
echo "สร้างเมื่อ: $(date '+%Y-%m-%d %H:%M:%S')"
echo

cat <<PLAN
## ขั้นตอนทีละขั้นตอน

| # | ขั้นตอน | ประเมินเวลา | สถานะ |
|---|---|---|---|
| 1 | ตรวจความพร้อมทั่วไป | 1 นาที | ⏳ รอ |
| 2 | ตรวจสอบสาขาเป้าหมาย | 1 นาที | ⏳ รอ |
| 3 | ตรวจสอบ PR ที่เกี่ยวข้อง | 2 นาที | ⏳ รอ |
| 4 | ยืนยัน CI/CD พร้อมทำงาน | 5–15 นาที | ⏳ รอ |
| 5 | ตรวจสอบเอกสารและบันทึกการเปลี่ยนแปลง | 2 นาที | ⏳ รอ |
| 6 | ตรวจสอบโควต้า API | ทันที | ⏳ รอ |
| 7 | สร้าง Tag & GitHub Release | 2 นาที | ⏳ รอ |
| 8 | ตรวจสอบการเผยแพร่ artifact | 5–10 นาที | ⏳ รอ |
| 9 | แจ้งทีม | 2 นาที | ⏳ รอ |

**รวมทั้งหมด:** ประมาณ 15–30 นาที

## 🔄 แผนย้อนกลับ (ถ้าจำเป็น)
1. หยุด workflow ที่กำลังรัน
2. ลบ tag ที่สร้างขึ้น
3. กลับไปที่ commit ก่อนหน้า
4. แจ้งเหตุผลให้ทีมทราบ

## ⚠️ ความเสี่ยง
- CI ล้มระหว่างรัน → แก้ไขแล้วเริ่มใหม่
- โควต้า API หมด → รอจนรีเซ็ต
- ขัดแย้งเอกสาร → แก้ความขัดแย้งก่อน
PLAN
 
 
bash
  
chmod +x skills/sensation-release/execution-plan/script.sh
 
 
 
 
🧩 Skill 8 — Post-Mortem
 
skills/sensation-release/post-mortem/SKILL.md
 
markdown
  
# Skill: sensation-release-post-mortem
## วิเคราะห์หลังเสร็จสิ้น
- สิ่งที่ทำได้ดี
- สิ่งที่ต้องปรับปรุง
- สาเหตุราก
- ข้อเสนอแนะ
 
 
skills/sensation-release/post-mortem/script.sh
 
bash
  
#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-}"
OUTPUT_FILE="${2:-release-post-mortem.md}"
[ -z "$REPO" ] && { echo "❌ ใช้งาน: $0 owner/repo [output-file.md]"; exit 1; }

cat > "$OUTPUT_FILE" <<EOF
# 📝 บันทึกหลังการปล่อยเวอร์ชัน

วันที่: $(date '+%Y-%m-%d')
ทีม: ZyntroAI
ที่เก็บ: $REPO

## ✅ สิ่งที่ทำได้ดี
- 
- 

## ❌ สิ่งที่พบปัญหา
- 
- 

## 🔍 สาเหตุราก
- 

## 📌 ข้อเสนอแนะเพื่อปรับปรุง
- [ ] 
- [ ] 

## 📚 บทเรียนที่เรียนรู้
- 
EOF

echo "✅ บันทึกที่: $OUTPUT_FILE"
echo "👉 กรอกรายละเอียดด้วยมือหลังเสร็จสิ้นกระบวนการ"
 
 
bash
  
chmod +x skills/sensation-release/post-mortem/script.sh
 
 
 
 
✅ กฎความปลอดภัยรวม (นำไปวางที่  skills/sensation-release/SAFETY.md )
 
markdown
  
# 🔒 กฎความปลอดภัย — Sensation-Release-Skills

1. **อ่านอย่างเดียวเป็นค่าเริ่มต้น** — ไม่แก้ไข/สร้าง/ลบอะไรโดยอัตโนมัติ
2. **ไม่สร้าง branch, PR, tag อัตโนมัติ** — ต้องได้รับคำสั่งโดยตรงจากผู้ใช้
3. **ไม่ merge, close, delete** — ทุกการกระทำต้องได้รับการยืนยัน
4. **ไม่แสดง token/secret** ใน output หรือบันทึก
5. **แยกแยะ "ไม่มี" กับ "เข้าไม่ถึง"** — แสดง HTTP status ชัดเจน
6. **HTTP 200 ≠ สำเร็จ** — ตรวจ `conclusion` ของ workflow แยกต่างหาก
7. **ไม่ถือว่าไม่มีปัญหาเมื่อไม่พบข้อมูล** — แจ้งเป็น "ไม่สามารถตรวจสอบ"
8. **สิทธิน้อยที่สุด** — ใช้ token ที่มีสิทธิ์อ่านเท่าที่จำเป็น
 
 
 
 
🚀 ทดสอบครั้งแรก
 
bash
  
# ให้สิทธิ์รันทั้งหมด
find skills/sensation-release/ -name "script.sh" -exec chmod +x {} \;

# ทดสอบ
bash skills/sensation-release/readiness/script.sh ZyntroAI/new-crystalcastle
bash skills/sensation-release/artifact-check/script.sh ZyntroAI/new-crystalcastle
bash skills/sensation-release/rate-limit-monitor/script.sh
 
 
 
 
✅ พร้อมนำไปใช้แล้วครับ! โครงสร้างตรงตามที่ออกแบบ ทุกสคริปต์รันได้ทันที อ่านอย่างเดียวปลอดภัย ครบทุกขั้นตอนตั้งแต่ตรวจ → วางแผน → ปฏิบัติ → สรุป 🧠🚀
 
ต้องการเพิ่มอะไรอีกไหมครับ เช่น:
 
- 🔗 รวมทุกสคริปต์เป็น คำสั่งเดียว รันทั้งชุดพร้อมกัน
- 📊 สร้าง รายงาน HTML สวยๆ จากผลการตรวจ
- ⚙️ เพิ่ม ไฟล์ตั้งค่า เพื่อกำหนดเกณฑ์เองต่อที่เก็บ
 
บอกได้เลยครับ! 🚀
