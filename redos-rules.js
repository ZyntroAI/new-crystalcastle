/**
 * ReDoS Detection Rules — JavaScript Edition
 * CWE-1333: Inefficient Regular Expression Complexity
 * Version: 1.0 | 2026-09-09
 */

const REDOS_RULES = [
  {
    id: "RD-001",
    severity: "CRITICAL",
    name: "Nested Quantifiers",
    pattern: /\([^()]*[+*][^()]*\)\s*[+*]\??/g,
    message: "Quantifier ซ้อนกัน เช่น (A+)* ทำให้เกิด Backtracking แบบเลขชี้กำลัง — แก้ด้วย Lookahead",
    fixExample: "เปลี่ยน /^(\\w+\\s?)*$/ เป็น /^((?=(\\w+))\\2\\s?)*$/"
  },
  {
    id: "RD-002",
    severity: "HIGH",
    name: "Overlapping Alternation",
    pattern: /\([^)|]+\|[^)|]+\|[^)|]+\)\s*[+*]/g,
    message: "ทางเลือกที่ซ้อนทับกัน เช่น (a|ab|abc)* เพิ่มเวลาประมวลผลแบบเลขชี้กำลัง",
    fixExample: "ลดทางเลือกให้ไม่ซ้อนทับกัน หรือเรียงจากยาวไปสั้น"
  },
  {
    id: "RD-003",
    severity: "HIGH",
    name: "Unbounded Quantifier with User Input",
    pattern: /(test|match|search|exec|compile)\s*\([^)]*\.(body|query|params|input)/gi,
    message: "RegEx ทำงานกับข้อมูลผู้ใช้โดยไม่จำกัดความยาว — เสี่ยง ReDoS",
    fixExample: "จำกัดความยาวข้อความก่อน: if (str.length > 1000) reject"
  },
  {
    id: "RD-004",
    severity: "MEDIUM",
    name: "Large Minimum Quantifier",
    pattern: /[+*]\{(\d{2,}),\}/g,
    message: `Quantifier ขั้นต่ำมากโดยไม่มีขอบบน — อาจช้ามากเมื่อไม่ตรงกับรูปแบบ`,
    fixExample: "กำหนดขอบเขตบนเสมอ: {min,max}"
  }
];

// ตรวจสอบ RegEx
function detectReDoS(pattern) {
  const findings = [];
  for (const rule of REDOS_RULES) {
    if (rule.pattern.test(pattern)) {
      findings.push({ ...rule });
    }
  }
  return findings;
}

module.exports = { detectReDoS, REDOS_RULES };