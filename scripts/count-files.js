#!/usr/bin/env node
/**
 * CrystalCastle — File Counter
 * Counts files by type, folder, and extension
 * Run: node scripts/count-files.js [--detail] [--json]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Folders to skip
const IGNORE = new Set([
  'node_modules', '.git', 'dist', 'build',
  '.cache', 'coverage', 'logs', 'tmp', '.turbo'
]);

// Extensions to group
const EXT_GROUPS = {
  'Code (.js/.ts/.jsx/.tsx)': ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs'],
  'Markdown & Docs': ['.md', '.mdx'],
  'Styles': ['.css', '.scss', '.sass', '.less'],
  'Config': ['.json', '.yml', '.yaml', '.toml', '.config.js'],
  'HTML': ['.html', '.htm'],
  'Images': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif'],
  'Scripts': ['.sh', '.bash', '.zsh'],
};

async function walkDir(dir, results = { folders: {}, exts: {}, total: 0 }) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (IGNORE.has(entry.name)) continue;
      results.folders[fullPath] = (results.folders[fullPath] || 0) + 1;
      await walkDir(fullPath, results);
    } else {
      results.total++;
      const ext = path.extname(entry.name).toLowerCase() || '(no extension)';
      results.exts[ext] = (results.exts[ext] || 0) + 1;
      
      // Count per immediate folder
      const relDir = path.relative(ROOT, dir);
      results.folders[relDir || '.'] = (results.folders[relDir || '.'] || 0) + 1;
    }
  }
  return results;
}

function groupExtensions(exts) {
  const grouped = {};
  const counted = new Set();

  for (const [group, extsList] of Object.entries(EXT_GROUPS)) {
    let sum = 0;
    for (const e of extsList) {
      if (exts[e]) {
        sum += exts[e];
        counted.add(e);
      }
    }
    if (sum > 0) grouped[group] = sum;
  }

  // Remaining as "Other"
  let other = 0;
  for (const [ext, count] of Object.entries(exts)) {
    if (!counted.has(ext)) other += count;
  }
  if (other > 0) grouped['Other'] = other;

  return grouped;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

async function main() {
  const args = process.argv.slice(2);
  const showDetail = args.includes('--detail') || args.includes('-d');
  const outputJson = args.includes('--json');

  console.log(`🔍 Scanning: ${ROOT}\n`);

  const results = await walkDir(ROOT);
  const grouped = groupExtensions(results.exts);

  if (outputJson) {
    console.log(JSON.stringify({
      scanned: ROOT,
      totalFiles: results.total,
      byExtension: results.exts,
      byGroup: grouped,
      byFolder: Object.fromEntries(
        Object.entries(results.folders).sort((a, b) => b[1] - a[1])
      )
    }, null, 2));
    return;
  }

  // Summary
  console.log('📊 === FILE COUNT SUMMARY ===');
  console.log(`📁 Total files: ${results.total}`);
  console.log(`📂 Folders scanned: ${Object.keys(results.folders).length}\n`);

  console.log('📋 By Type:');
  for (const [label, count] of Object.entries(grouped).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / results.total) * 100).toFixed(1);
    console.log(`  ${label.padEnd(30)} ${String(count).padStart(5)}  (${pct}%)`);
  }

  if (showDetail) {
    console.log('\n📂 By Folder (top 15):');
    const sortedFolders = Object.entries(results.folders)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    
    for (const [folder, count] of sortedFolders) {
      console.log(`  ${folder.padEnd(35)} ${count}`);
    }

    console.log('\n🔤 All Extensions:');
    for (const [ext, count] of Object.entries(results.exts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${ext.padEnd(15)} ${count}`);
    }
  }

  console.log('\n✅ Done!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
