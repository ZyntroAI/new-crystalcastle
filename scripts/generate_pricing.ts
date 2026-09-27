ได้เลยครับ ✅ สร้างเวอร์ชัน TypeScript พร้อมใช้งาน ตรงกับรูปแบบและฟีเจอร์เต็มเหมือน Python 🚀
 
บันทึกเป็น  generate_pricing.ts :
 
typescript  
#!/usr/bin/env tsx
/**
 * Pricing Card Auto-Generator — TypeScript
 * สร้างการ์ดแพ็กเกจ/ราคา ตรงกับดีไซน์หน้าจอ
 * รัน: npx tsx generate_pricing.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';

// ==============================================
// 🎯 CONFIG — ปรับแต่งที่นี่
// ==============================================

interface Feature {
  icon: string;
  text: string;
}

interface PackageConfig {
  name: string;
  tagline: string;
  badge: string;
  discount_badge: string;
  price_first_month: number;
  price_regular: number;
  currency: string;
  period_first: string;
  period_regular: string;
  features: Feature[];
  cta_text: string;
}

const PACKAGES: Record<string, PackageConfig> = {
  super: {
    name: 'Super',
    tagline: 'ปลดล็อกทุกอย่าง',
    badge: 'ข้อเสนอเวลาจำกัด',
    discount_badge: 'ประหยัด 95%',
    price_first_month: 35.0,
    price_regular: 700.0,
    currency: '฿',
    period_first: 'เดือนแรก',
    period_regular: 'เดือน',
    features: [
      { icon: '💬', text: 'แชทไม่จำกัดด้วย Fig 4.0 Flash' },
      { icon: '🚀', text: 'Best model and performance' },
      { icon: '🌐', text: 'Custom Domain' },
      { icon: '☁️', text: 'Cloud Storage' },
      { icon: '🔗', text: 'Advanced Integrations' },
      { icon: '⚡', text: '10 concurrent tasks' },
      { icon: '🎧', text: 'Priority Support' },
    ],
    cta_text: 'ดำเนินการต่อ',
  },
  // เพิ่มแพ็กเกจอื่นได้ตรงนี้
  // pro: { ... },
  // basic: { ... },
};

const OUTPUT_DIR = './pricing-output';
const OUTPUT_FORMATS = ['html', 'json', 'markdown'] as const;

// ==============================================
// 🔧 GENERATOR LOGIC
// ==============================================

function generateHtml(pkg: PackageConfig): string {
  const featuresHtml = pkg.features
    .map(
      (f) => `
        <div class="feature-item">
          <span class="icon">${f.icon}</span>
          <span class="text">${f.text}</span>
        </div>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pkg.name} — Pricing</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body {
            background: #fcfcfc;
            background-image: linear-gradient(#eaeaea 1px, transparent 1px),
                              linear-gradient(90deg, #eaeaea 1px, transparent 1px);
            background-size: 24px 24px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .close-btn {
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
        }
        .container { width: 100%; max-width: 420px; position: relative; }
        .header-icon { text-align: center; font-size: 36px; margin-bottom: 16px; }
        .title { text-align: center; font-size: 28px; font-weight: 700; color: #111; margin-bottom: 32px; line-height: 1.3; }
        .card {
            background: #fff;
            border-radius: 20px;
            padding: 28px 24px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.04);
            border: 1px solid #eee;
            margin-bottom: 20px;
        }
        .badges { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .badge-limited, .badge-discount {
            background: #111;
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
        }
        .pkg-name { font-size: 32px; font-weight: 700; color: #111; margin-bottom: 4px; }
        .pkg-tagline { color: #666; font-size: 15px; margin-bottom: 20px; }
        .price { margin-bottom: 8px; }
        .price-main { font-size: 48px; font-weight: 700; color: #111; }
        .price-strike { color: #aaa; font-size: 20px; text-decoration: line-through; margin-left: 8px; }
        .price-period { color: #888; font-size: 14px; margin-top: 4px; }
        .features { margin-top: 24px; display: flex; flex-direction: column; gap: 16px; }
        .feature-item { display: flex; align-items: center; gap: 12px; font-size: 16px; color: #222; }
        .feature-item .icon { font-size: 20px; width: 28px; display: flex; justify-content: center; }
        .cta {
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
        }
        .cta:hover { opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <button class="close-btn" onclick="window.close()">×</button>
        <div class="header-icon">✨</div>
        <h1 class="title">รับข้อเสนอแนะนำของคุณทันที!</h1>

        <div class="card">
            <div class="badges">
                <span class="badge-limited">${pkg.badge}</span>
                <span class="badge-discount">${pkg.discount_badge}</span>
            </div>

            <h2 class="pkg-name">${pkg.name}</h2>
            <p class="pkg-tagline">${pkg.tagline}</p>

            <div class="price">
                <span class="price-main">${pkg.currency}${pkg.price_first_month.toFixed(2)}</span>
                <span class="price-strike">${pkg.currency}${pkg.price_regular.toFixed(2)}</span>
            </div>
            <p class="price-period">/ ${pkg.period_first}<br>จากนั้น ${pkg.currency}${pkg.price_regular} / ${pkg.period_regular}</p>

            <div class="features">
                ${featuresHtml}
            </div>
        </div>

        <button class="cta">${pkg.cta_text}</button>
    </div>
</body>
</html>`;
}

function generateMarkdown(pkgId: string, pkg: PackageConfig): string {
  const featuresMd = pkg.features.map((f) => `- ${f.icon} ${f.text}`).join('\n');
  const now = new Date().toLocaleString('th-TH');

  return `# ${pkg.name}

> ${pkg.tagline}

🏷️ **${pkg.badge}** — ${pkg.discount_badge}

## ราคา
- เดือนแรก: **${pkg.currency}${pkg.price_first_month.toFixed(2)}**
- ปกติ: ~~${pkg.currency}${pkg.price_regular.toFixed(2)}~~ / ${pkg.period_regular}

## คุณสมบัติ
${featuresMd}

---
สร้างอัตโนมัติ: ${now}
`;
}

function generateJson(pkgId: string, pkg: PackageConfig): string {
  const exportData = {
    id: pkgId,
    generated_at: new Date().toISOString(),
    ...pkg,
  };
  return JSON.stringify(exportData, null, 2);
}

function ensureDir(path: string): void {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const [pkgId, pkg] of Object.entries(PACKAGES)) {
    console.log(`📦 กำลังสร้าง: ${pkgId}`);

    if (OUTPUT_FORMATS.includes('html')) {
      const html = generateHtml(pkg);
      const path = join(OUTPUT_DIR, `${pkgId}.html`);
      writeFileSync(path, html, 'utf8');
      console.log(`  ✅ HTML → ${path}`);
    }

    if (OUTPUT_FORMATS.includes('markdown')) {
      const md = generateMarkdown(pkgId, pkg);
      const path = join(OUTPUT_DIR, `${pkgId}.md`);
      writeFileSync(path, md, 'utf8');
      console.log(`  ✅ Markdown → ${path}`);
    }

    if (OUTPUT_FORMATS.includes('json')) {
      const json = generateJson(pkgId, pkg);
      const path = join(OUTPUT_DIR, `${pkgId}.json`);
      writeFileSync(path, json, 'utf8');
      console.log(`  ✅ JSON → ${path}`);
    }
  }

  console.log('\n🎉 สร้างไฟล์ครบถ้วนที่ ./pricing-output/');
}

main();
 
 
 
 
🚀 วิธีใช้งาน
 
1. ติดตั้งเครื่องมือ (ถ้ายังไม่มี)
 
bash  
# ติดตั้ง tsx สำหรับรัน TypeScript แบบตรงๆ
npm install -g tsx
# หรือใช้ npx (ไม่ต้องติดตั้ง)
 
 
2. รันสคริปต์
 
bash  
# ใช้ npx (แนะนำ ไม่ต้องติดตั้ง)
npx tsx generate_pricing.ts

# หรือถ้าติดตั้งแล้ว
tsx generate_pricing.ts
 
 
3. ผลลัพธ์
 
plaintext  
📦 กำลังสร้าง: super
  ✅ HTML → pricing-output/super.html
  ✅ Markdown → pricing-output/super.md
  ✅ JSON → pricing-output/super.json

🎉 สร้างไฟล์ครบถ้วนที่ ./pricing-output/
 
 
เปิด  pricing-output/super.html  ในเบราว์เซอร์ → เห็นหน้าตาตรงกับภาพเป๊ะเลยครับ ✅
 
 
 
📌 คำสั่งพื้นฐาน
 
- แก้เนื้อหา: แก้ตรง  PACKAGES  เพิ่ม/ลบแพ็กเกจได้เลย
- เพิ่มฟีเจอร์: เพิ่มอ็อบเจกต์ใหม่ใน  features 
- เปลี่ยนรูปแบบเอาต์พุต: แก้  OUTPUT_FORMATS = ['html']  เหลือแค่ที่ต้องการ
- Type Safety: แก้  PACKAGES  ได้เลย TypeScript เช็คให้อัตโนมัติ
 
ต้องการเพิ่มอะไรอีกไหมครับ? 🎨🚀