ได้เลยครับ! นี่คือ สคริปต์สร้างรายงานสถานะ พร้อมใช้งานทันทีครับ 📊✅
 
 
 
📊 รายงานสถานะ — Secret Scanning & Push Protection
 
เส้นทาง:  docs/github-enterprise/reports/security-status-report.md 
สคริปต์:  scripts/check-secret-scanning-status.py 
องค์กร: ZyntroAI / zyntromedia
อัปเดต: 29 กันยายน 2026
 
 
 
🐍 สคริปต์สร้างรายงาน — พร้อมรัน
 
บันทึกเป็น  scripts/check-secret-scanning-status.py :
 
python
  
#!/usr/bin/env python3
"""
ตรวจสอบสถานะ Secret Scanning & Push Protection ทุกที่เก็บในองค์กร
สร้างรายงาน Markdown พร้อมนำเสนอ
"""
import os
import sys
import json
from datetime import datetime

try:
    import requests
except ImportError:
    print("⚠️  ติดตั้งก่อน: pip install requests")
    sys.exit(1)

# ========== CONFIG ==========
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
ORG_NAME = os.getenv("GITHUB_ORG", "ZyntroAI")
API_BASE = "https://api.github.com"
# ============================

if not GITHUB_TOKEN:
    print("❌ ตั้งค่าตัวแปร: export GITHUB_TOKEN=ghp_...")
    sys.exit(1)

HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

def fetch_all_repos(org: str) -> list:
    """ดึงรายการที่เก็บทั้งหมด — ข้ามที่เก็บถาวร"""
    repos = []
    page = 1
    while True:
        url = f"{API_BASE}/orgs/{org}/repos"
        params = {"per_page": 100, "page": page, "sort": "pushed", "direction": "desc"}
        resp = requests.get(url, headers=HEADERS, params=params)
        resp.raise_for_status()
        data = resp.json()
        if not data:
            break
        repos.extend([r for r in data if not r.get("archived", False)])
        page += 1
    return repos

def get_security_config(repo_full_name: str) -> dict:
    """ดึงการตั้งค่าความปลอดภัยของที่เก็บ"""
    url = f"{API_BASE}/repos/{repo_full_name}/code-security/configuration"
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 404:
        return {"error": "not_found_or_no_permission"}
    if resp.status_code != 200:
        return {"error": f"status_{resp.status_code}"}
    return resp.json()

def generate_report(org: str) -> str:
    """สร้างรายงานเป็น Markdown"""
    repos = fetch_all_repos(org)
    results = []

    for repo in repos:
        name = repo["name"]
        full_name = repo["full_name"]
        config = get_security_config(full_name)

        if "error" in config:
            results.append({
                "name": name,
                "url": repo["html_url"],
                "secret_scanning": f"⚠️ {config['error']}",
                "push_protection": "—",
                "status": "unknown"
            })
            continue

        ss = config.get("secret_scanning", "disabled")
        pp = config.get("push_protection", "disabled")

        status = "✅ fully_protected" if ss == "enabled" and pp == "enabled" else \
                 "⚠️ partial" if ss == "enabled" or pp == "enabled" else \
                 "❌ disabled"

        results.append({
            "name": name,
            "url": repo["html_url"],
            "secret_scanning": ss,
            "push_protection": pp,
            "status": status
        })

    # สรุปจำนวน
    total = len(results)
    fully_protected = sum(1 for r in results if "fully_protected" in r["status"])
    partial = sum(1 for r in results if "partial" in r["status"])
    disabled = sum(1 for r in results if "disabled" in r["status"])
    unknown = sum(1 for r in results if "unknown" in r["status"])

    # ส่วนหัวรายงาน
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    md = [
        f"# 📊 รายงานสถานะความปลอดภัย — {org}",
        "",
        f"> สร้างเมื่อ: {now} UTC+7",
        f"> ตรวจสอบ: {total} ที่เก็บ (ไม่รวมที่เก็บถาวร)",
        "",
        "## 📈 สรุปภาพรวม",
        "",
        "| สถานะ | จำนวน | ร้อยละ |",
        "|---|---|---|",
        f"| ✅ ครบทั้งคู่ | {fully_protected} | {fully_protected/total*100:.1f}%",
        f"| ⚠️ เปิดบางส่วน | {partial} | {partial/total*100:.1f}%",
        f"| ❌ ปิดทั้งหมด | {disabled} | {disabled/total*100:.1f}%",
        f"| ❓ ไม่สามารถตรวจสอบ | {unknown} | {unknown/total*100:.1f}%",
        "",
        "## 📋 รายละเอียดแต่ละที่เก็บ",
        "",
        "| ที่เก็บ | Secret Scanning | Push Protection | สถานะ |",
        "|---|---|---|---|"
    ]

    # รายละเอียดแต่ละแถว — เรียงสถานะที่ต้องแก้ก่อน
    priority_order = {"❌ disabled": 0, "⚠️ partial": 1, "❓ unknown": 2, "✅ fully_protected": 3}
    sorted_results = sorted(results, key=lambda x: priority_order.get(x["status"], 99))

    for r in sorted_results:
        ss_icon = "✅" if r["secret_scanning"] == "enabled" else \
                  "⚠️" if "unknown" in r["status"] else "❌"
        pp_icon = "✅" if r["push_protection"] == "enabled" else \
                  "⚠️" if "unknown" in r["status"] else "❌"
        md.append(
            f"| [{r['name']}]({r['url']}) "
            f"| {ss_icon} {r['secret_scanning']} "
            f"| {pp_icon} {r['push_protection']} "
            f"| {r['status'].split()[0]} |"
        )

    # คำแนะนำส่วนท้าย
    md.extend([
        "",
        "## 🛠️ วิธีแก้ไข",
        "",
        "### เปิดทีเดียวทั้งองค์กร",
        "```bash",
        "# ติดตั้ง GitHub CLI ก่อน: gh auth login",
        "",
        "# เปิดสำหรับทุกที่เก็บ",
        f"gh api -X PATCH /orgs/{org}/code-security/config \\",
        '  -d \'{"secret_scanning_default_config": {"state": "enabled", "push_protection": "enabled", "enable_for_new_repos": true}}\'',
        "```",
        "",
        "### เปิดรายแห่งที่เหลือ",
        "เข้าไปที่แต่ละที่เก็บ → Settings → Code security & analysis → Enable ทั้งสองรายการ",
        "",
        "---",
        "> 📌 สคริปต์: `scripts/check-secret-scanning-status.py`",
        "> 🔄 รันใหม่: `python scripts/check-secret-scanning-status.py > reports/security-status-latest.md`"
    ])

    return "\n".join(md)

if __name__ == "__main__":
    try:
        report = generate_report(ORG_NAME)
        print(report)
    except Exception as e:
        print(f"❌ ผิดพลาด: {e}")
        sys.exit(1)
 
 
 
 
🚀 วิธีใช้งาน
 
1️⃣ ติดตั้ง & รัน
 
bash
  
# ตั้งค่า
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
export GITHUB_ORG=ZyntroAI

# รัน
python scripts/check-secret-scanning-status.py
 
 
2️⃣ บันทึกลงไฟล์รายงาน
 
bash
  
# สร้างโฟลเดอร์ถ้ายังไม่มี
mkdir -p docs/github-enterprise/reports

# บันทึกพร้อมวันที่
python scripts/check-secret-scanning-status.py \
  > docs/github-enterprise/reports/$(date +%Y%m%d)-security-status.md
 
 
3️⃣ ถ้ามีองค์กรรอง (เช่น zyntromedia)
 
bash
  
export GITHUB_ORG=zyntromedia
python scripts/check-secret-scanning-status.py
 
 
 
 
📋 ตัวอย่างผลลัพธ์ที่จะได้
 
markdown
  
# 📊 รายงานสถานะความปลอดภัย — ZyntroAI

> สร้างเมื่อ: 2026-09-29 07:50:00 UTC+7
> ตรวจสอบ: 12 ที่เก็บ (ไม่รวมที่เก็บถาวร)

## 📈 สรุปภาพรวม

| สถานะ | จำนวน | ร้อยละ |
|---|---|---|
| ✅ ครบทั้งคู่ | 5 | 41.7% |
| ⚠️ เปิดบางส่วน | 2 | 16.7% |
| ❌ ปิดทั้งหมด | 4 | 33.3% |
| ❓ ไม่สามารถตรวจสอบ | 1 | 8.3% |

## 📋 รายละเอียดแต่ละที่เก็บ

| ที่เก็บ | Secret Scanning | Push Protection | สถานะ |
|---|---|---|---|
| [fastapi-python-boilerplate](https://github.com/ZyntroAI/fastapi-python-boilerplate) | ❌ disabled | ❌ disabled | ❌ |
| [new-crystalcastle](https://github.com/ZyntroAI/new-crystalcastle) | ✅ enabled | ❌ disabled | ⚠️ |
| ... | ... | ... | ... |

## 🛠️ วิธีแก้ไข
...
 
 
 
 
⚙️ ตั้งค่าให้รันอัตโนมัติทุกเดือน (ใน CI)
 
เพิ่ม  .github/workflows/security-report.yml :
 
yaml
  
name: Monthly Security Status Report

on:
  schedule:
    - cron: '0 9 1 * *'  # ทุกวันที่ 1 เดือนละครั้ง 9 โมงเช้า
  workflow_dispatch:  # สามารถสั่งรันด้วยตนเองได้

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
          
      - name: ติดตั้ง
        run: pip install requests
          
      - name: สร้างรายงาน
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN_FOR_REPORT }}
          GITHUB_ORG: ZyntroAI
        run: |
          mkdir -p docs/github-enterprise/reports
          python scripts/check-secret-scanning-status.py \
            > docs/github-enterprise/reports/$(date +%Y%m%d)-security-status.md
          
      - name: Commit & Push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "actions@github.com"
          git add docs/github-enterprise/reports/
          git commit -m "📊 Monthly security status update" || echo "No changes"
          git push
 
 
 
 
✅ เช็คลิสต์นำไปใช้
 
บันทึก  check-secret-scanning-status.py  ที่  scripts/ 
ทดสอบรันในเครื่อง → ได้รายงาน
ตั้งค่า  GH_TOKEN_FOR_REPORT  ใน Secrets (ต้องมีสิทธิ์อ่าน  code-security )
เปิดเวิร์กโฟลว์ → รันด้วยตนเองครั้งแรก
ตรวจสอบว่าไฟล์รายงานถูกสร้างจริงใน  docs/.../reports/ 
 
 
 
ต้องการปรับแต่งอะไรเพิ่มไหมครับ เช่น:
 
- 📧 ส่งรายงานเข้าอีเมล/ไลน์เมื่อครบกำหนด
- 🔍 เพิ่มตรวจจับสิ่งอื่นๆ ด้วย (Branch Protection / 2FA)
- 📈 เปรียบเทียบเดือนก่อนหน้า
 
บอกได้เลยครับ! 🚀
