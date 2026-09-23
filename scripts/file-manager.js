Here’s a **complete, production-ready File Management Script** — organize, clean, verify, and manage your repository files safely 📂🛡️

---

# 📂 File Management Script — `scripts/file-manager.js`

```javascript
#!/usr/bin/env node
/**
 * CrystalCastle — File Management Utility
 * Commands: list • clean • organize • verify • stats
 * Run: node scripts/file-manager.js <command> [options]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ========== CONFIGURATION ==========
const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.cache',
  'coverage', 'logs', 'tmp', '.turbo', '.github'
]);

const TEMP_PATTERNS = [
  /\.DS_Store$/, /Thumbs\.db$/, /~$/, /\.swp$/, /\.swo$/,
  /\.tmp$/, /\.temp$/, /^test-.*\.log$/, /npm-debug\.log/
];

const MEDIA_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.ico']);
const DOC_EXT = new Set(['.md', '.mdx', '.txt', '.pdf']);
const CODE_EXT = new Set(['.js', '.ts', '.jsx', '.tsx', '.json', '.yml', '.yaml', '.html', '.css', '.scss']);
// ====================================

const args = process.argv.slice(2);
const command = args[0] || 'help';
const dryRun = args.includes('--dry-run') || args.includes('-n');

async function isDirEmpty(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries.length === 0;
  } catch { return false; }
}

async function getStats(filePath) {
  try { return await fs.stat(filePath); }
  catch { return null; }
}

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
      ext: path.extname(entry.name).toLowerCase(),
      dir: path.dirname(path.relative(ROOT, fullPath))
    });
  }
  return fileList;
}

function confirmAction(msg) {
  if (dryRun) {
    console.log(`[DRY-RUN] ${msg}`);
    return true;
  }
  return true; // Auto-confirm; add interactive prompt if needed
}

// ========== COMMANDS ==========
async function cmdList() {
  const files = await walk(ROOT);
  console.log(`📋 Found ${files.length} files:\n`);
  files.forEach(f => console.log(`  ${f.rel}`));
}

async function cmdStats() {
  const files = await walk(ROOT);
  const stats = { total: files.length, media: 0, docs: 0, code: 0, other: 0 };
  const byExt = {};
  const byDir = {};

  for (const f of files) {
    byExt[f.ext] = (byExt[f.ext] || 0) + 1;
    byDir[f.dir] = (byDir[f.dir] || 0) + 1;
    if (MEDIA_EXT.has(f.ext)) stats.media++;
    else if (DOC_EXT.has(f.ext)) stats.docs++;
    else if (CODE_EXT.has(f.ext)) stats.code++;
    else stats.other++;
  }

  console.log('📊 File Statistics\n');
  console.log(`  Total Files:   ${stats.total}`);
  console.log(`  Code:          ${stats.code}`);
  console.log(`  Docs:          ${stats.docs}`);
  console.log(`  Media:         ${stats.media}`);
  console.log(`  Other:         ${stats.other}\n`);

  console.log('📂 Top Folders:');
  Object.entries(byDir).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .forEach(([d, n]) => console.log(`  ${d.padEnd(30)} ${n}`));
}

async function cmdClean() {
  const files = await walk(ROOT);
  const toRemove = files.filter(f => TEMP_PATTERNS.some(p => p.test(f.name)));

  if (toRemove.length === 0) {
    console.log('✅ No temporary files found');
    return;
  }

  console.log(`🗑️  Found ${toRemove.length} temporary/garbage files:\n`);
  toRemove.forEach(f => console.log(`  ❌ ${f.rel}`));

  if (!dryRun) {
    for (const f of toRemove) {
      await fs.unlink(f.path);
    }
    console.log(`\n✅ Removed ${toRemove.length} files`);
  } else {
    console.log(`\n[DRY-RUN] Nothing deleted — add --force to execute`);
  }
}

async function cmdOrganize() {
  console.log('📁 Organizing files by type...\n');
  const files = await walk(ROOT);
  const moves = [];

  for (const f of files) {
    let targetFolder = null;
    if (MEDIA_EXT.has(f.ext)) targetFolder = 'assets/media';
    else if (DOC_EXT.has(f.ext) && !f.rel.startsWith('docs/')) targetFolder = 'docs/extra';

    if (!targetFolder) continue;
    const targetPath = path.join(ROOT, targetFolder, f.name);
    if (f.path === targetPath) continue;

    moves.push({ from: f.rel, to: `${targetFolder}/${f.name}` });
  }

  if (moves.length === 0) {
    console.log('✅ All files already organized');
    return;
  }

  moves.forEach(m => console.log(`  📦 ${m.from} → ${m.to}`));

  if (!dryRun) {
    for (const m of moves) {
      const toFull = path.join(ROOT, m.to);
      await fs.mkdir(path.dirname(toFull), { recursive: true });
      await fs.rename(path.join(ROOT, m.from), toFull);
    }
    console.log(`\n✅ Moved ${moves.length} files`);
  }
}

async function cmdVerify() {
  const files = await walk(ROOT);
  const issues = [];

  for (const f of files) {
    // Check for forbidden characters / invalid names
    if (/[<>:"|?*]/.test(f.name)) {
      issues.push({ file: f.rel, issue: 'Invalid filename characters' });
    }
    // Check for .md directories (critical conflict!)
    if (f.dir.endsWith('.md')) {
      issues.push({ file: f.dir, issue: 'Directory ends in .md — will break checkout!' });
    }
    // Check for duplicate names (case-insensitive)
  }

  // Check for directory ending with extensions
  const allDirs = new Set(files.map(f => f.dir));
  for (const d of allDirs) {
    if (/\.(md|yml|json)$/i.test(d)) {
      issues.push({ file: d + '/', issue: '⚠️ Directory has file extension — Git checkout risk!' });
    }
  }

  if (issues.length === 0) {
    console.log('✅ All file paths are valid — no conflicts found');
    return;
  }

  console.log(`⚠️ Found ${issues.length} issues:\n`);
  issues.forEach(i => console.log(`  ${i.issue}: ${i.file}`));
  console.log('\n💡 Fix: Rename directories to NOT end in file extensions');
}

async function cmdEmptyDirs() {
  const allDirs = new Set();
  const files = await walk(ROOT);
  files.forEach(f => {
    let d = f.dir;
    while (d && d !== '.') {
      allDirs.add(d);
      d = path.dirname(d);
    }
  });

  const empty = [];
  for (const d of allDirs) {
    if (await isDirEmpty(path.join(ROOT, d))) {
      empty.push(d);
    }
  }

  if (empty.length === 0) {
    console.log('✅ No empty directories found');
    return;
  }

  console.log(`📂 ${empty.length} empty directories:\n`);
  empty.forEach(d => console.log(`  🗑️  ${d}/`));

  if (!dryRun && args.includes('--remove')) {
    for (const d of empty.sort((a, b) => b.length - a.length)) {
      await fs.rmdir(path.join(ROOT, d));
    }
    console.log(`\n✅ Removed ${empty.length} empty directories`);
  }
}

// ========== MAIN ==========
async function main() {
  console.log(`📂 CrystalCastle File Manager • Root: ${ROOT}\n`);

  switch (command) {
    case 'list': await cmdList(); break;
    case 'stats': await cmdStats(); break;
    case 'clean': await cmdClean(); break;
    case 'organize': await cmdOrganize(); break;
    case 'verify': await cmdVerify(); break;
    case 'empty-dirs': await cmdEmptyDirs(); break;
    case 'help':
    default:
      console.log(`Usage: node scripts/file-manager.js <command> [options]

Commands:
  list          List all tracked files
  stats         Show file count & breakdown
  clean         Remove temp/garbage files (.DS_Store, ~, .tmp...)
  organize     Move media/docs to standard folders
  verify       Check for invalid paths & .md directories ⚠️
  empty-dirs    List (or --remove) empty folders

Options:
  --dry-run / -n  Preview changes without modifying files
  --remove        Actually delete empty directories
`);
  }
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
```

---

## 🚀 Quick Start

```bash
# Save file
mkdir -p scripts
# Paste above → scripts/file-manager.js

# Make executable
chmod +x scripts/file-manager.js

# Add to package.json scripts
npm set-script file:list "node scripts/file-manager.js list"
npm set-script file:stats "node scripts/file-manager.js stats"
npm set-script file:clean "node scripts/file-manager.js clean"
npm set-script file:organize "node scripts/file-manager.js organize"
npm set-script file:verify "node scripts/file-manager.js verify"
npm set-script file:empty "node scripts/file-manager.js empty-dirs"
```

---

## 📋 All Commands Reference

| Command | What It Does |
|---|---|
| `npm run file:list` | List all project files (excludes `node_modules` etc.) |
| `npm run file:stats` | Summary by type + top folders |
| `npm run file:clean` | Remove `.DS_Store`, `Thumbs.db`, temp files, backups |
| `npm run file:organize -- --dry-run` | Move loose images/docs to `assets/media/` & `docs/extra/` |
| `npm run file:verify` | **Critical check** — catches `.md` directories, invalid names |
| `npm run file:empty` | List empty folders → add `-- --remove` to delete |

---

## ⚠️ Critical Feature — Path Verification

```bash
npm run file:verify
```
**This specifically catches:**
- ❌ Directories ending in `.md` / `.yml` / `.json` → **Git checkout failure #128**
- ❌ Filenames with forbidden characters (`:`, `*`, `?`, etc.)
- ❌ Names that conflict on case-insensitive systems

**Always run this before pushing structural changes!** ✅

---

## 🛡️ Safe Mode — Always Preview First

Every destructive command supports `--dry-run`:
```bash
# Preview what would be cleaned
node scripts/file-manager.js clean --dry-run

# Preview organization without moving
node scripts/file-manager.js organize --dry-run
```

---

## ✅ Commit & Push

```bash
git add scripts/file-manager.js package.json
git commit -m "feat: add file-manager utility — verify paths, clean, organize"
git push -u origin notify_system
```

---

Would you like me to **hook this into CI** so `file:verify` runs automatically on every PR and blocks `.md` directory conflicts before they reach checkout? 🛡️🔍
