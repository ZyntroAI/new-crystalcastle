#!/usr/bin/env node
/**
 * how-to-debug-workflows.js
 * CrystalCastleX — GitHub Actions Workflow Debug Utility
 * Runs syntax, permission, version, and path checks on all workflow files
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const WORKFLOWS_DIR = join(REPO_ROOT, '.github', 'workflows');

const RECOMMEND_LATEST = {
  'actions/checkout': 'v5',
  'actions/setup-python': 'v5',
  'actions/setup-node': 'v4',
  'actions/upload-artifact': 'v5',
  'actions/download-artifact': 'v5',
};

const ISSUE_LEVEL = {
  ERROR: '🔴 ERROR',
  WARN: '🟡 WARN',
  INFO: '🔍 INFO',
  PASS: '✅ PASS',
};

let exitCode = 0;

function printIssue(level, file, message, suggestion = '') {
  const label = ISSUE_LEVEL[level];
  console.log(`${label} ${relative(REPO_ROOT, file)}: ${message}`);
  if (suggestion) console.log(`   └── ${suggestion}`);
  if (level === 'ERROR') exitCode = 1;
}

async function scanDir(dir, filter = () => true) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];
  for (const e of entries) {
    const fullPath = join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...(await scanDir(fullPath, filter)));
    } else if (filter(e.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function checkVersion(content, filePath) {
  for (const [action, latest] of Object.entries(RECOMMEND_LATEST)) {
    const regex = new RegExp(`uses:\\s*${action}/[^@]+@v(\\d+)`, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const major = parseInt(match[1], 10);
      const recommended = parseInt(latest.replace('v', ''), 10);
      if (major < recommended) {
        printIssue('WARN', filePath,
          `Outdated: ${action}@v${match[1]}`,
          `Upgrade to ${action}@${latest}`
        );
      }
    }
  }
}

function checkPermissions(content, filePath) {
  const hasWritePerm = /permissions:[\s\S]*contents:\s*write/.test(content);
  const pushesCode = /git\s+push|actions-token|pull-request.*write/i.test(content);
  if (pushesCode && !hasWritePerm) {
    printIssue('ERROR', filePath,
      'Pushes code but missing `permissions: contents: write`',
      'Add permissions block at job or workflow level'
    );
  }
}

function checkPaths(content, filePath) {
  const oldPatterns = [
    { re: /['"]docs\//g, suggest: "Use 'development/docs/' after folder restructure" },
    { re: /scripts\/update_readme\.py/g, suggest: "Verify path — may be 'development/scripts/update_readme.py'" },
    { re: /tests\//g, suggest: "Check — may be 'frontend/tests/' or 'backend/tests/'" },
  ];
  for (const { re, suggest } of oldPatterns) {
    if (re.test(content)) {
      printIssue('WARN', filePath, `Legacy path found: ${re.source}`, suggest);
    }
  }
}

function checkSyntax(content, filePath) {
  const missingClosing = (content.match(/```/g)?.length || 0) % 2 !== 0;
  if (missingClosing) {
    printIssue('WARN', filePath, 'Odd number of code fences — may have unclosed blocks');
  }
  if (/on:\s*\S/.test(content) && !/on:\s*(?:\n|\s*#)/.test(content.slice(0, 200))) {
    printIssue('WARN', filePath, '`on:` block may have malformed trigger syntax');
  }
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('🛠️  GitHub Actions Workflow Debug & Validation');
  console.log(`📂 Scanning: ${relative(REPO_ROOT, WORKFLOWS_DIR)}`);
  console.log('='.repeat(60));

  if (!(await fileExists(WORKFLOWS_DIR))) {
    printIssue('ERROR', REPO_ROOT, 'Workflow directory not found',
      `Expected: ${WORKFLOWS_DIR}`);
    process.exit(1);
  }

  const files = await scanDir(WORKFLOWS_DIR, name =>
    name.endsWith('.yml') || name.endsWith('.yaml')
  );

  if (files.length === 0) {
    console.log('⚠️ No .yml workflow files found');
    process.exit(0);
  }

  for (const filePath of files) {
    console.log(`\n📄 Checking: ${relative(REPO_ROOT, filePath)}`);
    const content = await readFile(filePath, 'utf8');
    checkVersion(content, filePath);
    checkPermissions(content, filePath);
    checkPaths(content, filePath);
    checkSyntax(content, filePath);
    console.log(`   ${ISSUE_LEVEL.PASS} File scanned`);
  }

  console.log('\n' + '='.repeat(60));
  if (exitCode === 0) {
    console.log('✅ All checks passed — no critical issues found');
  } else {
    console.log('🔴 Issues detected — review above');
  }
  console.log('='.repeat(60));
  process.exit(exitCode);
}

main().catch(err => {
  console.error('💥 Script error:', err);
  process.exit(1);
});
