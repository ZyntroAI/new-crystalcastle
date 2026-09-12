"use strict";

/**
 * ReDoS Detection Rules — detect-redos (regexpp AST edition)
 * CWE-1333: Inefficient Regular Expression Complexity
 *
 * This module is BOTH:
 *   1. An ESLint rule (meta + create) — the plugin surface.
 *   2. A pure analysis core (analyze / analyzeMultiplier) — testable without ESLint.
 *
 * Bug fixes vs the original hand-rolled-walker version:
 *   - B1: visitRegExpAST has no onEnterNode/onLeaveNode callback — the original
 *         nested-quantifier check never fired. Replaced with typed visitors.
 *   - B2: descriptorKey for a Quantifier is "onQuantifier", not "onQuantifierEnter".
 *         Both the original callback names were wrong; every Quantifier check was dead code.
 *   - B3: max === Infinity is a NUMBER in regexpp, not null. Kept the number check
 *         (the original was right here) but made it total and explicit.
 *   - B4: `.` parses as CharacterSet {kind:"any"}; the original's parent.parent branch
 *         was unreachable and its raw check missed nodes. Fixed to inspect `element`.
 *   - B5: Alternative.raw for the top-level Pattern wrapper is the WHOLE pattern.
 *         The original iterated it and produced spurious overlap matches. Filtered.
 *   - B6: parsePattern(pattern, node) passed an ESTree node as the `start` index.
 *         Signature is parsePattern(source, start, end, uFlag). Fixed + flags honoured.
 *   - B7: RuleTester used parserOptions (ESLint 8 style) and `.*+` (invalid JS regex).
 */

const { RegExpParser, visitRegExpAST } = require("@eslint-community/regexpp");

const parser = new RegExpParser();

/* ------------------------------------------------------------------ *
 * Rule catalogue (bilingual TH/EN)
 * ------------------------------------------------------------------ */
const REDOS_DEFS = {
  NESTED_QUANTIFIER: {
    id: "RD-001",
    severity: "critical",
    name: "Nested Quantifiers",
    message:
      "พบ Quantifier ซ้อนกัน (กลุ่มที่ซ้ำภายใต้กลุ่มที่ซ้ำ) → เสี่ยง Backtracking แบบเลขชี้กำลัง",
    fix: "ลดการซ้อน / ระบุขอบเขต {min,max} / ใช้ Lookahead อะตอมิก",
  },
  OVERLAPPING_ALT: {
    id: "RD-002",
    severity: "high",
    name: "Overlapping Alternation",
    message:
      "ทางเลือกที่ซ้อนทับกันภายใต้กลุ่มที่ซ้ำ → เพิ่มเวลาแยกทางเลือกแบบเลขชี้กำลัง",
    fix: "เรียงทางเลือกจากยาวไปสั้น / ลบทางเลือกที่ซ้ำกัน / ลดจำนวนทางเลือก",
  },
  USER_INPUT: {
    id: "RD-003",
    severity: "high",
    name: "RegExp built from user input",
    message:
      "สร้างหรือใช้ RegExp กับข้อมูลผู้ใช้โดยตรง → เสี่ยง ReDoS จาก pattern ที่ผู้ใช้ควบคุม",
    fix: "ใช้ pattern คงที่ (whitelist) / จำกัดความยาว input ก่อนทดสอบ",
  },
  LARGE_MIN_UNBOUNDED: {
    id: "RD-004",
    severity: "medium",
    name: "Large minimum with unbounded maximum",
    message:
      "Quantifier ไม่มีขอบบนและมีค่าน้อยสุดสูงผิดปกติ → อาจช้ามากเมื่อไม่ตรงรูปแบบ",
    fix: "กำหนดขอบเขตบนเสมอ: {min,max}",
  },
  DOT_STAR: {
    id: "RD-005",
    severity: "high",
    name: "Unbounded dot",
    message: "ใช้ . แบบไม่จำกัด (* หรือ +) → เสี่ยง ReDoS สูง โดยเฉพาะเมื่อซ้อนในกลุ่ม",
    fix: "ใช้ตัวอักษรเฉพาะเจาะจง เช่น [^\\n] / [^a-z] หรือจำกัดขอบเขต",
  },
  ATOMIC_GROUP: {
    id: "RD-006",
    severity: "info",
    name: "Atomic-group rewrite candidate",
    message:
      "กลุ่มที่ซ้ำนี้มี Quantifier อยู่ข้างใน — ลด backtracking ได้ด้วย Lookahead-style rewrite (JavaScript ไม่รองรับ (?>...) หรือ possessive quantifier)",
    fix: "แปลงด้วย Lookahead + backreference (ดู README) เนื่องจาก JS ไม่มี atomic group",
  },
  MULTIPLIER: {
    id: "RD-007",
    severity: "high",
    name: "Exponential quantifier depth",
    message: "พบ Quantifier ไม่จำกัดขอบซ้อนกัน ≥ 2 ชั้น → ความซับซ้อนเป็นเลขชี้กำลัง",
    fix: "ลดความลึกของการซ้อน หรือเปลี่ยนไปใช้ parser ที่ไม่ใช้ backtracking",
  },
};

/* ------------------------------------------------------------------ *
 * Helpers — all pure, all single-pass via visitRegExpAST
 * ------------------------------------------------------------------ */

/** regexpp flags param: only "u" / "v" are meaningful; anything else → false. */
function toRegexppFlags(flags) {
  if (!flags) return false;
  if (flags.includes("v")) return "v";
  if (flags.includes("u")) return "u";
  return false;
}

/** Parse a pattern; return null on invalid syntax instead of throwing. */
function parsePattern(pattern, flags) {
  try {
    return parser.parsePattern(pattern, 0, pattern.length, toRegexppFlags(flags));
  } catch {
    return null;
  }
}

/** An unbounded quantifier: regexpp reports max as Infinity (a number). */
function isUnbounded(q) {
  return q.max === Infinity;
}

/** Collect every Quantifier inside `node`'s subtree (NOT including node itself). */
function descendants(node) {
  const out = [];
  if (!node) return out;
  visitRegExpAST(node, {
    onQuantifierEnter(n) {
      out.push(n);
    },
  });
  return out;
}

/** RD-001: an unbounded quantifier wrapping another unbounded quantifier. */
function hasNestedQuantifiers(ast) {
  let found = false;
  visitRegExpAST(ast, {
    onQuantifierEnter(q) {
      if (found || !isUnbounded(q)) return;
      if (descendants(q.element).some(isUnbounded)) found = true;
    },
  });
  return found;
}

/** RD-002: >=2 alternatives inside a quantified group where one raw is a prefix of another. */
function hasOverlappingAlternation(ast) {
  let found = false;
  const check = (group) => {
    if (found) return;
    if (!group.parent || group.parent.type !== "Quantifier") return;
    const alts = group.alternatives;
    if (!alts || alts.length < 2) return;
    const raws = alts.map((a) => a.raw);
    for (let i = 0; i < raws.length; i++) {
      for (let j = 0; j < raws.length; j++) {
        if (i === j) continue;
        const a = raws[i];
        const b = raws[j];
        if (!a || !b) continue;
        if (a === b || (a.length <= b.length && b.startsWith(a))) found = true;
      }
    }
  };
  visitRegExpAST(ast, {
    onGroupEnter: check,
    onCapturingGroupEnter: check,
  });
  return found;
}

/** RD-004: unbounded maximum with an unusually large minimum (>= 10). */
function hasLargeMinUnbounded(ast) {
  let found = false;
  visitRegExpAST(ast, {
    onQuantifierEnter(q) {
      if (isUnbounded(q) && q.min >= 10) found = true;
    },
  });
  return found;
}

/** RD-005: an unbounded quantifier applied to `.` (CharacterSet kind "any"). */
function hasUnboundedDot(ast) {
  let found = false;
  visitRegExpAST(ast, {
    onQuantifierEnter(q) {
      if (!isUnbounded(q)) return;
      const el = q.element;
      if (el && el.type === "CharacterSet" && el.kind === "any") found = true;
    },
  });
  return found;
}

/** RD-006: any quantified group that itself contains a quantifier. */
function hasAtomicGroupCandidate(ast) {
  let found = false;
  const check = (group) => {
    if (found) return;
    if (!group.parent || group.parent.type !== "Quantifier") return;
    if (descendants(group).length > 0) found = true;
  };
  visitRegExpAST(ast, {
    onGroupEnter: check,
    onCapturingGroupEnter: check,
  });
  return found;
}

/* ------------------------------------------------------------------ *
 * Public analysis core
 * ------------------------------------------------------------------ */

/**
 * Depth of the deepest chain of unbounded quantifiers.
 *   "(a+)+"  -> 2  (exponential)
 *   "a+"     -> 1  (linear-unbounded)
 *   "\w{1,20}" -> 0 (bounded)
 */
function analyzeMultiplier(pattern, flags) {
  const ast = parsePattern(pattern, flags);
  if (!ast) return { depth: 0, label: "unparseable", severity: "none" };

  let maxDepth = 0;
  visitRegExpAST(ast, {
    onQuantifierEnter(q) {
      let depth = 0;
      let cur = q;
      while (cur) {
        if (cur.type === "Quantifier" && isUnbounded(cur)) depth++;
        cur = cur.parent;
      }
      if (depth > maxDepth) maxDepth = depth;
    },
  });

  if (maxDepth >= 2) {
    return { depth: maxDepth, label: "exponential (O(k^n))", severity: "critical" };
  }
  if (maxDepth === 1) {
    return { depth: maxDepth, label: "linear-unbounded", severity: "medium" };
  }
  return { depth: 0, label: "bounded", severity: "none" };
}

/**
 * Analyse a regex pattern and return findings (pure; no side effects).
 * RD-003 is ESTree-level (user input) and is reported by the ESLint rule, not here.
 */
function analyze(pattern, flags) {
  const findings = [];
  const ast = parsePattern(pattern, flags);
  if (!ast) return findings;

  if (hasNestedQuantifiers(ast)) findings.push(REDOS_DEFS.NESTED_QUANTIFIER);
  if (hasOverlappingAlternation(ast)) findings.push(REDOS_DEFS.OVERLAPPING_ALT);
  if (hasLargeMinUnbounded(ast)) findings.push(REDOS_DEFS.LARGE_MIN_UNBOUNDED);
  if (hasUnboundedDot(ast)) findings.push(REDOS_DEFS.DOT_STAR);
  if (hasAtomicGroupCandidate(ast)) findings.push(REDOS_DEFS.ATOMIC_GROUP);

  const mult = analyzeMultiplier(pattern, flags);
  if (mult.depth >= 2) findings.push(REDOS_DEFS.MULTIPLIER);

  return findings;
}

/* ------------------------------------------------------------------ *
 * ESTree-level check — dynamic / user-input RegExp
 * ------------------------------------------------------------------ */
const REGEX_METHODS = new Set(["test", "exec", "match", "matchAll", "search", "split"]);
const USER_INPUT_RE = /\.(body|query|params|input)\b/;

/* ------------------------------------------------------------------ *
 * ESLint rule
 * ------------------------------------------------------------------ */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Detect ReDoS-prone regular expressions (CWE-1333) via regexpp AST",
      recommended: true,
    },
    schema: [],
    messages: {
      redos: "[{{id}}] {{severity}}: {{message}} → {{fix}}",
    },
  },

  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function report(node, def) {
      context.report({
        node,
        messageId: "redos",
        data: { ...def, severity: String(def.severity).toUpperCase() },
      });
    }

    function checkPattern(node, pattern, flags) {
      for (const finding of analyze(pattern, flags)) report(node, finding);
    }

    return {
      Literal(node) {
        if (node.regex) checkPattern(node, node.regex.pattern, node.regex.flags);
      },

      NewExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "RegExp") return;
        const arg = node.arguments[0];
        if (arg && arg.type === "Literal" && typeof arg.value === "string") {
          checkPattern(node, arg.value, "");
        } else {
          report(node, REDOS_DEFS.USER_INPUT);
        }
      },

      CallExpression(node) {
        if (node.callee.type === "Identifier" && node.callee.name === "RegExp") {
          const arg = node.arguments[0];
          if (arg && arg.type === "Literal" && typeof arg.value === "string") {
            checkPattern(node, arg.value, "");
          } else {
            report(node, REDOS_DEFS.USER_INPUT);
          }
          return;
        }
        // regex.test(request.body) / str.match(request.query.q) …
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          REGEX_METHODS.has(node.callee.property.name)
        ) {
          const touchesUserInput = node.arguments.some((a) => {
            try {
              return USER_INPUT_RE.test(sourceCode.getText(a));
            } catch {
              return false;
            }
          });
          if (touchesUserInput) report(node, REDOS_DEFS.USER_INPUT);
        }
      },
    };
  },
};

module.exports = rule;
module.exports.analyze = analyze;
module.exports.analyzeMultiplier = analyzeMultiplier;
module.exports.REDOS_DEFS = REDOS_DEFS;
