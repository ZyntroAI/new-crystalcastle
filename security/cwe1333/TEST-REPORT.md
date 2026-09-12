# Test Report — CWE-1333 ReDoS Detection Suite

**Task:** TASK-SEC-CWE1333-002 · **Date:** 2026-09-12 · **Status:** PASSING

## Summary

| Layer | Suite | Result |
|-------|-------|--------|
| Analysis core | `node test/detect-redos.test.js` — `analyze()` | 13 passed / 0 failed |
| Analysis core | `node test/detect-redos.test.js` — `analyzeMultiplier()` | 4 passed / 0 failed |
| Rule integration | `RuleTester` through real ESLint 9 | 1 passed / 0 failed (5 valid + 5 invalid cases) |
| **Total** | | **18 passed / 0 failed** |

Verified twice: in a scratch directory, and in-repo at `security/cwe1333/js/`
after `npm install` on a clean checkout.

## Test cases

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

## Defect verification

Each documented defect was reproduced against the live AST before the fix, using
a standalone probe (`@eslint-community/regexpp@4.12.2`):

| Defect | Probe result |
|--------|--------------|
| `onEnterNode` / `onLeaveNode` absent | fired **0** times vs `onQuantifierEnter` **2** times on `/(a+)+/` |
| `max === Infinity` | `typeof(max) === "number"` for `*`, `+`, `{n,}` |
| `.` structure | `CharacterSet {kind:"any"}`, `parent.type === "Quantifier"` (no `parent.parent` hop needed) |
| `Alternative.raw` on Pattern | returns the **whole pattern** |
| atomic / possessive in JS | `(?>a+)` and `a++` → parse error |

## How to reproduce

```bash
cd security/cwe1333/js
npm install
node test/detect-redos.test.js
# PASSED: 18   FAILED: 0
```

## Known limitations

- Atomic groups / possessive quantifiers are not valid JavaScript — RD-006 is an
  advisory hint only.
- RD-003 keys off property names (`.body`, `.query`, `.params`, `.input`).
- Static analysis only; no runtime backtracking measurement.
