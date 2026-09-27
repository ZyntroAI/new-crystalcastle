ได้เลยครับ ✅ แปลงเป็น TypeScript ฉบับสมบูรณ์ — รองรับ Bun/Node.js, แยกโมดูล, ประเภทชัดเจน, ใช้งานง่าย และปลอดภัย 🚀
 
บันทึกเป็น  scripts/apply-ci-fixes.ts :
 
typescript  
#!/usr/bin/env tsx
/**
 * CI Fixes Applier — ZyntroAI
 * Mode: dry-run (default) | --write (apply changes)
 * Converted from bash → TypeScript
 */

import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, relative } from 'node:path';

// ─── Types ────────────────────────────────────────────────────────
interface FixGroup {
  branches: string[];
  always: string[];
  cache: string[];
}

interface ManualGroup {
  indent: string[];
  markdown: string[];
  incomplete: string[];
}

interface ScanResult {
  fixable: FixGroup;
  manual: ManualGroup;
  allFiles: string[];
}

// ─── Config ───────────────────────────────────────────────────────
const VERSION = '2.0.0-ts';
const REPO_ROOT = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const WORKFLOWS_DIR = resolve(REPO_ROOT, '.github', 'workflows');

// ─── CLI State ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--write');

// ─── Colors ──────────────────────────────────────────────────────
const C = {
  red: '\x1b[0;31m',
  grn: '\x1b[0;32m',
  yel: '\x1b[1;33m',
  blu: '\x1b[0;34m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  rst: '\x1b[0m',
} as const;

const out = {
  info: (s: string) => console.log(`${C.blu}ℹ${C.rst} ${s}`),
  ok: (s: string) => console.log(`${C.grn}✅${C.rst} ${s}`),
  warn: (s: string) => console.log(`${C.yel}⚠️${C.rst} ${s}`),
  fail: (s: string) => console.error(`${C.red}❌${C.rst} ${s}`),
  title: (s: string) => console.log(`\n${C.bold}${s}${C.rst}`),
};

// ─── Helpers ──────────────────────────────────────────────────────
function findWorkflowFiles(): string[] {
  const results: string[] = [];
  try {
    const { readdirSync } = require('node:fs');
    const entries = readdirSync(WORKFLOWS_DIR, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) continue;
      if (e.name.endsWith('.yml') || e.name.endsWith('.yaml')) {
        results.push(resolve(WORKFLOWS_DIR, e.name));
      }
    }
  } catch {
    out.fail(`Directory not found: ${WORKFLOWS_DIR}`);
    process.exit(1);
  }
  return results.sort();
}

function readYaml(path: string): string {
  return readFileSync(path, 'utf8');
}

function writeYaml(path: string, content: string): void {
  writeFileSync(path, content, 'utf8');
}

function relativePath(fullPath: string): string {
  return relative(REPO_ROOT, fullPath);
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// ─── Scanners ────────────────────────────────────────────────────
function scanFile(path: string): { fix: boolean; manual?: string } {
  const text = readYaml(path);
  let fix = false;
  let manual: string | undefined;

  // Fix 1: branches in single-line array
  if (/branches:\s*\[[^\]]+,/.test(text)) fix = true;

  // Fix 2: has needs: but no if: always()
  if (/^[ \t]+needs:/m.test(text) && !/^[ \t]+if:\s+always\(\)/m.test(text)) fix = true;

  // Fix 3: setup-node without cache
  if (/actions\/setup-node@/.test(text) && !/cache:/.test(text)) fix = true;

  // Manual A: missing `with:` before node-version
  if (/actions\/setup-node@[^\n]+\n[ \t]+node-version:(?!\s*$)/m.test(text) &&
      !/actions\/setup-node@[^\n]+\n[ \t]+with:/.test(text)) {
    manual = 'indent';
  }

  // Manual B: markdown patterns
  if (/^[ \t]*## |^[ \t]*- \[|^[ \t]*\*\*/m.test(text)) {
    manual = 'markdown';
  }

  // Manual C: incomplete workflow
  if (!/^on:|^jobs:/m.test(text)) {
    manual = 'incomplete';
  }

  return { fix, manual };
}

// ─── Fix Transformers ────────────────────────────────────────────
function applyBranchesFormat(text: string): string {
  // branches: [a, b, c] → multi-line
  return text.replace(
    /(branches:\s*\[)([^]]+)(\])/g,
    (_, prefix, items, suffix) =>
      `${prefix}\n      ${items.split(',').map(s => s.trim()).join(',\n      ')}\n    ${suffix}`
  );
}

function applyAlways(text: string): string {
  // Add if: always() after lines with needs:
  const lines = text.split('\n');
  const outLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    outLines.push(lines[i]);
    if (/^[ \t]+needs:/.test(lines[i]) &&
        !lines.some(l => /^[ \t]+if:\s+always\(\)/.test(l))) {
      const indent = lines[i].match(/^([ \t]+)/)?.[1] || '      ';
      outLines.push(`${indent}if: always()`);
    }
  }
  return outLines.join('\n');
}

function applyCache(text: string): string {
  // Add cache: "npm" under setup-node with: block
  if (!/actions\/setup-node@/.test(text)) return text;
  if (/cache:/.test(text)) return text;

  const lines = text.split('\n');
  let inSetupNode = false;
  let withFound = false;

  for (let i = 0; i < lines.length; i++) {
    if (/uses: actions\/setup-node@/.test(lines[i])) inSetupNode = true;
    if (inSetupNode && /^[ \t]+with:/.test(lines[i])) withFound = true;
    if (inSetupNode && withFound && /node-version:/.test(lines[i]) && i + 1 < lines.length) {
      const indent = lines[i].match(/^([ \t]+)/)?.[1] || '        ';
      lines.splice(i + 1, 0, `${indent}cache: "npm"`);
      break;
    }
  }
  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────
function main() {
  out.title(`🔍 CI Fix Scanner v${VERSION}`);
  out.info(`Repo: ${REPO_ROOT}`);
  out.info(`Workflows: ${WORKFLOWS_DIR}`);
  out.info(`Mode: ${C.bold}${DRY_RUN ? 'DRY-RUN' : 'WRITE'}${C.rst}`);

  const files = findWorkflowFiles();
  out.info(`Scanning ${files.length} workflow files...`);

  const result: ScanResult = {
    fixable: { branches: [], always: [], cache: [] },
    manual: { indent: [], markdown: [], incomplete: [] },
    allFiles: files,
  };

  // Classify each file
  for (const f of files) {
    const { fix, manual } = scanFile(f);
    if (fix) {
      const text = readYaml(f);
      if (/branches:\s*\[[^]]+,/.test(text)) result.fixable.branches.push(f);
      if (/^[ \t]+needs:/m.test(text) && !/^[ \t]+if:\s+always\(\)/m.test(text)) result.fixable.always.push(f);
      if (/actions\/setup-node@/.test(text) && !/cache:/.test(text)) result.fixable.cache.push(f);
    }
    if (manual) {
      result.manual[manual as keyof ManualGroup].push(f);
    }
  }

  // ─── Summary ────────────────────────────────────────────────────
  const uniqA = unique([...result.fixable.branches, ...result.fixable.always, ...result.fixable.cache]);
  const uniqB = unique([...result.manual.indent, ...result.manual.markdown, ...result.manual.incomplete]);

  out.title('📋 Results');
  console.log(`\n${C.bold}✅ Group A — Fixable Automatically (${uniqA.length} files)${C.rst}`);
  console.log(`  Branches format:   ${result.fixable.branches.length}`);
  console.log(`  Add if: always():  ${result.fixable.always.length}`);
  console.log(`  Add npm cache:     ${result.fixable.cache.length}`);
  if (DRY_RUN) console.log(`  ${C.dim}Re-run with --write to apply${C.rst}`);

  console.log(`\n${C.bold}⚠️ Group B — Manual Fix Required (${uniqB.length} files)${C.rst}`);
  console.log(`  Missing 'with:' block: ${result.manual.indent.length}`);
  console.log(`  Markdown in YAML:      ${result.manual.markdown.length}`);
  console.log(`  Incomplete workflow:   ${result.manual.incomplete.length}`);
  console.log(`  ${C.dim}These will NOT be modified — fix manually${C.rst}`);

  // ─── Apply ─────────────────────────────────────────────────────
  if (!DRY_RUN && uniqA.length > 0) {
    out.title('✍️ Applying Group A fixes...');
    for (const f of uniqA) {
      let text = readYaml(f);
      const original = text;
      text = applyBranchesFormat(text);
      text = applyAlways(text);
      text = applyCache(text);
      if (text !== original) {
        writeYaml(f, text);
        out.ok(`Updated: ${relativePath(f)}`);
      }
    }
    out.ok('All Group A fixes applied!');
  }

  // ─── Group B Detail ─────────────────────────────────────────────
  if (uniqB.length > 0) {
    out.title('📝 Files Needing Manual Fix');
    if (result.manual.indent.length) {
      console.log(`\n${C.bold}Missing 'with:' before node-version:${C.rst}`);
      result.manual.indent.forEach(f => console.log(`  - ${relativePath(f)}`));
    }
    if (result.manual.markdown.length) {
      console.log(`\n${C.bold}Markdown content inside YAML:${C.rst}`);
      result.manual.markdown.forEach(f => console.log(`  - ${relativePath(f)}`));
    }
    if (result.manual.incomplete.length) {
      console.log(`\n${C.bold}Incomplete workflow:${C.rst}`);
      result.manual.incomplete.forEach(f => console.log(`  - ${relativePath(f)}`));
    }
  }

  // ─── Done ──────────────────────────────────────────────────────
  console.log(`\n${C.bold}───────────────────────────────────────${C.rst}`);
  if (DRY_RUN) {
    out.ok(`Dry-run complete — ${uniqA.length} fixable, ${uniqB.length} need manual`);
    out.info('Re-run with: npx tsx scripts/apply-ci-fixes.ts --write');
  } else {
    out.ok('Done — Group A applied, Group B listed above');
    out.info('Next: git diff --stat && git commit -m "🔧 CI: auto-fix workflows"');
  }
}

main();
 
 
 
 
📦 ติดตั้ง & ใช้งาน
 
1. ติดตั้ง tsx (รัน TypeScript ได้เลย ไม่ต้องคอมไพล์)
 
bash  
npm install -g tsx
# หรือในโปรเจกต์
npm add -D tsx
 
 
2. สิทธิ์รัน
 
bash  
chmod +x scripts/apply-ci-fixes.ts
 
 
3. Dry-Run (ปลอดภัยก่อนเสมอ)
 
bash  
npx tsx scripts/apply-ci-fixes.ts
 
 
4. เขียนจริง
 
bash  
npx tsx scripts/apply-ci-fixes.ts --write
 
 
5. ตรวจสอบ & คอมมิต
 
bash  
git diff --stat
git add .
git commit -m "🔧 CI: auto-fix workflows — branches, if:always, npm cache"
git push origin main
 
 
 
 
✅ ข้อดีของเวอร์ชัน TypeScript
 
- ✅ ประเภทชัดเจน — ป้องกันข้อผิดพลาดก่อนรัน
- ✅ ใช้ regex ปรับแต่งได้แม่นยำกว่า  sed 
- ✅ ไม่ขึ้นกับ shell/ระบบปฏิบัติการ — ทำงานเหมือนกันทุกเครื่อง
- ✅ โครงสร้างแยกส่วน — อ่านง่าย ขยายง่าย
- ✅ รองรับ Bun/Node 20+/22+
- ✅ ปรับแก้ logic ได้ง่ายกว่า bash
 
ต้องการปรับแต่งกฎตรวจสอบหรือรูปแบบการแก้ไขเพิ่มเติมไหมครับ? 🔧🙏🚀