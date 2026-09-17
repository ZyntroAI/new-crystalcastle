# Test Report — CWE-1333 ReDoS Detection Suite

**Task:** TASK-SEC-CWE1333-002 · **Date:** 2026-09-12 · **Status:** PASSING

## Summary

| Runtime | Layer | Result |
|---------|-------|--------|
| JavaScript | `analyze()` core | 13 passed / 0 failed |
| JavaScript | `analyzeMultiplier()` | 4 passed / 0 failed |
| JavaScript | `RuleTester` through real ESLint 9 | 1 passed / 0 failed (5 valid + 5 invalid cases) |
| JavaScript | **subtotal** | **18 passed / 0 failed** |
| Python | `analyze()` — detection | 9 passed / 0 failed |
| Python | `analyze()` — no false positives | 5 passed / 0 failed |
| Python | `analyze()` — robustness | 2 passed / 0 failed |
| Python | `analyze_multiplier()` | 4 passed / 0 failed |
| Python | `check_source()` (RD-003) | 4 passed / 0 failed |
| Python | atomic / possessive parse | 2 passed / 0 failed |
| Python | `report()` rendering | 1 passed / 0 failed |
| Python | **subtotal** | **27 passed / 0 failed** |
| | **Total** | **45 passed / 0 failed** |

Python static check: `python3 -m pyflakes security/cwe1333/python/redos_detector.py`
→ clean.

---

## JavaScript

Verified twice: in a scratch directory, and in-repo at `security/cwe1333/js/`
after `npm install` on a clean checkout.

### Detection (`analyze()`)

| Input | Expected | Result |
|-------|----------|--------|
| `(a+)+` | includes RD-001 | PASS |
| `(\w+\s?)*` | includes RD-001 | PASS |
| `(a\|ab\|abc)*` | includes RD-002 | PASS |
| `\d{150,}` | includes RD-004 | PASS |
| `.*` | includes RD-005 | PASS |
| `.+` | includes RD-005 | PASS |
| `(a+)+` | includes RD-007 | PASS |

### No false positives

| Input | Expected | Result |
|-------|----------|--------|
| `^[a-z]+@[a-z]+\.[a-z]{2,}$` | `[]` | PASS |
| `^\w{1,20}$` | `[]` | PASS |
| `(a\|b)*` | `[]` | PASS |
| `abc` | `[]` | PASS |

### Robustness

| Input | Expected | Result |
|-------|----------|--------|
| `(unclosed` | `[]`, no throw | PASS |
| `\p{L}+` with `u` flag | array returned | PASS |

### Quantifier depth (`analyzeMultiplier()`)

| Input | depth | label | severity | Result |
|-------|-------|-------|----------|--------|
| `(a+)+` | 2 | exponential (O(k^n)) | critical | PASS |
| `a+` | 1 | linear-unbounded | medium | PASS |
| `\w{1,20}` | 0 | bounded | none | PASS |
| `(\w+\s?)*` | ≥2 | — | — | PASS |

### RuleTester (end-to-end through ESLint)

Valid: `/^\w{1,20}$/`, `/^[a-z]+@[a-z]+\.[a-z]{2,}$/`, `/(a|b)*/`, `/abc/`,
`/\d{1,3}\.\d{1,3}/`

Invalid: `/(a+)+/` → 3 errors (RD-001, RD-006, RD-007) · `/(a|ab|abc)*/` → 1 ·
`/.*/` → 1 · `/\d{150,}/` → 1 · `new RegExp(req.body.pattern)` → 1

### Defect verification (JS)

Reproduced against the live AST before the fix (`@eslint-community/regexpp@4.12.2`):

| Defect | Probe result |
|--------|--------------|
| `onEnterNode` / `onLeaveNode` absent | fired **0** times vs `onQuantifierEnter` **2** times on `/(a+)+/` |
| `max === Infinity` | `typeof(max) === "number"` for `*`, `+`, `{n,}` |
| `.` structure | `CharacterSet {kind:"any"}`, `parent.type === "Quantifier"` (no `parent.parent` hop needed) |
| `Alternative.raw` on Pattern | returns the **whole pattern** |
| atomic / possessive in JS | `(?>a+)` and `a++` → parse error |

---

## Python

Verified on CPython 3.13.14. Zero third-party dependencies.

### Detection (`analyze()`)

| Input | Expected | Result |
|-------|----------|--------|
| `(a+)+` | includes RD-001 | PASS |
| `(\w+\s?)*` | includes RD-001 | PASS |
| `((a+)+)` | includes RD-001 — **missed by v1** | PASS |
| `(a\|ab\|abc)*` | includes RD-002 | PASS |
| `(a\|ab)*` | includes RD-002 — **missed by v1** | PASS |
| `\d{150,}` | includes RD-004 — **never fired in v1** | PASS |
| `.*` | includes RD-005 | PASS |
| `.+` | includes RD-005 | PASS |
| `(a+)+` | includes RD-007 | PASS |

### No false positives

| Input | Expected | Result |
|-------|----------|--------|
| `^[a-z]+@[a-z]+\.[a-z]{2,}$` | `[]` | PASS |
| `^\w{1,20}$` | `[]` | PASS |
| `(a\|b)*` | `[]` | PASS |
| `(abc\|def\|ghi)*` | `[]` — **v1 flagged this spuriously** | PASS |
| `abc` | `[]` | PASS |

### Robustness

| Input | Expected | Result |
|-------|----------|--------|
| `(unclosed` | `[]`, no throw | PASS |
| flags argument accepted | list returned | PASS |

### Quantifier depth (`analyze_multiplier()`)

| Input | depth | label | severity | Result |
|-------|-------|-------|----------|--------|
| `(a+)+` | 2 | exponential (O(k^n)) | critical | PASS |
| `a+` | 1 | linear-unbounded | medium | PASS |
| `\w{1,20}` | 0 | bounded | none | PASS |
| `(\w+\s?)*` | ≥2 | — | — | PASS |

### Source-level RD-003 (`check_source()`)

| Input | Expected | Result |
|-------|----------|--------|
| `re.compile(request.args['p'])` | 1 finding | PASS |
| `re.compile(r'^a+$')` | `[]` | PASS |
| `pat.search(request.body)` | ≥1 finding | PASS |
| `def (` (syntax error) | `[]`, no throw | PASS |

### Atomic / possessive (Python 3.11+)

| Input | Expected | Result |
|-------|----------|--------|
| `(?>a+)` | parses, no error | PASS |
| `a++` | parses, no error | PASS |

### Defect verification (Python)

Reproduced against `re._parser` before the fix:

| Defect | Probe result |
|--------|--------------|
| RD-004 pattern `[+*]\{(\d{2,}),\}` | `\d{150,}` → **no match**; rule could never fire on its target |
| RD-002 required 3 alternatives | `(a\|ab)*` → no match (missed); `(abc\|def\|ghi)*` → **match** (false positive) |
| `\([^()]*...\)` nested check | `((a+)+)` → parens defeat the character class |
| quantifier representation | `MAX_REPEAT (1, MAXREPEAT)`; `MAXREPEAT` is the sentinel `4294967295` |
| atomic / possessive in Python | `(?>a+)` → `ATOMIC_GROUP`; `a++` → `POSSESSIVE_REPEAT` — **both parse** |

---

## How to reproduce

```bash
# JavaScript
cd security/cwe1333/js
npm install
node test/detect-redos.test.js
# PASSED: 18   FAILED: 0

# Python (from the repo root)
python3 security/cwe1333/tests/test_redos_detector.py
# PASSED: 27   FAILED: 0
```

## Known limitations

- Atomic groups / possessive quantifiers are not valid **JavaScript** — RD-006 is
  an advisory hint there. **Python 3.11+ supports both**, so RD-006 is actionable
  in Python.
- RD-003 is heuristic in both runtimes: it keys off regex-call shapes plus names
  containing `request` / `form` / `query` / `input` / `body` / `payload` / `params`.
- Static analysis only; no runtime backtracking measurement.
- The Python analyzer requires Python ≥ 3.11 for `re._parser`; older versions fall
  back to the deprecated `sre_parse`.
