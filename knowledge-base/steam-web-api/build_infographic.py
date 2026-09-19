#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the Steam Web API x Root Canal 16:9 infographic as a self-contained SVG/HTML file."""
import base64, os, pathlib

ROOT = pathlib.Path("/workspace/H7tGkmt5NUfW1dxEb7zSB64VDoY2/6d8d6406-ff00-4b63-a340-a996907afdc7")
FONT_PATH = ROOT / "assets/fonts/NotoSansThai.ttf"
OUT_HTML = ROOT / "outputs/steam_api_root_canal_infographic.html"

W, H = 1920, 1080

# ---------- palette ----------
INK      = "#0f2b33"
INK_SOFT = "#3d6875"
TEAL     = "#0e7490"
TEAL_DK  = "#0b4f5c"
CYAN     = "#06b6d4"
MINT     = "#10b981"
AMBER    = "#f59e0b"
ORANGE   = "#f97316"
CARD     = "#ffffff"
STROKE   = "#cfe4ec"
PAGE_BG  = "#f2f9fb"

font_b64 = base64.b64encode(FONT_PATH.read_bytes()).decode()

def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

def T(x, y, s, size, fill=INK, weight=400, anchor="start", ls="0"):
    return (f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" '
            f'text-anchor="{anchor}" letter-spacing="{ls}">{esc(s)}</text>')

def R(x, y, w, h, fill, stroke="none", rx=14, sw=1.4, op=1):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke != "none" else ""
    o = f' opacity="{op}"' if op != 1 else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{st}{o}/>'

def ICON(kind, x, y, size=24, color=TEAL, sw=2.0):
    k = size / 24.0
    body = {
    "cache":  '<ellipse cx="12" cy="5.5" rx="8" ry="3.2"/><path d="M4 5.5v13a8 3.2 0 0 0 16 0v-13"/><path d="M4 12.5a8 3.2 0 0 0 16 0"/>',
    "globe":  '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4.2" ry="9"/><path d="M3.4 9h17.2M3.4 15h17.2"/>',
    "tag":    '<path d="M3.5 11.4V4.6A1.1 1.1 0 0 1 4.6 3.5h6.8l9.1 9.1-7.9 7.9z"/><circle cx="8.2" cy="8.2" r="1.5"/>',
    "clock":  '<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.8 2.6"/>',
    "bolt":   '<path d="M13 2 4.5 13.5H11l-1 8.5L18.5 10H12z"/>',
    "page":   '<rect x="3.5" y="4" width="17" height="4.4" rx="1.3"/><rect x="3.5" y="10.6" width="17" height="4.4" rx="1.3"/><rect x="3.5" y="17.2" width="10.5" height="3.6" rx="1.3"/>',
    "async":  '<path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.6 3.6v5.2h-5.2"/>',
    "chart":  '<rect x="3.5" y="13" width="4.2" height="7.4" rx="1.1"/><rect x="9.9" y="8" width="4.2" height="12.4" rx="1.1"/><rect x="16.3" y="3.6" width="4.2" height="16.8" rx="1.1"/>',
    "shield": '<path d="M12 2.8 20 6v6.2c0 4.9-3.4 8.1-8 9.2-4.6-1.1-8-4.3-8-9.2V6z"/><path d="M8.6 12.2l2.5 2.5 4.3-4.6"/>',
    "compress":'<path d="M3.6 12h4.6M15.8 12h4.6"/><path d="M8.2 8.2 12 12l-3.8 3.8"/><path d="M15.8 8.2 12 12l3.8 3.8"/>',
    "api":    '<path d="M8.4 3.8C4.6 3.8 5.8 10.6 3.6 12c2.2 1.4 1 8.2 4.8 8.2"/><path d="M15.6 3.8c3.8 0 2.6 6.8 4.8 8.2-2.2 1.4-1 8.2-4.8 8.2"/>',
    "warn":   '<path d="M12 3.2 22 20.4H2z"/><path d="M12 9.2v5.2"/><circle cx="12" cy="17.6" r="1.1"/>',
    "ctrl":   '<rect x="2.2" y="7" width="19.6" height="10.4" rx="5.2"/><path d="M7 9.8v4.4M4.8 12h4.4"/><circle cx="16.6" cy="10.8" r="1.4"/><circle cx="18.8" cy="13.8" r="1.4"/>',
    "tooth":  '<path d="M12 2.6c-4.2 0-6.2 2.2-6.2 6.2 0 3.1 1 5 1 8 0 2.1 1 4.6 2.6 4.6S11.4 18 12 18s1 2.4 2.6 2.4S17.2 19 17.2 16.9c0-3.1 1-5 1-8 0-4-2-6.2-6.2-6.2z"/><path d="M12 9v9"/>',
    "spark":  '<path d="M12 3v5M12 16v5M3 12h5M16 12h5"/><path d="M6.2 6.2 9 9M15 15l2.8 2.8M17.8 6.2 15 9M9 15l-2.8 2.8"/>',
    }[kind]
    return (f'<g transform="translate({x},{y}) scale({k})" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{body}</g>')

parts = []
A = parts.append

# ---------- defs ----------
defs = ['<defs>']
defs.append(
 '<linearGradient id="topbar" x1="0" y1="0" x2="1" y2="0">'
 f'<stop offset="0%" stop-color="{TEAL_DK}"/><stop offset="45%" stop-color="{CYAN}"/>'
 f'<stop offset="100%" stop-color="{MINT}"/></linearGradient>')
defs.append(
 '<linearGradient id="hdrL" x1="0" y1="0" x2="1" y2="0">'
 f'<stop offset="0%" stop-color="#e3f5fa" stop-opacity="1"/><stop offset="100%" stop-color="#f7fdfe" stop-opacity="1"/></linearGradient>')
defs.append(
 '<linearGradient id="hdrR" x1="0" y1="0" x2="1" y2="0">'
 f'<stop offset="0%" stop-color="#e2f7f0" stop-opacity="1"/><stop offset="100%" stop-color="#f7fefb" stop-opacity="1"/></linearGradient>')
defs.append(
 '<radialGradient id="glowA" cx="50%" cy="50%" r="50%">'
 f'<stop offset="0%" stop-color="{CYAN}" stop-opacity="0.22"/><stop offset="100%" stop-color="{CYAN}" stop-opacity="0"/></radialGradient>')
defs.append(
 '<radialGradient id="glowB" cx="50%" cy="50%" r="50%">'
 f'<stop offset="0%" stop-color="{MINT}" stop-opacity="0.22"/><stop offset="100%" stop-color="{MINT}" stop-opacity="0"/></radialGradient>')
defs.append(
 '<pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">'
 f'<circle cx="2" cy="2" r="1.5" fill="{CYAN}" opacity="0.16"/></pattern>')
defs.append(
 f'<filter id="soft" x="-20%" y="-20%" width="140%" height="150%">'
 f'<feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#0b4f5c" flood-opacity="0.10"/></filter>')
defs.append('</defs>')

A("".join(defs))

# ---------- page background ----------
A(R(0, 0, W, H, PAGE_BG, rx=0))
A(R(0, 0, W, H, "url(#dots)", rx=0))
A(f'<circle cx="1870" cy="30" r="300" fill="url(#glowA)"/>')
A(f'<circle cx="60" cy="1060" r="320" fill="url(#glowB)"/>')
A(R(0, 0, W, 10, "url(#topbar)", rx=0))

# ---------- header ----------
A(T(60, 92, "STEAMLINK / STEAM WEB API", 47, TEAL_DK, 800, ls="0.6"))
A(T(60, 134, "ประสิทธิภาพสูงสุดของ REST API × การเปรียบเทียบกับ “ROOT CANAL”", 27, TEAL, 500))
A(T(1860, 66, "RESEARCH REPORT", 17, MINT, 800, "end", "2.4"))
A(T(1860, 96, "รายงานการค้นคว้า · 2026", 18, INK_SOFT, 500, "end"))
A(R(60, 152, 1800, 3, STROKE, rx=2))

# ===================== LEFT COLUMN =====================
LX, LW = 60, 860
LPAD = 26
LIX = LX + LPAD
LIW = LW - 2 * LPAD

# ---- Block 01 ----
y0 = 176
A(R(LX, y0, LW, 268, CARD, STROKE, 18, 1.4))
A(f'<g filter="url(#soft)">{R(LX, y0, LW, 268, CARD, "none", 18)}</g>')  # shadow layer under card
A(R(LX, y0, LW, 268, "none", STROKE, 18, 1.4))
A(R(LX, y0, LW, 46, "url(#hdrL)", rx=18))
A(R(LX, y0 + 26, LW, 20, "url(#hdrL)", rx=0))
A(R(LX, y0, 6, 46, TEAL, rx=3))
A(T(LX + 22, y0 + 31, "01", 20, TEAL, 800))
A(T(LX + 58, y0 + 31, "โครงสร้าง & Endpoints", 21, TEAL_DK, 700))
A(T(LX + LW - 22, y0 + 31, "RESTful pattern", 15, INK_SOFT, 500, "end"))

A(R(LIX, y0 + 62, LIW, 54, "#0b2b33", rx=10))
A(T(LIX + 16, y0 + 96, "https://api.steampowered.com/{interface}/{method}/{version}/",
    17, "#7ef0d4", 500))
A(T(LIX, y0 + 140, "ตัวอย่าง Interface / Method ที่ใช้บ่อย", 15, INK_SOFT, 700))

rows1 = [
    ("ISteamUser", "GetPlayerSummaries", "ดึงข้อมูลโปรไฟล์ผู้ใช้"),
    ("IPlayerService", "GetOwnedGames", "รายชื่อเกมที่ผู้ใช้เป็นเจ้าของ"),
    ("ISteamEconomy", "GetAssetPrices", "ราคาสินค้าในเกม"),
]
ry = y0 + 150
for i, (iface, meth, desc) in enumerate(rows1):
    fill = "#eff9fc" if i % 2 == 0 else "#ffffff"
    A(R(LIX, ry, LIW, 34, fill, rx=7))
    A(T(LIX + 12, ry + 23, iface, 15, TEAL_DK, 700))
    A(T(LIX + 176, ry + 23, meth, 15, TEAL, 600))
    A(T(LIX + LIW - 12, ry + 23, desc, 14, INK_SOFT, 500, "end"))
    ry += 36

# ---- Block 02 ----
y0 = 462
BH = 236
A(f'<g filter="url(#soft)">{R(LX, y0, LW, BH, CARD, "none", 18)}</g>')
A(R(LX, y0, LW, BH, "none", STROKE, 18, 1.4))
A(R(LX, y0, LW, 46, "url(#hdrL)", rx=18))
A(R(LX, y0 + 26, LW, 20, "url(#hdrL)", rx=0))
A(R(LX, y0, 6, 46, CYAN, rx=3))
A(T(LX + 22, y0 + 31, "02", 20, CYAN, 800))
A(T(LX + 58, y0 + 31, "Rate Limit & Caching", 21, TEAL_DK, 700))
A(T(LX + LW - 22, y0 + 31, "ลดการเรียกซ้ำ", 15, INK_SOFT, 500, "end"))

chips2 = [
    ("cache", "Caching 10–15 นาที", "เก็บผลลัพธ์ฝั่งแอป"),
    ("globe", "CDN / Edge Cache", "ลด latency ใกล้ผู้ใช้"),
    ("tag", "ETag · Last-Modified", "Conditional request"),
    ("bolt", "Exponential Backoff", "หน่วงเวลาเมื่อ retry"),
]
cw, ch = 392, 56
positions = [(LIX, y0 + 60), (LIX + cw + 16, y0 + 60),
             (LIX, y0 + 124), (LIX + cw + 16, y0 + 124)]
for (kind, title, sub), (cx0, cy0) in zip(chips2, positions):
    A(R(cx0, cy0, cw, ch, "#f4fbfd", STROKE, 11, 1.1))
    A(R(cx0, cy0, 4, ch, CYAN, rx=2))
    A(ICON(kind, cx0 + 14, cy0 + 15, 26, TEAL, 2.0))
    A(T(cx0 + 50, cy0 + 25, title, 15, TEAL_DK, 700))
    A(T(cx0 + 50, cy0 + 45, sub, 13, INK_SOFT, 500))

# warning strip
wy = y0 + 192
A(R(LIX, wy, LIW, 32, "#fff4e2", "#f7c67a", 9, 1.2))
A(ICON("warn", LIX + 9, wy + 6, 20, ORANGE, 1.9))
A(T(LIX + 38, wy + 22, "HTTP 429 Too Many Requests", 14, "#a2540a", 700))
A(T(LIX + LIW - 14, wy + 22, "เพดาน 100,000 calls / วัน ต่อ API Key", 13, "#8a5a19", 600, "end"))

# ---- Block 03 ----
y0 = 716
BH = 268
A(f'<g filter="url(#soft)">{R(LX, y0, LW, BH, CARD, "none", 18)}</g>')
A(R(LX, y0, LW, BH, "none", STROKE, 18, 1.4))
A(R(LX, y0, LW, 46, "url(#hdrL)", rx=18))
A(R(LX, y0 + 26, LW, 20, "url(#hdrL)", rx=0))
A(R(LX, y0, 6, 46, MINT, rx=3))
A(T(LX + 22, y0 + 31, "03", 20, MINT, 800))
A(T(LX + 58, y0 + 31, "Performance Best Practices", 21, TEAL_DK, 700))
A(T(LX + LW - 22, y0 + 31, "แนวปฏิบัติหลัก", 15, INK_SOFT, 500, "end"))

chips3 = [
    ("compress", "Response Compression", "GZIP / Brotli · ลดขนาด payload"),
    ("page", "Pagination & Field Selection", "ขอเฉพาะ field ที่ต้องใช้"),
    ("async", "Async Jobs & Queue", "RabbitMQ / Kafka / Webhook"),
    ("chart", "Observability / APM", "Prometheus · Grafana · Datadog"),
]
positions = [(LIX, y0 + 60), (LIX + cw + 16, y0 + 60),
             (LIX, y0 + 124), (LIX + cw + 16, y0 + 124)]
for (kind, title, sub), (cx0, cy0) in zip(chips3, positions):
    A(R(cx0, cy0, cw, ch, "#f2fcf8", STROKE, 11, 1.1))
    A(R(cx0, cy0, 4, ch, MINT, rx=2))
    A(ICON(kind, cx0 + 14, cy0 + 15, 26, MINT, 2.0))
    A(T(cx0 + 50, cy0 + 25, title, 15, TEAL_DK, 700))
    A(T(cx0 + 50, cy0 + 45, sub, 13, INK_SOFT, 500))

fy = y0 + 196
A(R(LIX, fy, LIW, 48, "#eef7fa", "#d9ecf2", 11, 1.2))
A(ICON("shield", LIX + 12, fy + 11, 26, TEAL, 2.0))
A(T(LIX + 48, fy + 21, "Resilience & ความปลอดภัย", 14, TEAL_DK, 700))
A(T(LIX + 48, fy + 40, "Idempotency · Retry · Circuit Breaker · HTTPS Only · API Key Rotation", 13, INK_SOFT, 500))

# ===================== RIGHT COLUMN =====================
RX, RW = 956, 904
RIX = RX + 26
RIW = RW - 52

A(f'<g filter="url(#soft)">{R(RX, 176, RW, 808, CARD, "none", 18)}</g>')
A(R(RX, 176, RW, 808, "none", STROKE, 18, 1.4))
A(R(RX, 176, RW, 52, "url(#hdrR)", rx=18))
A(R(RX, 176 + 30, RW, 22, "url(#hdrR)", rx=0))
A(R(RX, 176, 6, 52, TEAL_DK, rx=3))
A(T(RIX, 210, "ROOT CANAL ANALOGY", 23, TEAL_DK, 800, ls="0.4"))
A(T(RX + RW - 26, 210, "ขจัดจุดอ่อน → เติมกลไกใหม่ → คืนพลังให้ระบบ", 16, MINT, 600, "end"))

# ---- tooth illustration ----
def tooth_group(cx, cy, before=True):
    g = []
    if before:
        crown_fill, root_fill, stroke = "#e8f0f3", "#dbe6ea", "#9fb6c0"
    else:
        crown_fill, root_fill, stroke = "#ffffff", "#d8f7ec", MINT
    g.append(f'<g transform="translate({cx},{cy})">')
    g.append(
        f'<path d="M-46 0 Q-46 -54 0 -54 Q46 -54 46 0 Q46 26 30 34 L30 72 Q30 88 18 88 '
        f'Q8 88 8 72 L8 40 L-8 40 L-8 72 Q-8 88 -18 88 Q-30 88 -30 72 L-30 34 Q-46 26 -46 0 Z" '
        f'fill="{crown_fill}" stroke="{stroke}" stroke-width="3.2" stroke-linejoin="round"/>')
    g.append(f'<path d="M-26 34 L-26 70 Q-26 80 -18 80 Q-12 80 -12 70 L-12 38 Z" fill="{root_fill}"/>')
    g.append(f'<path d="M12 38 L12 70 Q12 80 18 80 Q26 80 26 70 L26 34 Z" fill="{root_fill}"/>')
    if before:
        g.append(f'<circle cx="-19" cy="66" r="7.5" fill="{AMBER}" opacity="0.95"/>')
        g.append(f'<circle cx="-19" cy="66" r="11.5" fill="none" stroke="{AMBER}" stroke-width="1.6" opacity="0.55"/>')
        g.append(f'<circle cx="19" cy="58" r="5.5" fill="{AMBER}" opacity="0.7"/>')
        g.append(f'<path d="M-38 -30 L-52 -40" stroke="{ORANGE}" stroke-width="2.6" stroke-linecap="round"/>')
        g.append(f'<path d="M-38 -30 L-46 -14" stroke="{ORANGE}" stroke-width="2.6" stroke-linecap="round"/>')
        g.append(f'<circle cx="-38" cy="-30" r="4" fill="{ORANGE}"/>')
    else:
        g.append(f'<path d="M31 -22 L44 -34" stroke="{MINT}" stroke-width="2.6" stroke-linecap="round"/>')
        g.append(f'<path d="M31 -22 L39 -8" stroke="{MINT}" stroke-width="2.6" stroke-linecap="round"/>')
        g.append(f'<circle cx="31" cy="-22" r="4" fill="{MINT}"/>')
    # face
    fc = "#7d95a0" if before else TEAL_DK
    g.append(f'<circle cx="-13" cy="-8" r="3.6" fill="{fc}"/>')
    g.append(f'<circle cx="13" cy="-8" r="3.6" fill="{fc}"/>')
    if before:
        g.append(f'<path d="M-13 14 Q0 4 13 14" fill="none" stroke="{fc}" stroke-width="3" stroke-linecap="round"/>')
    else:
        g.append(f'<path d="M-13 6 Q0 20 13 6" fill="none" stroke="{fc}" stroke-width="3" stroke-linecap="round"/>')
    g.append('</g>')
    return "".join(g)

BY = 300
A(tooth_group(1152, BY, True))
A(tooth_group(1690, BY, False))

# arrow between
A(f'<path d="M1258 330 L1568 330" stroke="{TEAL}" stroke-width="4" stroke-linecap="round" opacity="0.75"/>')
A(f'<path d="M1556 318 L1574 330 L1556 342 Z" fill="{TEAL}" opacity="0.9"/>')
A(R(1330, 246, 168, 40, "#eafaf4", "#bfe9d8", 20, 1.3))
A(ICON("spark", 1344, 256, 20, MINT, 1.9))
A(T(1372, 272, "รักษา & ฟื้นฟู", 16, "#0c6b52", 700))

A(T(1152, 420, "BEFORE · มีจุดอ่อน", 15, "#a2540a", 700, "middle"))
A(T(1690, 420, "AFTER · เติมพลังเต็มราก", 15, "#0c6b52", 700, "middle"))

# ---- 6 analogy rows ----
rows6 = [
    ("ลบ endpoint ซ้ำซ้อน", "ขจัดเนื้อเยื่อที่ติดเชื้อ"),
    ("Optimize query / database", "ทำความสะอาดรากฟัน"),
    ("Implement caching", "เติมวัสดุใหม่ในรากฟัน"),
    ("Monitor & fix bottleneck", "ตรวจและรักษาต่อเนื่อง"),
    ("Stateless, scalable design", "สร้างรากฟันใหม่ที่แข็งแรง"),
    ("Circuit breaker / retry / backoff", "ป้องกันการติดเชื้อซ้ำ"),
]
ry = 442
step = 76
for i, (left, right) in enumerate(rows6):
    y = ry + i * step
    A(R(RIX, y, RIW, 68, "#f6fcfe", STROKE, 12, 1.2))
    # left cell
    A(R(RIX + 8, y + 7, 392, 54, "#e9f7fb", "#c9e8f1", 10, 1.1))
    A(f'<circle cx="{RIX + 32}" cy="{y + 34}" r="13" fill="{CYAN}" opacity="0.16"/>')
    A(T(RIX + 32, y + 39, str(i + 1), 14, TEAL, 800, "middle"))
    A(T(RIX + 54, y + 40, left, 16, TEAL_DK, 700))
    # arrow
    ax = RIX + 412
    A(f'<path d="M{ax} {y + 34} L{ax + 44} {y + 34}" stroke="{MINT}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>')
    A(f'<path d="M{ax + 34} {y + 26} L{ax + 48} {y + 34} L{ax + 34} {y + 42} Z" fill="{MINT}" opacity="0.9"/>')
    # right cell
    rx2 = RIX + 470
    A(R(rx2, y + 7, 366, 54, "#eafaf4", "#c3ebdb", 10, 1.1))
    A(ICON("tooth", rx2 + 14, y + 20, 26, MINT, 1.9))
    A(T(rx2 + 50, y + 40, right, 16, "#0c6b52", 600))

# ===================== FOOTER =====================
A(R(60, 1000, 1800, 60, "#ffffff", STROKE, 14, 1.4))
A(T(84, 1030, "ที่มา:", 14, TEAL_DK, 700))
A(T(134, 1030, "Steam Web API Documentation (steamwebapi.com) · Valve Corporation — สรุปเพื่อรายงานการค้นคว้า", 14, INK_SOFT, 500))
A(T(84, 1050, "หมายเหตุ: Steam Web API เป็นบริการของ Valve · ข้อจำกัด rate limit และแนวปฏิบัติอาจเปลี่ยนแปลงตามนโยบายผู้ให้บริการ", 12.5, "#7c98a3", 500))
A(ICON("ctrl", 1500, 1016, 26, TEAL, 1.9))
A(T(1534, 1035, "Steam API", 14, TEAL_DK, 700))
A(ICON("shield", 1650, 1016, 26, TEAL, 1.9))
A(T(1684, 1035, "Security", 14, TEAL_DK, 700))
A(ICON("clock", 1772, 1016, 26, TEAL, 1.9))
A(T(1806, 1035, "Rate limit", 14, TEAL_DK, 700))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
       f'font-family="NotoThai">' + "".join(parts) + "</svg>")

html = f"""<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>Steam Web API x Root Canal - Infographic 16:9</title>
<style>
@font-face {{
  font-family: 'NotoThai';
  src: url(data:font/ttf;base64,{font_b64}) format('truetype');
  font-weight: 100 900;
  font-style: normal;
}}
html, body {{ margin:0; padding:0; background:#f2f9fb; }}
svg {{ display:block; }}
</style>
</head>
<body>
{svg}
</body>
</html>
"""

OUT_HTML.parent.mkdir(parents=True, exist_ok=True)
OUT_HTML.write_text(html, encoding="utf-8")
print("WROTE", OUT_HTML, len(html), "bytes")
print("SVG parts:", len(parts))
