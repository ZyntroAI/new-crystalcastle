# 🛠️ How to Debug and Fix Failing GitHub Actions Workflows

**Last Updated:** 2026-09-23  
**Audience:** Developers, Maintainers, DevOps  
**Scope:** `crystalcastleX` repo — all CI/CD workflows

---

## 📑 Table of Contents

1. [Introduction](#1-introduction)
2. [Where to See Failures](#2-where-to-see-failures)
3. [Common Errors & Fixes](#3-common-errors--fixes)
4. [Step-by-Step Debug Process](#4-step-by-step-debug-process)
5. [Advanced Troubleshooting](#5-advanced-troubleshooting)
6. [Prevention & Best Practices](#6-prevention--best-practices)
7. [Reference Cheat Sheet](#7-reference-cheat-sheet)

---

## 1. Introduction

This guide helps you diagnose and repair broken GitHub Actions runs — from simple typos to permission issues, path conflicts, and version mismatches. Most failures can be fixed in **under 15 minutes** once you recognize the pattern.

---

## 2. Where to See Failures

### 2.1 Find Failed Runs

1. Go to your repo → **Actions** tab
2. Look for runs marked ❌ **red**
3. Click the failed run → see which **job** failed
4. Expand the failed **step** to view logs

### 2.2 Key Log Areas

- **Annotations** (top of page) → quick summary of errors
- **Step exit code** → `0` = success, non-zero = failure
- **Full log download** → click the ⬇️ icon for complete text

---

## 3. Common Errors & Fixes

### 3.1 `git failed with exit code 128` — Push / Permission Denied

**What it means:** The workflow cannot push code back to the repo.
**Causes:**

- Missing `permissions: contents: write`
- Shallow clone prevents push
- Token has expired or is insufficient

**Fix:**

```yaml
permissions:
  contents: write  # ✅ Required for git push

steps:
  - uses: actions/checkout@v5
    with:
      fetch-depth: 0  # Full history
      token: ${{ secrets.GITHUB_TOKEN }}
```

**Commit logic pattern:**

```bash
git add .
if git diff --staged --quiet; then
  echo "✅ No changes — skipping commit"
  exit 0
fi
git commit -m "chore: update"
git push origin main
```

---

### 3.2 `cannot create directory at '...'` — File vs Folder Conflict

**What it means:** A **file** exists where the workflow needs to create a **directory** with the same name. Common with `docs/knowledge`.

**Diagnosis:**

```bash
ls -la docs/
# If you see "-" instead of "d" before "knowledge" → it's a file
```

**Fix — One-time local:**

```bash
# Rename the conflicting file
mv docs/knowledge docs/knowledge.md
mkdir -p docs/knowledge
git add docs/
git commit -m "fix: resolve file-dir name conflict"
git push
```

**Fix — Add to workflow:**

```yaml
- name: 🧹 Resolve path conflicts
  run: |
    if [ -f "docs/knowledge" ]; then
      echo "⚠️ Renaming file → docs/knowledge.md"
      mv docs/knowledge docs/knowledge.md
    fi
    mkdir -p docs/knowledge
```

---

### 3.3 Node.js 20 Deprecation Warning

**What it means:** Old action versions use Node 20, which is being phased out.
**Fix — Upgrade actions:**

| Old | New |
| --- | --- |
| `actions/checkout@v4` | `actions/checkout@v5` ✅ |
| `actions/upload-artifact@v4` | `actions/upload-artifact@v4` (OK, but check v5) |

**Suppress warning globally:**

```yaml
env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
```

---

### 3.4 `No such file or directory` — Path Mismatch

**What it means:** File moved or renamed — especially after folder restructure (`frontend/`, `backend/`, `development/`).

**Checklist:**

| Old Path | New Path |
| --- | --- |
| `docs/` | `development/docs/` |
| `scripts/` | `development/scripts/` or root |
| `tests/` | `frontend/tests/` / `backend/tests/` |

**Update workflow triggers:**

```yaml
paths:
  - 'development/docs/knowledge/**'
  - 'development/scripts/update_readme.py'
```

---

### 3.5 Python / Script Not Found

**Error:** `python: can't open file 'scripts/update_readme.py'`
**Fix:** Verify and use correct path:

```yaml
- name: 🚀 Run script
  run: python development/scripts/update_readme.py
```

---

## 4. Step-by-Step Debug Process

### Step 1 — Reproduce the Failure

- Note: Did it fail on **push**, **schedule**, or **manual** run?
- Scheduled runs often fail due to changed paths or expired tokens

### Step 2 — Read the Exact Error

- Don't guess — read the **red text**
- First line of error = most important clue
- Example: `cannot stat 'xxx': No such file` → path is wrong

### Step 3 — Check Locally First

```bash
# Checkout same branch
git checkout main
git pull

# Run the same commands manually
python scripts/update_readme.py
# Did it work locally? → problem is in workflow env or permissions
# Failed locally → fix code first
```

### Step 4 — Add Debug Output

```yaml
- name: 🔍 Debug paths
  run: |
    pwd
    ls -la
    echo "Script exists:"
    test -f scripts/update_readme.py && echo "✅ Yes" || echo "❌ No"
```

### Step 5 — Test Manually

- Trigger workflow via **Run workflow** dropdown in Actions tab
- Watch logs in real-time
- If it works manually but not on schedule → check cron timing or branch protection rules

---

## 5. Advanced Troubleshooting

### 5.1 Enable Debug Logging

When standard logs are unclear:

1. Go to failed job → **Re-run jobs** → Check **Enable debug logging**
2. Look for expanded `##[debug]` lines
3. Key variables printed: paths, env vars, exit codes

### 5.2 Common Branch Protection Blocks

- ❌ `main` requires PR reviews → `github-actions[bot]` cannot push directly
- **Fix:**
  - Allow bot in repo settings → Branches → Branch protection rules → **Allow specified actors** → `github-actions[bot]`
  - Or use a Personal Access Token (PAT) with repo scope

### 5.3 Workflow Syntax Validation

Before committing:

- Use [actionlint.net](https://actionlint.net/) to check for syntax errors
- VS Code extension: **GitHub Actions** → underlines issues in real-time

### 5.4 Timeout / Stuck Jobs

- Add `timeout-minutes: 10` to jobs to prevent hanging
- Long-running jobs may need more time or optimized steps

---

## 6. Prevention & Best Practices

| Practice | Benefit |
| --- | --- |
| Always use `permissions: contents: write` when pushing | Avoid silent permission failures |
| Pin major versions → `@v5` not `@main` | Stable, predictable behavior |
| Test workflow changes on a feature branch first | Don't break `main` |
| Keep actions updated quarterly | Avoid deprecation surprises |
| Use `[skip ci]` in commit message for doc-only changes | Save CI minutes |
| Add `env: FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` globally | Suppress warnings across all workflows |
| Review paths after folder restructure | Update workflows immediately |

---

## 7. Reference Cheat Sheet

### Quick Fix Commands

```bash
# Fix path conflict
mv docs/knowledge docs/knowledge.md
mkdir -p docs/knowledge

# Check workflow file syntax locally
cat .github/workflows/update-readme.yml

# See what changed
git diff HEAD~1 --name-only

# Reset & retry
git commit --allow-empty -m "chore: retry workflow" && git push
```

### Permission Quick Reference

| Job Needs | Permission |
| --- | --- |
| Checkout only (read) | Default — no extra needed |
| Push commits / tags | `contents: write` |
| Create PRs / comments | `pull-requests: write` |
| Dispatch other workflows | `actions: write` |

### Escalation Flow

```
Workflow Fails
    ↓
Read error message → match to §3
    ↓
Reproduce locally → works? → env/permissions issue
    ↓
Add debug output → identify root cause
    ↓
Apply fix from §3
    ↓
Test on feature branch → merge to main
    ↓
Document pattern here
```

---

## 📌 Related Documents

- [FIX_FAIL_JOB.md](../FIX_FAIL_JOB.md) — Quick-reference emergency fixes
- [CODEOWNERS](../.github/CODEOWNERS) — Who reviews what
- [Conventional Commits](https://www.conventionalcommits.org/) — Commit message standard

---

Save this file as: **`development/docs/how-to-debug-workflows.md`**

Would you like me to also create a **one-page quick-reference card** version of this guide to pin in your team chat or README?
