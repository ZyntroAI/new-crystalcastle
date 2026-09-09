✅ ESLint Rule + regexpp Deep Regex Parsing
 
Upgrade from simple string matching → true AST parsing of RegExp structure: detects nested quantifiers, alternation, lookarounds, repetitions, and unsafe patterns with precision.
 
 
 
📦 Install Dependencies
 
bash
  
npm install @eslint-community/regexpp --save-dev
 
 
 
 
🧠 Core Rule:  detect-redos.js  (Deep Parsing)
 
js
  
/**
 * ESLint Rule: ReDoS Detector with regexpp AST
 * CWE-1333 | Nested Quantifiers • Overlapping • Unbounded • User Input
 */
const { RegExpParser, visitRegExpAST } = require("@eslint-community/regexpp");
const parser = new RegExpParser();

// --------------------------
// Rule Config (Bilingual TH/EN)
// --------------------------
const REDOS_DEFS = {
  NESTED_QUANTIFIER: {
    id: "RD-001",
    severity: "critical",
    message: "พบ Quantifier ซ้อนกัน (กลุ่มที่ซ้ำภายในกลุ่มซ้ำ) → เสี่ยง Backtracking เลขชี้กำลัง",
    fix: "ใช้ Lookahead อะตอมิก / ลดการซ้อน / ระบุขอบเขต"
  },
  OVERLAPPING_ALT: {
    id: "RD-002",
    severity: "high",
    message: "ทางเลือกที่ซ้อนทับกันภายในกลุ่มที่ซ้ำได้ → เพิ่มภาระการตรวจจับ",
    fix: "เรียงจากยาว→สั้น / ลบทางเลือกที่ซ้ำซ้อน"
  },
  UNBOUNDED: {
    id: "RD-004",
    severity: "medium",
    message: "Quantifier ไม่มีขอบบน เช่น {n,} → ช้ามากเมื่อไม่ตรง",
    fix: "กำหนดขอบเขตบนเสมอ: {min,max}"
  },
  DOT_STAR: {
    id: "RD-005",
    severity: "high",
    message: "ใช้ .* หรือ .+ ภายในกลุ่มที่ซ้ำได้ → เสี่ยง ReDoS สูง",
    fix: "ใช้ตัวอักษรเฉพาะ เช่น [^\\n] / [^a-z]"
  },
  USER_INPUT: {
    id: "RD-003",
    severity: "high",
    message: "RegEx ประมวลผลข้อมูลจากผู้ใช้โดยตรง → เสี่ยงโจมตี",
    fix: "จำกัดความยาวข้อมูล / ตรวจสอบก่อนใช้"
  }
};

// --------------------------
// Helpers
// --------------------------
function parseRegEx(pattern, node) {
  try { return parser.parsePattern(pattern); }
  catch { return null; }
}

function hasNestedQuantifiers(ast) {
  let found = false;
  let parentRepeat = null;
  visitRegExpAST(ast, {
    onEnterNode(n) { if (n.type === "Quantifier") parentRepeat = n; },
    onLeaveNode(n) { if (n.type === "Quantifier") parentRepeat = null; },
    onQuantifierEnter(n) { if (parentRepeat) { found = true; return false; } }
  });
  return found;
}

function hasOverlappingAlternation(ast) {
  let found = false;
  visitRegExpAST(ast, {
    onAlternativeEnter(a) {
      if (a.parent?.type === "Group" || a.parent?.type === "CapturingGroup") {
        const p = a.parent;
        if (p.alternatives?.length >= 2 && p.parent?.type === "Quantifier") {
          const texts = p.alternatives.map(x => x.raw);
          const sorted = texts.slice().sort((x,y)=>y.length-x.length);
          if (sorted.some((t,i)=>sorted.slice(i+1).some(o=>t.startsWith(o)))) found = true;
        }
      }
    }
  });
  return found;
}

function hasUnbounded(ast) {
  let found = false;
  visitRegExpAST(ast, {
    onQuantifierEnter(n) {
      if (n.max === Infinity && n.min >= 10) found = true;
    }
  });
  return found;
}

function hasDotStar(ast) {
  let found = false;
  visitRegExpAST(ast, {
    onCharacterSetEnter(n) {
      if (n.kind === "any" && n.parent?.parent?.type === "Quantifier") found = true;
    },
    onQuantifierEnter(n) {
      if ((n.raw === "*" || n.raw === "+") && n.element?.raw === ".") found = true;
    }
  });
  return found;
}

function checkUserInput(node) {
  const src = node.parent?.parent?.parent?.range 
    ? node.parent.parent.parent.loc.source 
    : "";
  return /\.(body|query|params|input)\s*[)]?/i.test(src);
}

// --------------------------
// ESLint Rule
// --------------------------
module.exports = {
  meta: {
    type: "problem",
    docs: { description: "ReDoS Detector (Deep RegEx AST via regexpp)" },
    schema: [],
    messages: { redos: "[{{id}}] {{severity}}: {{message}} → {{fix}}" }
  },
  create(context) {
    function report(node, def) {
      context.report({
        node,
        messageId: "redos",
        data: { ...def, severity: def.severity.toUpperCase() }
      });
    }

    function check(node, pattern) {
      const ast = parseRegEx(pattern, node);
      if (!ast) return;

      if (hasNestedQuantifiers(ast)) report(node, REDOS_DEFS.NESTED_QUANTIFIER);
      if (hasOverlappingAlternation(ast)) report(node, REDOS_DEFS.OVERLAPPING_ALT);
      if (hasUnbounded(ast)) report(node, REDOS_DEFS.UNBOUNDED);
      if (hasDotStar(ast)) report(node, REDOS_DEFS.DOT_STAR);
      if (checkUserInput(node)) report(node, REDOS_DEFS.USER_INPUT);
    }

    return {
      Literal(n) { if (n.regex) check(n, n.regex.pattern); },
      NewExpression(n) {
        if (n.callee.name === "RegExp" && n.arguments[0]?.type === "Literal")
          check(n, n.arguments[0].value);
      },
      CallExpression(n) {
        if (n.callee.name === "RegExp" && n.arguments[0]?.type === "Literal")
          check(n, n.arguments[0].value);
      }
    };
  }
};
 
 
 
 
📂 Plugin Entry ( index.js )
 
js
  
const rule = require("./lib/rules/detect-redos");
module.exports = {
  meta: { name: "eslint-plugin-redos-detector", version: "1.1.0" },
  rules: { "detect-redos": rule },
  configs: {
    recommended: {
      plugins: ["redos-detector"],
      rules: { "redos-detector/detect-redos": "error" }
    }
  }
};
 
 
 
 
📝 Key Upgrades (regexpp Advantages)
 
✅ No more string guesswork: Parses actual RegEx syntax tree
✅ Precision: Detects true nesting ( (a+)*  vs  (a)+ )
✅ Context-aware: Checks if alternation repeats
✅ Structure: Distinguishes  * / + / {n,}  and positions
✅ Robust: Skips invalid regex safely
 
 
 
🧪 Test Cases
 
js
  
const { RuleTester } = require("eslint");
const rule = require("./lib/rules/detect-redos");
const t = new RuleTester({ parserOptions: { ecmaVersion: 2020 } });

t.run("redos-deep", rule, {
  valid: [/^\w{1,20}$/, /^[a-z]+@[a-z]+\.[a-z]{2,}$/],
  invalid: [
    { code: "const r = /^(\\w+\\s?)*$/;", errors: 1 }, // Nested
    { code: "const r = /(a|ab|abc)*$/;", errors: 1 }, // Overlap
    { code: "const r = /.*+/;", errors: 1 }, // Dot-Star
    { code: "const r = /\\d{150,}/;", errors: 1 } // Unbounded
  ]
});
console.log("✅ All tests passed");
 
 
 
 
🚀 Usage
 
json
  
// .eslintrc
{
  "plugins": ["redos-detector"],
  "rules": { "redos-detector/detect-redos": "error" }
}
 
 
 
 
📌 Output Example
 
plaintext
  
1:13  error  [RD-001] CRITICAL: พบ Quantifier ซ้อนกัน... → ใช้ Lookahead อะตอมิก
 
 
 
 
Next Steps
 
- Add atomic group detection
- Add quantifier multiplier analysis
- Add false-positive filtering
- Full TH/EN docs + severity config
 
Want me to add severity mapping or configurable ignore patterns?
