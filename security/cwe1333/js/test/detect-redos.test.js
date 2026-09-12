/**
 * Test suite — eslint-plugin-redos-detector (v2.0.0)
 *
 * Two layers:
 *   1. analyze() / analyzeMultiplier() — the pure AST core, tested in isolation.
 *   2. RuleTester — the full rule, end-to-end through ESLint.
 *
 * Run: node test/detect-redos.test.js
 */

import assert from "node:assert";
import { RuleTester } from "eslint";
import rule, { analyze, analyzeMultiplier } from "../lib/rules/detect-redos.js";

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    fn();
    passed++;
    console.log("  PASS  " + label);
  } catch (err) {
    failed++;
    console.log("  FAIL  " + label + "\n        " + err.message);
  }
}

function ids(findings) {
  return findings.map((f) => f.id).sort();
}

/* ============================================================== *
 * Layer 1 — analyze() core
 * ============================================================== */
console.log("\nanalyze() — detection");

check("nested quantifier (a+)+ flags RD-001", () => {
  assert.ok(ids(analyze("(a+)+")).includes("RD-001"));
});
check("nested quantifier via group (\\w+\\s?)* flags RD-001", () => {
  assert.ok(ids(analyze("(\\w+\\s?)*")).includes("RD-001"));
});
check("overlapping alternation (a|ab|abc)* flags RD-002", () => {
  assert.ok(ids(analyze("(a|ab|abc)*")).includes("RD-002"));
});
check("large-min unbounded \\d{150,} flags RD-004", () => {
  assert.ok(ids(analyze("\\d{150,}")).includes("RD-004"));
});
check("unbounded dot .* flags RD-005", () => {
  assert.ok(ids(analyze(".*")).includes("RD-005"));
});
check("unbounded dot .+ flags RD-005", () => {
  assert.ok(ids(analyze(".+")).includes("RD-005"));
});
check("exponential depth flags RD-007", () => {
  assert.ok(ids(analyze("(a+)+")).includes("RD-007"));
});

console.log("\nanalyze() — no false positives");

check("safe email regex returns no findings", () => {
  assert.deepStrictEqual(analyze("^[a-z]+@[a-z]+\\.[a-z]{2,}$"), []);
});
check("bounded quantifier \\w{1,20} returns no findings", () => {
  assert.deepStrictEqual(analyze("^\\w{1,20}$"), []);
});
check("non-overlapping alternation (a|b)* returns no findings", () => {
  assert.deepStrictEqual(analyze("(a|b)*"), []);
});
check("plain literal abc returns no findings", () => {
  assert.deepStrictEqual(analyze("abc"), []);
});

console.log("\nanalyze() — robustness");

check("invalid pattern returns empty array, does not throw", () => {
  assert.deepStrictEqual(analyze("(unclosed"), []);
});
check("unicode flag pattern parses", () => {
  assert.ok(Array.isArray(analyze("\\p{L}+", "u")));
});

/* ============================================================== *
 * analyzeMultiplier()
 * ============================================================== */
console.log("\nanalyzeMultiplier() — quantifier depth");

check("(a+)+ is depth 2 exponential/critical", () => {
  const r = analyzeMultiplier("(a+)+");
  assert.strictEqual(r.depth, 2);
  assert.strictEqual(r.severity, "critical");
});
check("a+ is depth 1 linear-unbounded/medium", () => {
  const r = analyzeMultiplier("a+");
  assert.strictEqual(r.depth, 1);
  assert.strictEqual(r.severity, "medium");
});
check("\\w{1,20} is bounded", () => {
  const r = analyzeMultiplier("\\w{1,20}");
  assert.strictEqual(r.depth, 0);
  assert.strictEqual(r.label, "bounded");
});
check("(\\w+\\s?)* reports depth >= 2", () => {
  assert.ok(analyzeMultiplier("(\\w+\\s?)*").depth >= 2);
});

/* ============================================================== *
 * Layer 2 — RuleTester (ESLint 9+ flat config)
 * ============================================================== */
console.log("\nRuleTester — end-to-end through ESLint");

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

check("RuleTester valid + invalid cases all behave", () => {
  ruleTester.run("detect-redos", rule, {
    valid: [
      "const r = /^\\w{1,20}$/;",
      "const r = /^[a-z]+@[a-z]+\\.[a-z]{2,}$/;",
      "const r = /(a|b)*/;",
      "const r = /abc/;",
      "const r = /\\d{1,3}\\.\\d{1,3}/;",
    ],
    invalid: [
      // (a+)+ trips three rules: nesting (RD-001), atomic-group candidate (RD-006), depth (RD-007)
      {
        code: "const r = /(a+)+/;",
        errors: [
          { messageId: "redos" },
          { messageId: "redos" },
          { messageId: "redos" },
        ],
      },
      { code: "const r = /(a|ab|abc)*/;", errors: [{ messageId: "redos" }] },
      { code: "const r = /.*/;", errors: [{ messageId: "redos" }] },
      { code: "const r = /\\d{150,}/;", errors: [{ messageId: "redos" }] },
      { code: "const r = new RegExp(req.body.pattern);", errors: [{ messageId: "redos" }] },
    ],
  });
});

/* ============================================================== *
 * Summary
 * ============================================================== */
console.log("\n" + "=".repeat(52));
console.log("  PASSED: " + passed + "   FAILED: " + failed);
console.log("=".repeat(52));

if (failed > 0) process.exit(1);
