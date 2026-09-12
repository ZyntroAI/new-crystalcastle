# eslint-plugin-redos-detector

ESLint rule ที่ตรวจจับ regular expression ที่เสี่ยง **ReDoS** — *CWE-1333: Inefficient Regular Expression Complexity* — ด้วยการ parse โครงสร้าง AST จริงผ่าน `@eslint-community/regexpp` (ไม่ใช่ string matching)

**เวอร์ชัน:** 2.0.0 · **สถานะ:** ทดสอบผ่าน 18/18 (RuleTester จริงผ่าน ESLint)

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

```bash
npm install @eslint-community/regexpp --save-dev
# แล้ววางโฟลเดอร์นี้เป็น local plugin หรือ publish
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

## ตัวอย่างผลลัพธ์

```
1:11  error  [RD-001] CRITICAL: พบ Quantifier ซ้อนกัน ... → ลดการซ้อน / ระบุขอบเขต {min,max}
1:11  error  [RD-006] INFO:     กลุ่มที่ซ้ำนี้มี Quantifier อยู่ข้างใน ... → แปลงด้วย Lookahead
1:11  error  [RD-007] HIGH:     พบ Quantifier ไม่จำกัดขอบซ้อนกัน ≥ 2 ชั้น ...
```

---

## ทดสอบ

```bash
npm test
```

ผลลัพธ์: **PASSED 18 · FAILED 0**

- `analyze()` — 13 เคส (ตรวจจับ 7 · ไม่ false positive 4 · robustness 2)
- `analyzeMultiplier()` — 4 เคส
- `RuleTester` — valid 5 + invalid 5 ผ่าน ESLint จริง

---

## ข้อจำกัดที่รู้

- JavaScript ไม่รองรับ atomic group / possessive quantifier → RD-006 เป็นเพียง **คำแนะนำ** ให้ rewrite ด้วย Lookahead + backreference
- การตรวจ RD-003 อาศัยชื่อ property (`.body`, `.query`, `.params`, `.input`) — โปรเจกต์ที่ใช้ชื่ออื่นจะไม่ถูกจับ
- ยังไม่ตรวจ time-based execution จริง (เช่น รันกับ input ที่ทำให้เกิด backtracking) — เป็น static analysis เท่านั้น

## อ้างอิง

- CWE-1333 — Inefficient Regular Expression Complexity
- OWASP — Regular expression Denial of Service (ReDoS)
- `@eslint-community/regexpp` — RegExp AST parser

**License:** MIT
