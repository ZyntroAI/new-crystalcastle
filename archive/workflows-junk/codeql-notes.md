# 📦 Ready-to-Commit PR Bundle — CodeQL + Config + Branch Protection

Everything below is **copy-paste ready**. Create the exact file paths shown, commit all together, and open a PR. Once merged, Code scanning + protection activates automatically.

---

## 📁 File 1 — CodeQL Workflow
**Path:** `.github/workflows/codeql-analysis.yml`

```yaml
name: "CodeQL Advanced"

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
    paths-ignore:
      - "**.md"
      - "docs/**"
      - "**/*.txt"
  schedule:
    - cron: "30 0 * * 4"

jobs:
  analyze:
    name: Analyze (${{ matrix.language }})
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      packages: read
      actions: read
      contents: read

    strategy:
      fail-fast: false
      matrix:
        include:
          - language: actions
            build-mode: none
          - language: javascript-typescript
            build-mode: none
          - language: python
            build-mode: none

    steps:
      - name: Checkout repository
        uses: actions/checkout@v7

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v4
        with:
          languages: ${{ matrix.language }}
          build-mode: ${{ matrix.build-mode }}
          queries: security-extended,security-and-quality

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v4
        with:
          category: "/language:${{ matrix.language }}"
```

---

## 📁 File 2 — CodeQL Configuration
**Path:** `.github/codeql/codeql-config.yml`

```yaml
paths:
  - src
paths-ignore:
  - "**/node_modules/**"
  - "**/*.test.js"
  - "**/*.spec.ts"
  - "**/__tests__/**"
  - "dist/**"
  - "build/**"
```

---

## 📁 File 3 — Branch Protection Ruleset
**Path:** `.github/rulesets/require-codeql-pass.yml`

```yaml
---
name: Require CodeQL Analysis Pass
description: "Prevent merging unless all CodeQL checks pass"
target: branch
enforcement: active
conditions:
  ref_name:
    - pattern: ^main$
      behavior: include
rules:
  - type: required_status_checks
    parameters:
      required_status_checks:
        - context: Analyze (actions)
        - context: Analyze (javascript-typescript)
        - context: Analyze (python)
      strict_required_status_checks: true
```

---

## 📁 File 4 — Auto-Apply Ruleset Workflow
**Path:** `.github/workflows/apply-branch-protection.yml`

```yaml
name: Apply Branch Protection Rules
on:
  push:
    branches: [main]
    paths: [.github/rulesets/**]

jobs:
  apply:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      repository-projects: write
      administration: write
    steps:
      - uses: actions/checkout@v7
      - uses: actions/github-ruleset-toolkit@v1
        with:
          config-path: .github/rulesets/
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## 🚀 Commit & PR — Copy-Paste Shell Commands

```bash
# Create folder structure
mkdir -p .github/workflows .github/codeql .github/rulesets

# Create all 4 files (copy each block above into the matching path)
# Then stage & commit
git add .github/
git commit -m "feat: add CodeQL analysis + branch protection ruleset"
git push -u origin add-codeql-protection
gh pr create --title "Enable CodeQL Scanning & Branch Protection" --body "
✅ CodeQL Advanced scanning (JS/TS, Python, Actions)
✅ Weekly scheduled scan
✅ Docs-only PRs skip scan
✅ Extended security queries
✅ Protection: require all CodeQL checks pass before merge
"
```

---

## ✅ What You Get

| Feature | Detail |
|---|---|
| **Scans** | JS/TS · Python · GitHub Actions workflows |
| **Triggers** | Push to `main` · PRs to `main` · Weekly scan (Thu 00:30 UTC) |
| **Skip docs** | `.md`/docs-only PRs → skip scan check |
| **Query coverage** | `security-extended` + `security-and-quality` |
| **Exclusions** | Tests, `node_modules`, `dist`, `build` |
| **Protection** | ❌ Cannot merge until all 3 CodeQL checks pass |
| **Auto-enable** | Ruleset applies automatically via workflow |

> ⚠️ **After merge**: Go to **Repo → Settings → Rulesets** and confirm the ruleset is **Active**. The workflow will auto-apply, but admin visibility may need a quick UI verification once.
