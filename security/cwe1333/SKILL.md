# Security Module: CWE-1333 — ReDoS Detection (regexpp AST)

**ID:** `cwe1333-redos-detector-v2.0.0`  **Version:** 2.0.0  **Type:** Security Module
**Tags:** cwe-1333, redos, regex, security, eslint, regexpp, ast
**Severity:** P1 (High)  **Visibility:** Public · Verified

## Overview

An ESLint rule that detects **CWE-1333 — Inefficient Regular Expression
Complexity (ReDoS)** by parsing the real RegExp AST through
`@eslint-community/regexpp`, rather than matching raw strings. This replaces the
original hand-rolled-walker version, whose detection was largely dead code.

## Files (in `security/cwe1333/`)

```
js/index.js                    plugin entry (rules + recommended config)
js/lib/rules/detect-redos.js   rule + analyze() / analyzeMultiplier() core
js/test/detect-redos.test.js   18 tests (analyze core + RuleTester)
js/package.json                package manifest
```

## Rules

| ID | Name | Severity | Detects |
|----|------|----------|---------|
| RD-001 | Nested Quantifiers | critical | Unbounded quantifier wrapping another unbounded one, e.g. `(a+)+` |
| RD-002 | Overlapping Alternation | high | Prefix-overlapping branches in a repeated group, e.g. `(a\|ab\|abc)*` |
| RD-003 | RegExp from user input | high | `new RegExp(req.body.x)` / `/re/.test(req.query.q)` |
| RD-004 | Large min + unbounded max | medium | `\d{150,}` — high lower bound, no upper bound |
| RD-005 | Unbounded dot | high | `.*` / `.+` without a bound |
| RD-006 | Atomic-group candidate | info | Quantified group containing a quantifier — rewrite hint |
| RD-007 | Exponential depth | high | ≥2 nested unbounded quantifiers |

## Defects fixed in v2.0.0

Confirmed by AST probe against `@eslint-community/regexpp`:

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

## Usage

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

## Verifying

```bash
cd security/cwe1333/js
npm install
node test/detect-redos.test.js
# PASSED: 18   FAILED: 0
```

## Known limitations

- JavaScript does **not** support atomic groups `(?>...)` or possessive
  quantifiers `*+` / `++` — patterns using them fail to parse. RD-006 is
  therefore an advisory hint, not an auto-fix.
- RD-003 matches on property names (`.body`, `.query`, `.params`, `.input`);
  code using different names is not caught.
- Static analysis only — no runtime timing harness.

## References

- CWE-1333 — Inefficient Regular Expression Complexity
- OWASP — Regular expression Denial of Service (ReDoS)
- `@eslint-community/regexpp` — RegExp AST parser

## Related

- `security/cwe1321/` — Prototype Pollution Protection Suite (P0)
