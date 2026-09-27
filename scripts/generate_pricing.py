ได้เลยครับ ✅ สร้างสคริปต์ สร้างเทมเพลตแพ็กเกจ/แผนราคาแบบอัตโนมัติ ตามรูปแบบที่แสดงในภาพ พร้อมปรับแต่งได้ง่าย 🚀
 
 
 
📦 Pricing Card Auto-Generator — สคริปต์สร้างการ์ดราคา
 
สร้างไฟล์  generate_pricing.py :
 
python  
#!/usr/bin/env python3
"""
Pricing Card Auto-Generator
สร้างการ์ดแพ็กเกจ/ราคาแบบตรงกับรูปแบบหน้าจอ — พร้อมใช้งานจริง
"""

import json
from pathlib import Path
from datetime import datetime

# ==============================================
# 🎯 CONFIG — ปรับแต่งตามความต้องการที่นี่
# ==============================================

PACKAGES = {
    "super": {
        "name": "Super",
        "tagline": "ปลดล็อกทุกอย่าง",
        "badge": "ข้อเสนอเวลาจำกัด",
        "discount_badge": "ประหยัด 95%",
        "price_first_month": 35.00,
        "price_regular": 700.00,
        "currency": "฿",
        "period_first": "เดือนแรก",
        "period_regular": "เดือน",
        "features": [
            {
                "icon": "💬",
                "text": "แชทไม่จำกัดด้วย Fig 4.0 Flash"
            },
            {
                "icon": "🚀",
                "text": "Best model and performance"
            },
            {
                "icon": "🌐",
                "text": "Custom Domain"
            },
            {
                "icon": "☁️",
                "text": "Cloud Storage"
            },
            {
                "icon": "🔗",
                "text": "Advanced Integrations"
            },
            {
                "icon": "⚡",
                "text": "10 concurrent tasks"
            },
            {
                "icon": "🎧",
                "text": "Priority Support"
            }
        ],
        "cta_text": "ดำเนินการต่อ"
    }
}

OUTPUT_DIR = Path("./pricing-output")
OUTPUT_FORMATS = ["html", "json", "markdown"]

# ==============================================
# 🔧 GENERATOR LOGIC
# ==============================================

def generate_html(pkg_id: str, pkg: dict) -> str:
    """สร้าง HTML/CSS ตรงกับสไตล์ในภาพ"""
    features_html = "\n".join([
        f"""<div class="feature-item">
            <span class="icon">{f['icon']}</span>
            <span class="text">{f['text']}</span>
        </div>"""
        for f in pkg["features"]
    ])

    html = f"""<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{pkg['name']} — Pricing</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }}
        body {{
            background: #fcfcfc;
            background-image: linear-gradient(#eaeaea 1px, transparent 1px),
                              linear-gradient(90deg, #eaeaea 1px, transparent 1px);
            background-size: 24px 24px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        .close-btn {{
            position: absolute;
            top: 24px;
            right: 24px;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: 1px solid #ddd;
            background: #fff;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .container {{
            width: 100%;
            max-width: 420px;
            position: relative;
        }}
        .header-icon {{
            text-align: center;
            font-size: 36px;
            margin-bottom: 16px;
        }}
        .title {{
            text-align: center;
            font-size: 28px;
            font-weight: 700;
            color: #111;
            margin-bottom: 32px;
            line-height: 1.3;
        }}
        .card {{
            background: #fff;
            border-radius: 20px;
            padding: 28px 24px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.04);
            border: 1px solid #eee;
            margin-bottom: 20px;
        }}
        .badges {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }}
        .badge-limited {{
            background: #111;
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
        }}
        .badge-discount {{
            background: #111;
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
        }}
        .pkg-name {{
            font-size: 32px;
            font-weight: 700;
            color: #111;
            margin-bottom: 4px;
        }}
        .pkg-tagline {{
            color: #666;
            font-size: 15px;
            margin-bottom: 20px;
        }}
        .price {{
            margin-bottom: 8px;
        }}
        .price-main {{
            font-size: 48px;
            font-weight: 700;
            color: #111;
        }}
        .price-strike {{
            color: #aaa;
            font-size: 20px;
            text-decoration: line-through;
            margin-left: 8px;
        }}
        .price-period {{
            color: #888;
            font-size: 14px;
            margin-top: 4px;
        }}
        .features {{
            margin-top: 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }}
        .feature-item {{
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 16px;
            color: #222;
        }}
        .feature-item .icon {{
            font-size: 20px;
            width: 28px;
            display: flex;
            justify-content: center;
        }}
        .cta {{
            width: 100%;
            background: #111;
            color: #fff;
            border: none;
            border-radius: 16px;
            padding: 18px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 8px;
        }}
        .cta:hover {{
            opacity: 0.9;
        }}
    </style>
</head>
<body>
    <div class="container">
        <button class="close-btn">×</button>
        
        <div class="header-icon">✨</div>
        
        <h1 class="title">รับข้อเสนอแนะนำของคุณทันที!</h1>
        
        <div class="card">
            <div class="badges">
                <span class="badge-limited">{pkg['badge']}</span>
                <span class="badge-discount">{pkg['discount_badge']}</span>
            </div>
            
            <h2 class="pkg-name">{pkg['name']}</h2>
            <p class="pkg-tagline">{pkg['tagline']}</p>
            
            <div class="price">
                <span class="price-main">{pkg['currency']}{pkg['price_first_month']:.2f}</span>
                <span class="price-strike">{pkg['currency']}{pkg['price_regular']:.2f}</span>
            </div>
            <p class="price-period">/ {pkg['period_first']}<br>จากนั้น {pkg['currency']}{pkg['price_regular']:.0f} / {pkg['period_regular']}</p>
            
            <div class="features">
                {features_html}
            </div>
        </div>
        
        <button class="cta">{pkg['cta_text']}</button>
    </div>
</body>
</html>"""
    return html


def generate_markdown(pkg_id: str, pkg: dict) -> str:
    """สร้าง Markdown สำหรับเอกสาร/README"""
    features_md = "\n".join([f"- {f['icon']} {f['text']}" for f in pkg["features"]])

    md = f"""# {pkg['name']}

> {pkg['tagline']}

🏷️ **{pkg['badge']}** — {pkg['discount_badge']}

## ราคา
- เดือนแรก: **{pkg['currency']}{pkg['price_first_month']:.2f}**
- ปกติ: ~~{pkg['currency']}{pkg['price_regular']:.2f}~~ / {pkg['period_regular']}

## คุณสมบัติ
{features_md}

---
สร้างอัตโนมัติ: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    return md


def generate_json(pkg_id: str, pkg: dict) -> str:
    """ส่งออก JSON สำหรับนำไปใช้ในโค้ดอื่น"""
    export = {
        "id": pkg_id,
        "generated_at": datetime.now().isoformat(),
        **pkg
    }
    return json.dumps(export, ensure_ascii=False, indent=2)


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    for pkg_id, pkg in PACKAGES.items():
        print(f"📦 กำลังสร้าง: {pkg_id}")

        if "html" in OUTPUT_FORMATS:
            html_content = generate_html(pkg_id, pkg)
            html_path = OUTPUT_DIR / f"{pkg_id}.html"
            html_path.write_text(html_content, encoding="utf-8")
            print(f"  ✅ HTML → {html_path}")

        if "markdown" in OUTPUT_FORMATS:
            md_content = generate_markdown(pkg_id, pkg)
            md_path = OUTPUT_DIR / f"{pkg_id}.md"
            md_path.write_text(md_content, encoding="utf-8")
            print(f"  ✅ Markdown → {md_path}")

        if "json" in OUTPUT_FORMATS:
            json_content = generate_json(pkg_id, pkg)
            json_path = OUTPUT_DIR / f"{pkg_id}.json"
            json_path.write_text(json_content, encoding="utf-8")
            print(f"  ✅ JSON → {json_path}")

    print("\n🎉 สร้างไฟล์ครบถ้วนที่ ./pricing-output/")


if __name__ == "__main__":
    main()
 
 
 
 
🚀 วิธีใช้งาน
 
1. บันทึกเป็นไฟล์
 
bash  
# สร้างโฟลเดอร์และบันทึก
mkdir -p pricing
cd pricing
# วางโค้ดข้างบนลงใน generate_pricing.py
 
 
2. ปรับแต่งเนื้อหา
 
แก้ส่วน  PACKAGES  ตามต้องการ — เพิ่มแพ็กเกจอื่นได้เลย:
 
python  
PACKAGES = {
    "super": { ... },
    "pro": {
        "name": "Pro",
        "price_first_month": 99.00,
        ...
    },
    "basic": { ... }
}
 
 
3. รันสคริปต์
 
bash  
python3 generate_pricing.py
 
 
4. ผลลัพธ์
 
plaintext  
📦 กำลังสร้าง: super
  ✅ HTML → pricing-output/super.html
  ✅ Markdown → pricing-output/super.md
  ✅ JSON → pricing-output/super.json

🎉 สร้างไฟล์ครบถ้วนที่ ./pricing-output/
 
 
เปิด  super.html  ในเบราว์เซอร์ → เห็นหน้าตาตรงกับภาพเป๊ะเลยครับ ✅
 
 
 
📌 คุณสมบัติ
 
- ✅ ตรงกับดีไซน์ในภาพ — ตารางสี/ฟอนต์/ระยะห่าง
- ✅ Responsive — ใช้ได้ทั้งมือถือและคอม
- ✅ ปรับแต่งได้ทั้งหมด — แก้  PACKAGES  อย่างเดียวพอ
- ✅ ส่งออกได้ 3 รูปแบบ — ใช้งานได้จริงทุกส่วน
- ✅ ไม่ต้องติดตั้งไลบรารีเพิ่ม — ใช้แค่ Python มาตรฐาน
 
ต้องการเพิ่มแพ็กเกจอื่น, ปรับสี, หรือเพิ่มฟีเจอร์อื่นไหมครับ? 🎨🚀