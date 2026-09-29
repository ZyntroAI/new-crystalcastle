/**
 * ======================================================
 *  ZyntroAI — Workflow Validation & Repair Toolkit
 *  File: ZyntroAI.main.js
 *  Version: 1.0.0
 *  Repo: fastapi-python-boilerplate
 *  Purpose: Detect + Fix invalid SHA references in CI workflows
 * ======================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── การตั้งค่าหลัก ──────────────────────────────────
const CONFIG = {
  workflowsDir: path.join(process.cwd(), '.github', 'workflows'),
  hashPattern: /@[a-f0-9]{40}/g,
  allowedPatterns: [/@v\d+(\.\d+)?/, /@main/, /@develop/, /@master/],
  
  // แผนที่: SHA ที่พบบ่อย → เวอร์ชันที่ถูกต้อง
  knownMappings: {
    '11bd71901bbe5b1630ceea73d2759713672a68dd': 'v4',
    'a5ac148e6479544ca89de60d049c92e925615ec7': 'v4',
    '0a5c61591373683505ea898fbcb3aa2a9029e7d6': 'v5',
    '65462800fd760344b1a7b4382951275a0abb48e1': 'v4',
  },

  // ค่าเริ่มต้นแยกตามชื่อ Action
  actionDefaults: {
    'actions/checkout': 'v4',
    'actions/setup-python': 'v5',
    'actions/upload-artifact': 'v4',
    'actions/download-artifact': 'v4',
    'actions/cache': 'v4',
    'actions/setup-node': 'v4',
  },
};

// ─── ส่วนช่วยจัดการ ──────────────────────────────────
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  ok: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  err: (msg) => console.log(`❌ ${msg}`),
  title: (msg) => console.log(`\n🔹 ${msg}`),
};

// ─── ตรวจสอบว่ามีโฟลเดอร์ Workflows ──────────────────
function ensureWorkflowsDir() {
  if (!fs.existsSync(CONFIG.workflowsDir)) {
    log.warn('ไม่พบโฟลเดอร์ .github/workflows/ — ข้ามการทำงาน');
    return false;
  }
  return true;
}

// ─── 1. ตรวจจับปัญหา ─────────────────────────────────
function validate() {
  log.title('ตรวจสอบความถูกต้อง');
  
  if (!ensureWorkflowsDir()) return { hasErrors: false, files: [] };

  const files = fs.readdirSync(CONFIG.workflowsDir)
    .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  
  const issues = [];

  for (const file of files) {
    const filePath = path.join(CONFIG.workflowsDir, file);
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');

    lines.forEach((line, idx) => {
      const matches = line.match(CONFIG.hashPattern);
      if (!matches) return;

      const isAllowed = CONFIG.allowedPatterns.some(p => p.test(line));
      if (!isAllowed) {
        issues.push({
          file,
          line: idx + 1,
          content: line.trim(),
        });
      }
    });
  }

  if (issues.length === 0) {
    log.ok('ทุกไฟล์ใช้เวอร์ชันที่ถูกต้อง — ไม่พบปัญหา');
    return { hasErrors: false, issues };
  }

  log.err(`พบ ${issues.length} ปัญหา:`);
  issues.forEach(iss => {
    log.err(`  → ${iss.file}:${iss.line} — ${iss.content}`);
  });

  return { hasErrors: true, issues };
}

// ─── 2. แก้ไขอัตโนมัติ ────────────────────────────────
function fix() {
  log.title('แก้ไขเป็นเวอร์ชัน @vX');
  
  if (!ensureWorkflowsDir()) return { changed: 0 };

  const files = fs.readdirSync(CONFIG.workflowsDir)
    .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  
  let changedCount = 0;

  for (const file of files) {
    const filePath = path.join(CONFIG.workflowsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // แก้ตาม SHA ที่รู้จักก่อน
    for (const [hash, ver] of Object.entries(CONFIG.knownMappings)) {
      content = content.replace(new RegExp(`@${hash}`, 'g'), `@${ver}`);
    }

    // แก้แบบทั่วไป: actions/xxx@hash → actions/xxx@vX
    for (const [action, ver] of Object.entries(CONFIG.actionDefaults)) {
      content = content.replace(
        new RegExp(`${action}@[a-f0-9]{40}`, 'g'),
        `${action}@${ver}`
      );
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      log.ok(`แก้ไข: ${file}`);
      changedCount++;
    }
  }

  if (changedCount === 0) {
    log.ok('ไม่มีอะไรต้องแก้ไข — ทุกอย่างถูกต้องแล้ว');
  } else {
    log.info(`เสร็จสิ้น! แก้ไข ${changedCount} ไฟล์`);
  }

  return { changed: changedCount };
}

// ─── 3. ตรวจสอบผ่าน API ว่ามีจริงไหม ──────────────────
async function checkExists(repo, ref) {
  return new Promise((resolve) => {
    const req = https.get(
      {
        hostname: 'api.github.com',
        path: `/repos/${repo}/commits/${ref}`,
        headers: { 'User-Agent': 'ZyntroAI-Workflow-Checker' },
        timeout: 5000,
      },
      (res) => resolve({ repo, ref, exists: res.statusCode === 200, status: res.statusCode })
    );
    req.on('error', () => resolve({ repo, ref, exists: null, status: 'error' }));
  });
}

async function verify() {
  log.title('ยืนยันผ่าน GitHub API');
  
  const checks = Object.entries(CONFIG.knownMappings).map(([hash, ver]) => ({
    repo: hash.length === 40 ? 'actions/checkout' : 'unknown',
    ref: hash,
    ver,
  }));

  // ปรับให้ตรงกับชื่อจริง
  const realChecks = [
    { repo: 'actions/checkout', ref: '11bd71901bbe5b1630ceea73d2759713672a68dd' },
    { repo: 'actions/setup-python', ref: '0a5c61591373683505ea898fbcb3aa2a9029e7d6' },
    { repo: 'actions/upload-artifact', ref: '65462800fd760344b1a7b4382951275a0abb48e1' },
  ];

  const results = await Promise.all(realChecks.map(c => checkExists(c.repo, c.ref)));
  
  let allValid = true;
  for (const r of results) {
    if (r.exists === true) {
      log.ok(`${r.repo}@${r.ref.slice(0, 7)}… — มีอยู่จริง`);
    } else if (r.exists === false) {
      log.err(`${r.repo}@${r.ref.slice(0, 7)}… — ❌ ไม่พบ! (404)`);
      allValid = false;
    } else {
      log.warn(`${r.repo}@${r.ref.slice(0, 7)}… — ตรวจสอบไม่ได้`);
    }
  }

  if (!allValid) {
    log.warn('พบ SHA ที่ไม่มีอยู่จริง — จะทำให้ CI ล้ม!');
    log.info('รัน: node ZyntroAI.main.js fix เพื่อแก้ไขทันที');
  } else {
    log.ok('ทุกรายการถูกต้อง ✅');
  }

  return { allValid, results };
}

// ─── เมนูหลัก ────────────────────────────────────────
async function main() {
  const [command] = process.argv.slice(2);

  console.log('');
  console.log('🏗️  ZyntroAI — Workflow Toolkit v1.0.0');
  console.log('========================================');

  switch (command) {
    case 'validate':
    case 'check':
      validate();
      break;

    case 'fix':
      fix();
      break;

    case 'verify':
      await verify();
      break;

    case 'all':
      validate();
      console.log('');
      fix();
      console.log('');
      await verify();
      break;

    default:
      console.log(`
📖 การใช้งาน:
  node ZyntroAI.main.js validate   → ตรวจหาปัญหา
  node ZyntroAI.main.js fix        → แก้ไขอัตโนมัติ
  node ZyntroAI.main.js verify     → ตรวจสอบผ่าน API
  node ZyntroAI.main.js all        → ทำทุกขั้นตอน

💡 แนะนำก่อนส่งโค้ด:
  1. node ZyntroAI.main.js validate
  2. ถ้าพบปัญหา → node ZyntroAI.main.js fix
  3. ตรวจสอบอีกครั้ง → node ZyntroAI.main.js validate
      `);
      break;
  }

  console.log('');
}

// เริ่มทำงาน
if (require.main === module) {
  main().catch(err => {
    console.error('💥 เกิดข้อผิดพลาด:', err);
    process.exit(1);
  });
}

module.exports = { validate, fix, verify, CONFIG };
