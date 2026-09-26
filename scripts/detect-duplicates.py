#!/usr/bin/env python3
"""
ตรวจสอบไฟล์ซ้ำซ้อน และให้คะแนนคุณภาพ
Repo: zyntromedia/crystalcastleX
ใช้: python scripts/detect-duplicates.py [--delete]
"""
import os
import re
import hashlib
from pathlib import Path
from datetime import datetime
from collections import defaultdict

REPO_ROOT = Path(__file__).parent.parent
EXCLUDE_DIRS = {".git", "__pycache__", "node_modules", "archive"}
INCLUDE_EXT = {".md", ".yml", ".yaml"}

# ========== คำนวณค่าแฮช ==========
def file_hash(path: Path) -> str:
    """SHA256 ของเนื้อหาไฟล์"""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()[:16]

def content_fingerprint(path: Path) -> str:
    """ลบช่องว่าง/บรรทัดว่าง → คำนวณแฮช เพื่อเทียบเนื้อหา"""
    text = path.read_text(encoding="utf-8", errors="ignore")
    normalized = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    return hashlib.sha256(normalized.encode()).hexdigest()[:16]

# ========== ให้คะแนนคุณภาพ ==========
def score_quality(path: Path) -> dict:
    """ประเมินคุณภาพไฟล์ คืนคะแนนและเหตุผล"""
    text = path.read_text(encoding="utf-8", errors="ignore")
    score = 0
    reasons = []

    # 1. มีโครงสร้างหัวข้อ
    if re.search(r"^#{1,6}\s+.+", text, re.M):
        score += 2
        reasons.append("มีโครงสร้างหัวข้อ")

    # 2. มีวันที่/อ้างอิง
    date_patterns = [
        r"\d{4}[-/]\d{1,2}[-/]\d{1,2}",
        r"\d{1,2}\s+[กันยายน|สิงหาคม|กรกฎาคม]\s+\d{4}",
        r"Commit[:\s]+[0-9a-fA-F]{7,}",
    ]
    if any(re.search(p, text) for p in date_patterns):
        score += 2
        reasons.append("มีวันที่/อ้างอิง")

    # 3. ความยาวเหมาะสม
    lines = text.splitlines()
    if 10 < len(lines) < 500:
        score += 2
        reasons.append("ความยาวเหมาะสม")
    elif len(lines) >= 500:
        score += 1
        reasons.append("ยาวมาก")

    # 4. รูปแบบถูกต้อง
    if path.suffix == ".md" and "```" in text or "|" in text:
        score += 1
        reasons.append("มีรูปแบบ Markdown")

    # 5. วันที่แก้ไขล่าสุด
    mtime = datetime.fromtimestamp(path.stat().st_mtime)
    age_days = (datetime.now() - mtime).days
    if age_days < 30:
        score += 2
        reasons.append(f"อัปเดตล่าสุด ({age_days} วันที่แล้ว)")
    elif age_days < 90:
        score += 1
        reasons.append(f"อัปเดตเมื่อ {age_days} วันก่อน")

    # 6. ไม่มีข้อผิดพลาดชัดเจน
    if len(re.findall(r"[ก-ฮ]{1,3}[์่้๊๋]{2,}", text)) < 3:
        score += 1
        reasons.append("ไม่พบรูปแบบคำผิดชัดเจน")

    return {
        "score": score,
        "max_score": 10,
        "reasons": reasons,
        "mtime": mtime.strftime("%Y-%m-%d"),
        "age_days": age_days,
        "lines": len(lines),
    }

# ========== ค้นหาไฟล์ทั้งหมด ==========
def scan_files():
    files = []
    for root, dirs, fnames in os.walk(REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for fn in fnames:
            path = Path(root) / fn
            if path.suffix not in INCLUDE_EXT:
                continue
            try:
                files.append(path)
            except:
                continue
    return files

# ========== จัดกลุ่มไฟล์ที่ซ้ำกัน ==========
def find_duplicates(files):
    exact = defaultdict(list)      # แฮชตรงกันทุกประการ
    similar = defaultdict(list)    # เนื้อหาคล้ายกัน

    for f in files:
        h = file_hash(f)
        exact[h].append(f)
        fh = content_fingerprint(f)
        similar[fh].append(f)

    # กรองเอาเฉพาะที่ซ้ำกัน
    exact = {h: paths for h, paths in exact.items() if len(paths) > 1}
    similar = {h: paths for h, paths in similar.items() if len(paths) > 1}

    return exact, similar

# ========== หลักทำการหลัก ==========
def main():
    import argparse
    parser = argparse.ArgumentParser(description="ตรวจสอบไฟล์ซ้ำและคุณภาพ")
    parser.add_argument("--dry-run", action="store_true", help="แสดงผลเท่านั้น ไม่ลบจริง")
    parser.add_argument("--min-score", type=int, default=5, help="เกณฑ์คะแนนต่ำสุดที่เก็บไว้")
    args = parser.parse_args()

    print("🔍 กำลังสแกนไฟล์ทั้งหมด...")
    files = scan_files()
    print(f"✅ พบทั้งหมด {len(files)} ไฟล์")

    exact, similar = find_duplicates(files)

    print("\n" + "="*70)
    print("📊 1. ไฟล์ที่เหมือนกันทุกประการ")
    print("="*70)

    to_remove = []

    for h, paths in exact.items():
        print(f"\n🔑 แฮช: {h}")
        scored = []
        for p in paths:
            info = score_quality(p)
            scored.append({"path": p, **info})

        # เรียงจากคะแนนสูงไปต่ำ
        scored.sort(key=lambda x: -x["score"])
        best = scored[0]
        others = scored[1:]

        print(f"  ⭐ เก็บหลัก: {best['path']} — {best['score']}/{best['max_score']} คะแนน")
        print(f"     อัปเดต: {best['mtime']} | บรรทัด: {best['lines']}")
        print(f"     เหตุผล: {', '.join(best['reasons'])}")

        for alt in others:
            print(f"  ⚠️ พิจารณาลบ: {alt['path']} — {alt['score']}/{alt['max_score']} คะแนน")
            print(f"     อัปเดต: {alt['mtime']} | บรรทัด: {alt['lines']}")
            print(f"     เหตุผล: {', '.join(alt['reasons'])}")
            if alt["score"] < args.min_score:
                to_remove.append(alt)

    print("\n" + "="*70)
    print("📊 2. ไฟล์ที่เนื้อหาคล้ายกัน (อาจซ้ำ)")
    print("="*70)

    for h, paths in similar.items():
        if h in exact:
            continue  # แสดงไปแล้วข้างบน
        print(f"\n🔑 ลายนิ้วมือเนื้อหา: {h}")
        scored = []
        for p in paths:
            info = score_quality(p)
            scored.append({"path": p, **info})
        scored.sort(key=lambda x: -x["score"])
        for item in scored:
            print(f"  [{item['score']:2d}/{item['max_score']}] {item['path']} — {item['age_days']} วันที่แล้ว")

    # ========== สรุป & ดำเนินการ ==========
    print("\n" + "="*70)
    print(f"📋 สรุป: พบทั้งหมด {len(to_remove)} ไฟล์ที่มีคุณภาพต่ำกว่าเกณฑ์ ({args.min_score} คะแนน)")
    print("="*70)

    if to_remove:
        print("\nรายการที่แนะนำให้ย้าย/ลบ:")
        for item in to_remove:
            print(f"  - {item['path']} ({item['score']}/{item['max_score']})")

        if not args.dry_run:
            print("\n💡 เพื่อลบจริง รันด้วย: --dry-run เพื่อยืนยันก่อน")
        else:
            print("\n⚠️ โหมดดูผล — ไม่มีการเปลี่ยนแปลงเกิดขึ้น")
            print("   เพื่อดำเนินการจริง: ลบ --dry-run")

if __name__ == "__main__":
    main()
