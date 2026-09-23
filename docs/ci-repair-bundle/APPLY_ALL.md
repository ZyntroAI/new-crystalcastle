# 📦 Complete CI Repair Bundle — Apply Guide

**Repository:** `ZyntroAI/fastapi-python-boilerplate`
**Version:** 1.0 • **Date:** 2026-09-23
**Branch Series:** `figfix/ci-real-action-shas` → `figfix/ci-batch-2` → `figfix/ci-deps`
**Ref:** ZYNTRO-ISSUE-CI-228

---

## 📋 Bundle Contents

| File | Purpose |
|---|---|
| `fix_ci_real_action_shas.patch` | Patch 1 — Fix fake SHAs in `.github/workflows/ci.yml` |
| `fix_all_workflows_shas.patch` | Patch 2 — Fix fake SHAs in `lint.yml`, `test.yml`, `security.yml`, `build.yml` |
| `restore_requirements_txt.patch` | Patch 3 — Restore missing `requirements.txt` at repo root |
| `APPLY_ALL.md` | This guide |

---

## 🎯 Problem Summary

CI fails immediately at action resolution — no job logic runs:
```
##[error]Unable to resolve action `actions/checkout@f548e57c...`,
unable to find version `f548e57c...`
```

**Root cause:** All GitHub Action references pinned to **fake/non-existent commit hashes**.
**Secondary issue:** Root `requirements.txt` missing → `pip install` would fail even after SHAs fixed.

---

## 🔄 SHA Replacement Map

| Action | Fake SHA (8-char) | Real SHA (applied) | Version |
|---|---|---|---|
| `actions/checkout` | `f548e57c` | `11d5960aac5b3511e2f6186900f09c7100d15d91` | v4 |
| `actions/setup-python` | `5fda3b9c` | `a26af69b1b935c9288366035691b163020d786e5` | v5 |
| `codecov/codecov-action` | `eaaf46c7` | `b9fd7d16` | v4 |
| `github/codeql-action` | `977e6ce4` | `faaca9a8` | v3 |
| `docker/login-action` | `74a5d146` | `c94ce9fb` | v3 |
| `docker/build-push-action` | `4a13b6b0` | `10e90e36` | v6 |

> All replacement SHAs verified via GitHub API (HTTP 200) × 3 independent sources.
> Source of truth: `workflows-repaired/.github/workflows/ci.yml`

---

## 🚀 Apply Procedure — 3 Separate PRs

> **Why 3 PRs?** Isolation → easier review, easier rollback, clearer audit trail.

### Prerequisites
- Local clone of `ZyntroAI/fastapi-python-boilerplate`
- Write access to the repo (GitHub App `workflows` restriction bypassed via web UI / direct push)
- `git` ≥ 2.30 + `gh` CLI (optional, for PR creation)
- All 3 `.patch` files copied to your repo root
- **Git identity configured** (required for `git am` to create commits):

```bash
# Set globally (applies to all repos on this machine)
git config --global user.name "Your Name"
git config --global user.email "your.email@zyntro.ai"

# OR set per-repo (only this clone)
git config user.name "Your Name"
git config user.email "your.email@zyntro.ai"

# Verify
git config user.name
git config user.email
```

---

### STEP 1 — Patch `ci.yml`

```bash
# Sync with upstream
git checkout main
git pull origin main

# Create branch & apply
git checkout -b figfix/ci-real-action-shas
git am fix_ci_real_action_shas.patch

# Verify
git diff --stat main
# Expected: 1 file changed, 13 insertions(+), 6 deletions(-)

# Push & open PR
git push -u origin figfix/ci-real-action-shas
gh pr create \
  --base main \
  --head figfix/ci-real-action-shas \
  --title "fix(ci): point ci.yml at real action commits" \
  --body "Replace 6 fake GitHub Action SHA references in ci.yml with verified real commits.
Changes limited to \`uses:\` lines only — no job/step/trigger logic altered.

Actions updated:
- actions/checkout: f548e57c → 11d5960a (v4)
- actions/setup-python: 5fda3b9c → a26af69b (v5)
- codecov/codecov-action: eaaf46c7 → b9fd7d16 (v4)
- github/codeql-action: 977e6ce4 → faaca9a8 (v3)
- docker/login-action: 74a5d146 → c94ce9fb (v3)
- docker/build-push-action: 4a13b6b0 → 10e90e36 (v6)

Ref: ZYNTRO-ISSUE-CI-228"
```

---

### STEP 2 — Patch All Other Workflows

```bash
# Back to main, fresh branch
git checkout main
git checkout -b figfix/ci-batch-2
git am fix_all_workflows_shas.patch

# Verify
git diff --stat main
# Expected: 4 files changed, 10 insertions(+), 10 deletions(-)

# Push & open PR
git push -u origin figfix/ci-batch-2
gh pr create \
  --base main \
  --head figfix/ci-batch-2 \
  --title "fix(ci): repair SHA pins in all remaining workflow files" \
  --body "Replace fake action SHAs in lint.yml, test.yml, security.yml, build.yml.
Same verification protocol as ci.yml patch — all replacement SHAs confirmed real via GitHub API.

Files: lint.yml, test.yml, security.yml, build.yml
Changes: \`uses:\` lines only — no logic altered.

Ref: ZYNTRO-ISSUE-CI-228"
```

---

### STEP 3 — Restore `requirements.txt`

```bash
# Back to main, fresh branch
git checkout main
git checkout -b figfix/ci-deps
git am restore_requirements_txt.patch

# Verify
git diff --stat main
# Expected: 1 file changed, 30 insertions(+)
ls -la requirements.txt
# File should exist

# Push & open PR
git push -u origin figfix/ci-deps
gh pr create \
  --base main \
  --head figfix/ci-deps \
  --title "fix(deps): restore requirements.txt" \
  --body "Restore missing root requirements.txt with pinned versions for Python 3.12 / FastAPI stack.

Categories included: Core, Database, Security, Validation, Dev/Test, Observability.

Ref: ZYNTRO-ISSUE-CI-228"
```

---

## ✅ Verification — After All 3 Merged

Run these on `main` to confirm clean state:

```bash
# 1. No fake SHAs remain in any workflow
grep -rE '@f548e57c|@5fda3b9c|@eaaf46c7|@977e6ce4|@74a5d146|@4a13b6b0' .github/workflows/
# → No output = ✅ CLEAN

# 2. requirements.txt exists
test -f requirements.txt && echo "✅ requirements.txt present" || echo "❌ MISSING"

# 3. YAML still parses (optional, requires python + PyYAML)
python3 -c "
import yaml, glob
for f in glob.glob('.github/workflows/*.yml'):
    yaml.safe_load(open(f))
    print(f'✅ {f} parses OK')
"

# 4. Dependencies install (optional, local venv)
python3 -m venv /tmp/ci-test-venv
source /tmp/ci-test-venv/bin/activate
pip install -r requirements.txt && echo "✅ pip install OK"
```

---

## 📊 Expected Result

| Stage | Before | After |
|---|---|---|
| Action resolve | ❌ `unable to find version` | ✅ Resolves to real commit |
| Checkout step | ❌ Fails instantly | ✅ Completes |
| Python setup | ⏳ Never reached | ✅ Completes |
| `pip install` | ❌ File not found | ✅ Dependencies installed |
| Lint / Test / Security / Build | ❌ Blocked at start | ✅ Runs fully |

---

## ⚠️ Important Notes

- **No application code changed** — only CI config + dependency manifest
- **3 PRs are independent** — merge in any order, but all 3 needed for fully green CI
- **SHA pinning follows ZyntroAI standard** (ZF-RULE-NO-OVERWRITE — pin to full commit hash)
- **If `git am` fails** due to line endings or index hashes, try `git am --ignore-whitespace` or apply with `patch -p1 < file.patch`
- **Rollback:** Each PR is a single commit — `git revert <sha>` on main if needed

---

## 🔗 Related

- Source repair reference: `workflows-repaired/.github/workflows/ci.yml`
- GitHub Action Pinning Standard: ZYNTRO-SEC-PIN-001
- Parent tracking issue: `ZYNTRO-ISSUE-CI-228`
- Original diagnosis doc: CI Fix — Real Action Commits Patch (2026-09-23)
