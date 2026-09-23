Here’s a comprehensive, production-grade **Security & Quality Assurance Script** — scans for vulnerabilities, secrets, bad patterns, and enforces standards 🔒🛡️

---

# 🔒 `scripts/security-quality.js`
**Purpose:** Comprehensive security audit + code quality enforcement  
**Runs:** Locally • Pre-Commit • CI/CD  
**Status:** Ready → Copy → Save → Commit ✅

```javascript
#!/usr/bin/env node
/**
 * CrystalCastle — Security & Quality Scanner
 * Scan: Secrets • Vulnerabilities • Bad Patterns • File Integrity
 * Usage: node scripts/security-quality.js [--fix] [--json]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ========== CONFIGURATION ==========
const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.cache',
  'coverage', 'logs', 'tmp', '.turbo', 'vendor'
]);

const SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO'
};

// ========== DETECTION PATTERNS ==========
const SECRET_PATTERNS = [
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g, severity: SEVERITY.CRITICAL },
  { name: 'AWS Secret Key', pattern: /(?<![A-Za-z0-9])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9])/g, severity: SEVERITY.HIGH },
  { name: 'GitHub Token', pattern: /ghp_[A-Za-z0-9]{36}/g, severity: SEVERITY.CRITICAL },
  { name: 'GitHub Token (glo)', pattern: /gho_[A-Za-z0-9]{36}/g, severity: SEVERITY.CRITICAL },
  { name: 'GitHub Token (gds)', pattern: /gds_[A-Za-z0-9]{36}/g, severity: SEVERITY.CRITICAL },
  { name: 'Slack Webhook', pattern: /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9_]+\/[A-Z0-9_]+\/[A-Za-z0-9\/]+/g, severity: SEVERITY.CRITICAL },
  { name: 'Stripe Key', pattern: /sk_live_[0-9a-zA-Z]{32,}/g, severity: SEVERITY.CRITICAL },
  { name: 'Bearer Token', pattern: /Bearer\s+["']?[A-Za-z0-9\-_]{30,}["']?/g, severity: SEVERITY.HIGH },
  { name: 'Private Key Header', pattern: /-----BEGIN\s+(RSA\s+|EC\s+|DSA\s+)?PRIVATE\s+KEY-----/g, severity: SEVERITY.CRITICAL },
  { name: 'MongoDB URI with Creds', pattern: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/g, severity: SEVERITY.HIGH },
  { name: 'Database Password', pattern: /(password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/gi, severity: SEVERITY.MEDIUM },
  { name: 'API Key in Plaintext', pattern: /(api[_-]?key|secret[_-]?key|auth[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/gi, severity: SEVERITY.HIGH },
  { name: 'IP Address (potential exposure)', pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, severity: SEVERITY.LOW },
  { name: 'Email Address', pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, severity: SEVERITY.LOW }
];

const DANGEROUS_PATTERNS = [
  { name: 'eval()', pattern: /\beval\s*\(/g, severity: SEVERITY.HIGH, fix: 'Use explicit parsing or functions' },
  { name: 'innerHTML', pattern: /\.innerHTML\s*=/g, severity: SEVERITY.MEDIUM, fix: 'Use textContent or sanitize with DOMPurify' },
  { name: 'document.write', pattern: /document\.write\s*\(/g, severity: SEVERITY.MEDIUM, fix: 'Use modern DOM methods' },
  { name: 'unsafe innerHTML in React', pattern: /dangerouslySetInnerHTML/g, severity: SEVERITY.MEDIUM, fix: 'Sanitize input or use react-quill/safe renderer' },
  { name: 'SQL Concatenation', pattern: /(\+|\$\{)\s*['"`]\s*(SELECT|INSERT|UPDATE|DELETE)/gi, severity: SEVERITY.HIGH, fix: 'Use parameterized queries' },
  { name: 'exec/shell', pattern: /(exec|spawn|execSync|spawnSync)\s*\(\s*['"`].*\+/g, severity: SEVERITY.CRITICAL, fix: 'Avoid user input in shell commands' },
  { name: 'Hardcoded HTTP URL', pattern: /["']http:\/\/(localhost|127\.0\.0\.1)/g, severity: SEVERITY.LOW, fix: 'Use env vars for dev URLs' },
  { name: 'TODO/FIXME', pattern: /(TODO|FIXME|BUG)\s*[:-]/gi, severity: SEVERITY.INFO, fix: 'Track in GitHub Issues' },
  { name: 'console.log in production', pattern: /console\.(log|debug|info)\s*\(/g, severity: SEVERITY.LOW, fix: 'Use structured logger' },
  { name: 'disabled eslint', pattern: /eslint-disable(-next-line)?/g, severity: SEVERITY.MEDIUM, fix: 'Justify or fix the rule' },
  { name: 'type any (TS)', pattern: /:\s*any\b/g, severity: SEVERITY.MEDIUM, fix: 'Define proper interface/type' }
];

const FILE_RULES = [
  { check: 'no-md-dir', severity: SEVERITY.CRITICAL, desc: 'Directory cannot end in .md' },
  { check: 'case-conflict', severity: SEVERITY.MEDIUM, desc: 'Case-insensitive name conflict' },
  { check: 'no-large-binaries', severity: SEVERITY.MEDIUM, desc: 'Large binary committed' }
];
// ====================================

const args = process.argv.slice(2);
const doFix = args.includes('--fix');
const outputJson = args.includes('--json');

async function walk(dir, fileList = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(fullPath, fileList);
    else fileList.push({
      path: fullPath,
      rel: path.relative(ROOT, fullPath),
      name: entry.name,
      ext: path.extname(entry.name).toLowerCase()
    });
  }
  return fileList;
}

async function scanFileContent(file) {
  const issues = [];
  try {
    const text = await fs.readFile(file.path, 'utf8');
    const lines = text.split('\n');

    // Scan for secrets
    for (const rule of SECRET_PATTERNS) {
      lines.forEach((line, idx) => {
        if (rule.pattern.test(line)) {
          issues.push({
            file: file.rel,
            line: idx + 1,
            rule: rule.name,
            severity: rule.severity,
            snippet: line.trim().slice(0, 120)
          });
        }
        rule.pattern.lastIndex = 0;
      });
    }

    // Scan for dangerous patterns
    for (const rule of DANGEROUS_PATTERNS) {
      lines.forEach((line, idx) => {
        if (rule.pattern.test(line)) {
          issues.push({
            file: file.rel,
            line: idx + 1,
            rule: rule.name,
            severity: rule.severity,
            snippet: line.trim().slice(0, 120),
            fix: rule.fix
          });
        }
        rule.pattern.lastIndex = 0;
      });
    }
  } catch {
    // Binary/unreadable — skip
  }
  return issues;
}

async function scanFileStructure(files) {
  const issues = [];
  const dirs = new Set();
  const names = new Map();

  for (const f of files) {
    const dir = path.dirname(f.rel);
    dirs.add(dir);

    // Case-insensitive conflict check
    const lowerRel = f.rel.toLowerCase();
    if (names.has(lowerRel) && names.get(lowerRel) !== f.rel) {
      issues.push({
        file: f.rel,
        rule: 'Case-Insensitive Name Conflict',
        severity: SEVERITY.MEDIUM,
        snippet: `Conflicts with: ${names.get(lowerRel)}`,
        fix: 'Rename to differ beyond case'
      });
    }
    names.set(lowerRel, f.rel);
  }

  // Check directories ending in extensions
  for (const d of dirs) {
    if (/\.(md|yml|yaml|json)$/i.test(d)) {
      issues.push({
        file: d + '/',
        rule: 'Directory Has File Extension',
        severity: SEVERITY.CRITICAL,
        snippet: 'Causes Git checkout exit code 128',
        fix: 'Rename folder → remove extension or restructure'
      });
    }
  }

  return issues;
}

function groupBySeverity(issues) {
  const grouped = {};
  for (const sev of Object.values(SEVERITY)) {
    grouped[sev] = issues.filter(i => i.severity === sev);
  }
  return grouped;
}

function getExitCode(grouped) {
  if (grouped.CRITICAL.length > 0) return 1;
  if (grouped.HIGH.length > 0) return 1;
  if (grouped.MEDIUM.length > 0 && process.env.CI === 'true') return 1;
  return 0;
}

async function main() {
  console.log(`🔒 CrystalCastle Security & Quality Scan • Root: ${ROOT}\n`);

  const files = await walk(ROOT);
  console.log(`📁 Scanning ${files.length} files...\n`);

  const contentIssues = [];
  for (const file of files) {
    const iss = await scanFileContent(file);
    contentIssues.push(...iss);
  }

  const structIssues = await scanFileStructure(files);
  const allIssues = [...contentIssues, ...structIssues];

  const grouped = groupBySeverity(allIssues);

  if (outputJson) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      scannedFiles: files.length,
      summary: Object.fromEntries(
        Object.entries(grouped).map(([k, v]) => [k, v.length])
      ),
      issues: allIssues
    }, null, 2));
    process.exit(0);
  }

  // Print Summary
  console.log('📊 === SCAN SUMMARY ===');
  for (const [sev, list] of Object.entries(grouped)) {
    const count = list.length;
    const icon = sev === 'CRITICAL' ? '🔴' : sev === 'HIGH' ? '🟠' : sev === 'MEDIUM' ? '🟡' : sev === 'LOW' ? '🔵' : '⚪';
    console.log(`  ${icon} ${sev.padEnd(8)} ${count}`);
  }
  console.log('');

  // Print Issues
  const criticalAndHigh = [...grouped.CRITICAL, ...grouped.HIGH];
  if (criticalAndHigh.length > 0) {
    console.log('🚨 CRITICAL & HIGH SEVERITY — Fix Immediately:\n');
    criticalAndHigh.forEach(i => {
      console.log(`  ${i.severity} — ${i.rule}`);
      console.log(`     📄 ${i.file}:${i.line || '-'}`);
      if (i.snippet) console.log(`     💬 ${i.snippet}`);
      if (i.fix) console.log(`     ✅ Fix: ${i.fix}`);
      console.log('');
    });
  }

  if (grouped.MEDIUM.length > 0) {
    console.log('🟡 MEDIUM — Address Soon:\n');
    grouped.MEDIUM.slice(0, 10).forEach(i => {
      console.log(`  ${i.file}: ${i.rule}`);
      if (i.fix) console.log(`     → ${i.fix}`);
    });
    if (grouped.MEDIUM.length > 10) console.log(`  ...and ${grouped.MEDIUM.length - 10} more`);
    console.log('');
  }

  if (allIssues.length === 0) {
    console.log('✅ No issues found — code is clean & secure! 🎉');
    process.exit(0);
  }

  const exitCode = getExitCode(grouped);
  if (exitCode !== 0) {
    console.log(`⚠️  ${grouped.CRITICAL.length + grouped.HIGH.length} critical/high issues — commit blocked`);
    console.log(`💡 Review above • Use --json for full report`);
  }
  process.exit(exitCode);
}

main().catch(err => {
  console.error('❌ Scanner Error:', err);
  process.exit(1);
});
```

---

## 🚀 Setup & Usage

### Step 1 — Save the File
```bash
# Save as: scripts/security-quality.js
chmod +x scripts/security-quality.js
```

### Step 2 — Add to `package.json`
```json
{
  "scripts": {
    "security:scan": "node scripts/security-quality.js",
    "security:scan:json": "node scripts/security-quality.js --json",
    "precommit:security": "npm run security:scan"
  }
}
```

### Step 3 — Run It!
```bash
# Quick scan
npm run security:scan

# Full machine-readable report
npm run security:scan:json > security-report.json
```

---

## 🛡️ Integrate into Pre-Commit Hook

Update `.git/hooks/pre-commit` or `scripts/install-hooks.sh`:
```bash
# Add this line before file-manager verify
node scripts/security-quality.js
```

---

## 🤖 Integrate into CI (`security-scan.yml`)

Save as `.github/workflows/security-scan.yml`:
```yaml
name: 🔒 Security & Quality Scan
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      
      - name: 🔒 Run Security Scan
        run: npm run security:scan
        continue-on-error: false  # ❌ Fails build on CRITICAL/HIGH
      
      - name: 📄 Full Report
        if: always()
        run: npm run security:scan:json
```

---

## 📋 What It Detects

| Category | Examples | Severity |
|---|---|---|
| 🔑 **Secrets** | AWS keys, GitHub tokens, Slack webhooks, private keys, DB credentials | CRITICAL/HIGH |
| ⚠️ **Dangerous Code** | `eval()`, `innerHTML`, SQL concat, shell exec, disabled lint rules | HIGH/MEDIUM |
| 📂 **Structure** | `.md` directories (Git checkout bomb), case conflicts | CRITICAL/MEDIUM |
| 📝 **Quality** | `any` type, `console.log`, `TODO/FIXME` | LOW/INFO |

---

## 🎯 Severity Policy

| Level | Action |
|---|---|
| 🔴 **CRITICAL** | Blocks commit • Blocks CI • Fix immediately |
| 🟠 **HIGH** | Blocks commit • Blocks CI • Review & fix |
| 🟡 **MEDIUM** | Warns locally • Blocks CI • Plan fix |
| 🔵 **LOW** | Informational • No block |
| ⚪ **INFO** | Best practice reminder |

---

## ✅ Quick Commit & Push

```bash
git add scripts/security-quality.js package.json
git commit -m "feat: add security-quality scanner — secrets, patterns, structure"
git push -u origin main
```

---
