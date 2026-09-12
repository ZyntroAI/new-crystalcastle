# CWE-1333 ReDoS Detector — JavaScript + Python

ตรวจจับ regular expression ที่เสี่ยง **ReDoS** — *CWE-1333: Inefficient Regular Expression Complexity* — ด้วยการ parse โครงสร้าง AST จริง (ไม่ใช่ string matching) ทั้งสอง runtime ใช้ rule ID ชุดเดียวกัน

| Runtime | Entry | ตัววิเคราะห์ | Dependencies |
|---------|-------|--------------|--------------|
| JavaScript | `js/index.js` | `@eslint-community/regexpp` | 1 (regexpp) |
| Python | `python/redos_detector.py` | stdlib `re._parser` | 0 (stdlib ล้วน) |

**เวอร์ชัน:** 2.0.0 · **สถานะ:** JS ผ่าน 18/18 (RuleTester จริงผ่าน ESLint) · Python ผ่าน 27/27 · pyflakes สะอาด

---

## ทำไมต้อง regexpp

เวอร์ชันก่อนหน้าใช้ regex ธรรมดาจับ string ทำให้เกิด **false positive สูง** และพลาดเคสซ้อนที่ต้องดูโครงสร้างจริง regexpp ให้ AST ที่แม่นยำ: แยก `Quantifier` / `Group` / `Alternative` / `CharacterSet` ได้จริง จึงตรวจ "การซ้อน" และ "การทับกันของทางเลือก" ได้ถูกต้อง

---

## บั๊กที่พบและแก้ใน v2.0.0

โค้ดต้นฉบับ (`redos-rules.js`) มีบั๊กที่ทำให้กฎบางข้อ**ไม่ทำงานเลย** ทั้งที่ผ่านการอ่านด้วยตา ยืนยันด้วย AST probe จริง:

| # | บั๊ก | ผลกระทบ | การแก้ |
|---|------|---------|--------|
| **B1** | ใช้ `onEnterNode` / `onLeaveNode` | **callback เหล่านี้ไม่มีใน `visitRegExpAST`** — นับได้ 0 ครั้ง → การตรวจ nested quantifier (RD-001) ตายสนิท | ใช้ typed visitor `onQuantifierEnter` |
| **B2** | ใช้ `onQuantifierEnter` / `onAlternativeEnter` | descriptorKey จริงคือ `"onQuantifier"` / `"onAlternative"` (ไม่มี `Enter`) → ทุก callback ไม่ถูกเรียก | ใช้ชื่อ key ที่ถูกต้อง |
| **B3** | `n.max === Infinity` | ค่าจริงเป็น **`Infinity` (number) ไม่ใช่ `null`** — ถูกแล้ว แต่ผูกกับ `min >= 10` ทำให้ `*`, `+` หลุดทั้งหมด | แยก `isUnbounded()` ชัดเจน |
| **B4** | `n.parent?.parent?.type === "Quantifier"` | เส้นทางนี้**ไปไม่ถึง** — `.` parse เป็น `CharacterSet{kind:"any"}` ที่ `parent === Quantifier` ตรง ๆ | ตรวจ `q.element.type === "CharacterSet" && kind === "any"` |
| **B5** | วน `alternatives.map(x => x.raw)` | `Alternative.raw` ของ Pattern บนสุดคือ **ทั้ง pattern** → false positive | เทียบเฉพาะกลุ่มที่อยู่ใต้ Quantifier |
| **B6** | `parser.parsePattern(pattern, node)` | signature จริงคือ `(source, start, end, uFlag)` — ส่ง node เป็น index ผิด | แก้ signature + ส่ง flag `u`/`v` |
| **B7** | `parserOptions` + `.*+` ใน test | ESLint 9+ ใช้ flat config (`languageOptions`); `.*+` เป็น syntax ที่ **ไม่ valid ใน JS** | แก้เป็น flat config + regex ที่ valid |

> **หมายเหตุสำคัญ:** JavaScript **ไม่รองรับ** atomic group `(?>...)` และ possessive quantifier `*+` / `++` — parse จะ error ทันที ต่างจาก PCRE

### ฝั่ง Python (`docs/redos-rules.py` v1)

โค้ด v1 จับ string ด้วย regex ที่ compile ไว้ล่วงหน้า ทำให้กฎบางข้อ**ทำงานผิดหรือไม่ทำงานเลย** ยืนยันด้วย `re._parser`:

| # | บั๊ก | ผลกระทบ | การแก้ |
|---|------|---------|--------|
| **P1** | RD-004 ใช้ `[+*]\{(\d{2,}),\}` | ต้องมี `+`/`*` **ก่อน** ปีกกา แต่ `\d{150,}` ไม่มี → **กฎไม่เคยทำงานกับเป้าหมายของตัวเอง** | ตรวจ `MAX_REPEAT` ที่ `max` เป็น `MAXREPEAT` และ `min >= 10` |
| **P2** | RD-002 บังคับ 3 ทางเลือก | `(a\|ab)*` **หลุด** (มีแค่ 2) และ `(abc\|def\|ghi)*` **โดนจับผิด** (ไม่มี prefix ร่วม) | สร้าง signature ของแต่ละ branch แล้วเทียบ prefix จริง |
| **P3** | nested check ใช้ `\([^()]*...\)` | วงเล็บซ้อนทำให้หลุด → `((a+)+)` ไม่ถูกจับ | เดิน AST จริงผ่าน `SUBPATTERN` / `MAX_REPEAT` |

> **หมายเหตุสำคัญ:** Python 3.11+ **รองรับ** atomic group `(?>...)` และ possessive quantifier `*+` / `++` แล้ว — ดังนั้น RD-006 ฝั่ง Python เป็น **fix ที่ทำได้จริง** ไม่ใช่แค่คำแนะนำ

---

## กฎที่ตรวจ (7 ข้อ)

| ID | ชื่อ | ระดับ | ตรวจอะไร |
|----|------|-------|----------|
| **RD-001** | Nested Quantifiers | critical | Quantifier ไม่จำกัดซ้อน Quantifier ไม่จำกัด เช่น `(a+)+` |
| **RD-002** | Overlapping Alternation | high | ทางเลือกที่นำหน้าทับกันในกลุ่มที่ซ้ำ เช่น `(a\|ab\|abc)*` |
| **RD-003** | RegExp from user input | high | `new RegExp(req.body.x)` หรือ `/re/.test(req.query.q)` |
| **RD-004** | Large min + unbounded max | medium | `\d{150,}` — ขอบล่างสูงแต่ไม่มีขอบบน |
| **RD-005** | Unbounded dot | high | `.*` หรือ `.+` แบบไม่จำกัด |
| **RD-006** | Atomic-group candidate | info | กลุ่มที่ซ้ำและมี Quantifier ข้างใน — แนะนำ rewrite |
| **RD-007** | Exponential depth | high | Quantifier ไม่จำกัดซ้อน ≥ 2 ชั้น |

---

## ติดตั้ง

**JavaScript**

```bash
npm install @eslint-community/regexpp --save-dev
# แล้ววางโฟลเดอร์นี้เป็น local plugin หรือ publish
```

**Python** — ไม่ต้องติดตั้งอะไรเพิ่ม ใช้ stdlib ล้วน (ต้อง Python ≥ 3.11)

```python
import sys
sys.path.insert(0, "security/cwe1333/python")
from redos_detector import analyze, analyze_multiplier, check_source, report
```

## ใช้งาน — ESLint 9+ (flat config)

```js
// eslint.config.js
import redos from "eslint-plugin-redos-detector";

export default [
  {
    plugins: { "redos-detector": redos },
    rules: { "redos-detector/detect-redos": "error" },
  },
];
```

## ใช้งาน — ESLint 8 (eslintrc)

```json
{
  "plugins": ["redos-detector"],
  "rules": { "redos-detector/detect-redos": "error" }
}
```

---

## API

### `analyze(pattern, flags?) → Finding[]`

วิเคราะห์ pattern คืน array ของ finding (pure function ไม่มี side effect) รองรับ `flags` เป็น `"u"` / `"v"`

```js
import { analyze, analyzeMultiplier } from "./lib/rules/detect-redos.js";

analyze("(a+)+");
// => [RD-001, RD-006, RD-007]

analyze("^[a-z]+@[a-z]+\\.[a-z]{2,}$");
// => []  (ปลอดภัย ไม่ false positive)
```

### `analyzeMultiplier(pattern, flags?) → { depth, label, severity }`

วัดความลึกของ quantifier ที่ไม่จำกัดขอบ

```js
analyzeMultiplier("(a+)+");     // => { depth: 2, label: "exponential (O(k^n))", severity: "critical" }
analyzeMultiplier("a+");        // => { depth: 1, label: "linear-unbounded", severity: "medium" }
analyzeMultiplier("\\w{1,20}"); // => { depth: 0, label: "bounded", severity: "none" }
```

---

## API — Python (`python/redos_detector.py`)

### `analyze(pattern, flags=0) → list[Finding]`

คืน list ของ finding (pure function) แต่ละตัวเป็น dict จาก `REDOS_DEFS`
รองรับ `flags` ที่ส่งต่อให้ `re.compile` ได้โดยตรง

```python
from redos_detector import analyze

analyze(r"(a+)+")                        # => [RD-001, RD-006, RD-007]
analyze(r"^[a-z]+@[a-z]+\.[a-z]{2,}$")   # => []  (ปลอดภัย ไม่ false positive)
analyze(r"^\w{1,20}$")                   # => []  (bounded)
analyze("(unclosed")                     # => []  (pattern ผิด ไม่ throw)
```

### `analyze_multiplier(pattern, flags=0) → dict`

```python
from redos_detector import analyze_multiplier

analyze_multiplier(r"(a+)+")     # => {"depth": 2, "label": "exponential (O(k^n))", "severity": "critical"}
analyze_multiplier("a+")         # => {"depth": 1, "label": "linear-unbounded", "severity": "medium"}
analyze_multiplier(r"\w{1,20}")  # => {"depth": 0, "label": "bounded", "severity": "none"}
```

### `check_source(source) → list[{line, col, finding}]`

ตรวจ RD-003 ระดับ source — จับ regex ที่สร้างจากข้อมูลผู้ใช้

```python
from redos_detector import check_source

check_source('import re\nre.compile(request.args["p"])\n')
# => [{"line": 2, "col": 0, "finding": <RD-003>}]

check_source("import re\nre.compile(r'^a+$')\n")
# => []  (ค่าคงที่ ไม่ถูกจับ)
```

### `report(findings) → str`

```python
from redos_detector import analyze, report

print(report(analyze(r"(a+)+")))
# [RD-001] CRITICAL Nested Quantifiers: พบ Quantifier ซ้อนกัน ...
#           fix: ลดการซ้อน / ระบุขอบเขต {min,max} / ใช้ Atomic Group (?>...)
```

---

## ตัวอย่างผลลัพธ์

```
1:11  error  [RD-001] CRITICAL: พบ Quantifier ซ้อนกัน ... → ลดการซ้อน / ระบุขอบเขต {min,max}
1:11  error  [RD-006] INFO:     กลุ่มที่ซ้ำนี้มี Quantifier อยู่ข้างใน ... → แปลงด้วย Lookahead
1:11  error  [RD-007] HIGH:     พบ Quantifier ไม่จำกัดขอบซ้อนกัน ≥ 2 ชั้น ...
```

---

## ทดสอบ

**JavaScript**

```bash
cd security/cwe1333/js
npm install
node test/detect-redos.test.js
```

ผลลัพธ์: **PASSED 18 · FAILED 0**

- `analyze()` — 13 เคส (ตรวจจับ 7 · ไม่ false positive 4 · robustness 2)
- `analyzeMultiplier()` — 4 เคส
- `RuleTester` — valid 5 + invalid 5 ผ่าน ESLint จริง

**Python**

```bash
python3 security/cwe1333/tests/test_redos_detector.py
```

ผลลัพธ์: **PASSED 27 · FAILED 0**

- `analyze()` — 16 เคส (ตรวจจับ 9 · ไม่ false positive 5 · robustness 2)
- `analyze_multiplier()` — 4 เคส
- `check_source()` (RD-003) — 4 เคส
- atomic / possessive parse — 2 เคส · `report()` — 1 เคส

ตรวจ static analysis: `python3 -m pyflakes security/cwe1333/python/redos_detector.py` สะอาด

---

## ข้อจำกัดที่รู้

- **JavaScript ไม่รองรับ** atomic group `(?>...)` และ possessive quantifier `*+` / `++` → RD-006 เป็นเพียง **คำแนะนำ** ให้ rewrite ด้วย Lookahead + backreference
- **Python 3.11+ รองรับทั้งคู่** (`ATOMIC_GROUP`, `POSSESSIVE_REPEAT`) → RD-006 ฝั่ง Python เป็น **fix ที่ทำได้จริง**
- การตรวจ RD-003 เป็น heuristic ทั้งสองฝั่ง — อาศัยรูปแบบการเรียก regex บวกชื่อที่มี `request` / `form` / `query` / `input` / `body` / `payload` / `params` โค้ดที่ใช้ชื่ออื่นจะไม่ถูกจับ
- ยังไม่ตรวจ time-based execution จริง (เช่น รันกับ input ที่ทำให้เกิด backtracking) — เป็น static analysis เท่านั้น
- ตัววิเคราะห์ฝั่ง Python ต้อง Python ≥ 3.11 สำหรับ `re._parser`; เวอร์ชันเก่ากว่าจะ fallback ไปใช้ `sre_parse` ที่ deprecated แล้ว

## อ้างอิง

- CWE-1333 — Inefficient Regular Expression Complexity
- OWASP — Regular expression Denial of Service (ReDoS)
- `@eslint-community/regexpp` — RegExp AST parser (JavaScript)
- `re._parser` — CPython's own regex parser (Python)

**License:** MIT
