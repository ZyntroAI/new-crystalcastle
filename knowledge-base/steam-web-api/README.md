# Steam Web API — Infographic: ประสิทธิภาพสูงสุด × การเปรียบเทียบกับ "Root Canal"

ชุดอินโฟกราฟิกสรุปรายงานการค้นคว้าเรื่อง **Steamlink / Steam Web API** ในมุมประสิทธิภาพของ REST API
พร้อมการเปรียบเปรยเชิงสร้างสรรค์กับกระบวนการ **Root Canal (รักษารากฟัน)** เพื่อสื่อแนวคิด
"ขจัดจุดอ่อน → เติมกลไกใหม่ → คืนพลังให้ระบบ"

---

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | คำอธิบาย |
|---|---|
| `steam-web-api-root-canal-infographic.html` | ต้นฉบับ SVG/HTML (16:9, 1920×1080) — ฟอนต์ Noto Sans Thai ฝังในไฟล์ เปิดได้แบบออฟไลน์ |
| `steam-web-api-root-canal-infographic-1920x1080.png` | PNG สำหรับสไลด์ / เว็บ |
| `steam-web-api-root-canal-infographic-3840x2160.png` | PNG ความละเอียด 4K สำหรับพิมพ์หรือฉายโปรเจกเตอร์ |
| `build_infographic.py` | สคริปต์สร้างไฟล์ HTML/SVG ใหม่ (แก้ข้อความ/สี/เลย์เอาต์ได้ตรงในโค้ด) |
| `NotoSansThai.ttf` | ฟอนต์ที่ฝังเข้าไฟล์ HTML (SIL Open Font License 1.1) |

---

## เนื้อหาบนภาพ

### คอลัมน์ซ้าย — Technical Overview

1. **โครงสร้าง & Endpoints** — URL pattern
   `https://api.steampowered.com/{interface}/{method}/{version}/`
   พร้อมตาราง interface ที่ใช้บ่อย: `ISteamUser` (`GetPlayerSummaries`),
   `IPlayerService` (`GetOwnedGames`), `ISteamEconomy` (`GetAssetPrices`)
2. **Rate Limit & Caching** — Caching 10–15 นาที · CDN/Edge Cache · ETag / Last-Modified ·
   Exponential Backoff และแถบเตือน `HTTP 429 Too Many Requests` พร้อมเพดาน 100,000 calls/วัน ต่อ API Key
3. **Performance Best Practices** — Response Compression (GZIP/Brotli) · Pagination & Field Selection ·
   Async Jobs & Queue · Observability / APM ปิดท้ายด้วยแถบ Resilience & ความปลอดภัย
   (Idempotency · Retry · Circuit Breaker · HTTPS Only · API Key Rotation)

### คอลัมน์ขวา — Root Canal Analogy

ภาพฟันการ์ตูนแบบ before/after (ซีกซ้ายมีจุดอ่อน ซีกขวาฟันสะอาดพร้อมประกาย) แล้วเทียบเป็น 6 คู่ขนาน:

| แนวทางเทคนิค (REST API) | การเปรียบเปรย (Root Canal) |
|---|---|
| ลบ endpoint ซ้ำซ้อน | ขจัดเนื้อเยื่อที่ติดเชื้อ |
| Optimize query / database | ทำความสะอาดรากฟัน |
| Implement caching | เติมวัสดุใหม่ในรากฟัน |
| Monitor & fix bottleneck | ตรวจและรักษาต่อเนื่อง |
| Stateless, scalable design | สร้างรากฟันใหม่ที่แข็งแรง |
| Circuit breaker / retry / backoff | ป้องกันการติดเชื้อซ้ำ |

---

## การสร้างใหม่ / แก้ไข

```bash
# ต้องมี Chromium (Playwright) สำหรับเรนเดอร์ PNG
python3 build_infographic.py            # เขียน HTML/SVG ใหม่
python3 -m playwright install chromium  # ครั้งแรกเท่านั้น
python3 - <<'PY'
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=2)
    pg.goto("file://" + __import__("os").path.abspath("steam-web-api-root-canal-infographic.html"))
    pg.screenshot(path="steam-web-api-root-canal-infographic-3840x2160.png",
                  clip={"x": 0, "y": 0, "width": 1920, "height": 1080})
    b.close()
PY
```

หรือเปิดไฟล์ HTML ในเบราว์เซอร์แล้วสั่ง **Print → Save as PDF** เพื่อได้ไฟล์ PDF ขนาด 16:9 ไปใช้ในรายงาน

---

## ที่มา

- Steam Web API Documentation — <https://www.steamwebapi.com/api/steam/documentation>
- แนวปฏิบัติ REST API performance: caching, payload reduction, async processing, observability

**หมายเหตุ:** Steam Web API เป็นบริการของ Valve Corporation · ข้อจำกัด rate limit และแนวปฏิบัติ
อาจเปลี่ยนแปลงตามนโยบายของผู้ให้บริการ ควรตรวจสอบเอกสารทางการก่อนใช้งานจริง

**สิทธิ์ฟอนต์:** Noto Sans Thai — SIL Open Font License 1.1
