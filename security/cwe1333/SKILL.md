# Security Module: CWE-1333 — ReDoS Detection (AST-based)

**ID:** `cwe1333-redos-detector-v2.0.0`  **Version:** 2.0.0  **Type:** Security Module
**Tags:** cwe-1333, redos, regex, security, eslint, regexpp, ast, python
**Severity:** P1 (High)  **Visibility:** Public · Verified

## Overview

Detects **CWE-1333 — Inefficient Regular Expression Complexity (ReDoS)** by
parsing the real regular-expression AST, rather than matching raw strings. Two
runtimes share the same seven rule IDs and the same findings vocabulary:

- **JavaScript** — an ESLint rule over `@eslint-community/regexpp` AST.
- **Python** — a pure-stdlib module over the `re._parser` AST (no dependencies).

Both replace earlier hand-rolled versions whose detection was partly dead and
partly wrong.

## Files (in `security/cwe1333/`)

```
js/index.js                     ESLint plugin entry (rules + recommended config)
js/lib/rules/detect-redos.js    rule + analyze() / analyzeMultiplier() core
js/test/detect-redos.test.js    18 tests (analyze core + RuleTester)
js/package.json                 package manifest
python/redos_detector.py        analyze() / analyze_multiplier() / check_source()
tests/test_redos_detector.py    27 tests
manifest.json                   registered in skills/index.json
```

## Rules

| ID | Name | Severity | Detects |
|----|------|----------|---------|
| RD-001 | Nested Quantifiers | critical | Unbounded quantifier wrapping another unbounded one, e.g. `(a+)+` |
| RD-002 | Overlapping Alternation | high | Prefix-overlapping branches in a repeated group, e.g. `(a\|ab\|abc)*` |
| RD-003 | RegExp from user input | high | `new RegExp(req.body.x)` / `re.compile(request.args["p"])` |
| RD-004 | Large min + unbounded max | medium | `\d{150,}` — high lower bound, no upper bound |
| RD-005 | Unbounded dot | high | `.*` / `.+` without a bound |
| RD-006 | Atomic-group candidate | info | Quantified group containing a quantifier — rewrite hint |
| RD-007 | Exponential depth | high | ≥2 nested unbounded quantifiers |

## Defects fixed in v2.0.0

### JavaScript — confirmed against `@eslint-community/regexpp`

1. **`onEnterNode` / `onLeaveNode` do not exist** in `visitRegExpAST` — they fired
   0 times, so the nested-quantifier check (RD-001) could never trigger.
2. **Wrong descriptor keys** — the real keys are `onQuantifier` / `onAlternative`,
   not `onQuantifierEnter` / `onAlternativeEnter`.
3. **`max === Infinity` is a number**, not `null`; gating it behind `min >= 10`
   let `*` and `+` escape entirely.
4. **`parent.parent.type === "Quantifier"` is unreachable** — `.` parses as
   `CharacterSet { kind: "any" }` whose parent *is* the Quantifier.
5. **`Alternative.raw` on the top-level Pattern wrapper returns the whole
   pattern**, producing spurious overlap matches.
6. **`parsePattern(pattern, node)` passed an ESTree node as the `start` index**;
   the real signature is `(source, start, end, uFlag)`.
7. **RuleTester used `parserOptions` and `.*+`** — ESLint 9+ needs flat-config
   `languageOptions`, and `.*+` is not valid JavaScript regex.

### Python — confirmed against `re._parser`

1. **RD-004 could never fire.** Its pattern `[+*]\{(\d{2,}),\}` requires a `+`
   or `*` *before* the brace, but the thing it targets — `\d{150,}` — has none.
2. **RD-002 missed two-branch groups.** The pattern demanded three alternatives,
   so `(a|ab)*` was missed; and it matched `(abc|def|ghi)*`, where the branches
   share no prefix, firing on a safe pattern.
3. **Nested-quantifier detection was defeated by parentheses.** The
   `\([^()]*...\)` shape could not see inside a group, so `((a+)+)` was missed.

The v2 Python module walks real `MAX_REPEAT` / `MIN_REPEAT` / `BRANCH` /
`SUBPATTERN` nodes instead. Analysis itself never backtracks.

## Usage — JavaScript

### ESLint 9+ (flat config)

```js
// eslint.config.js
import redos from "./security/cwe1333/js/index.js";

export default [
  {
    plugins: { "redos-detector": redos },
    rules: { "redos-detector/detect-redos": "error" },
  },
];
```

### ESLint 8 (eslintrc)

```json
{
  "plugins": ["redos-detector"],
  "rules": { "redos-detector/detect-redos": "error" }
}
```

### Programmatic

```js
import { analyze, analyzeMultiplier } from "./security/cwe1333/js/lib/rules/detect-redos.js";

analyze("(a+)+");                 // => [RD-001, RD-006, RD-007]
analyze("^[a-z]+@[a-z]+$");       // => []  (no false positive)
analyzeMultiplier("(a+)+");       // => { depth: 2, label: "exponential (O(k^n))", severity: "critical" }
```

## Usage — Python

```python
from redos_detector import analyze, analyze_multiplier, check_source, report

analyze(r"(a+)+")                       # => [RD-001, RD-006, RD-007]
analyze(r"^[a-z]+@[a-z]+\.[a-z]{2,}$")  # => []  (no false positive)
analyze_multiplier(r"(a+)+")            # => {"depth": 2, "label": "exponential (O(k^n))", "severity": "critical"}

# Source-level RD-003, over a file's text:
check_source('import re\nre.compile(request.args["p"])\n')
# => [{"line": 2, "col": 0, "finding": <RD-003>}]

print(report(analyze(r"(a+)+")))
```

Zero third-party dependencies — standard library only.

## Verifying

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

`python3 -m pyflakes security/cwe1333/python/redos_detector.py` is clean.

## Known limitations

- **JavaScript** does **not** support atomic groups `(?>...)` or possessive
  quantifiers `*+` / `++` — such patterns fail to parse, so RD-006 is advisory
  there. **Python 3.11+ does support both**, so RD-006 is actionable in Python.
- RD-003 is heuristic: it keys off regex-call shapes plus names containing
  `request` / `form` / `query` / `input` / `body` / `payload` / `params`.
  Code using other names is not caught.
- Static analysis only — no runtime timing harness.
- The Python analyzer needs Python ≥ 3.11 for `re._parser`; on older versions it
  falls back to the deprecated `sre_parse`.

## References

- CWE-1333 — Inefficient Regular Expression Complexity
- OWASP — Regular expression Denial of Service (ReDoS)
- `@eslint-community/regexpp` — RegExp AST parser (JS)
- `re._parser` — CPython's own regex parser (Python)

## Related

- `security/cwe1321/` — Prototype Pollution Protection Suite (P0)
