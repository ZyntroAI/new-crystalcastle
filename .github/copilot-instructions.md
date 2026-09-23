นี่คือเวอร์ชันที่ปรับปรุงและขยายความครอบคลุมทุกหลักการ พร้อมรูปแบบที่ Copilot เข้าใจและนำไปใช้ได้ดียิ่งขึ้น 🚀✅
 
 
 
📄 .github/copilot-instructions.md — Full Enhanced Version
 
markdown  
---
applyTo: ".github/workflows/**/*.yml,.github/workflows/**/*.yaml"
---

## 🛡️ GitHub Actions Workflow — Standards & Guidelines
**Standard:** ZyntroAI Enterprise • Security-First • Reproducible • Maintainable  
**Last Updated:** 2026-09-24

---

### 📁 Placement
- Store all workflows in **`.github/workflows/`** only
- Use extensions: `.yml` or `.yaml` consistently
- Name clearly: `ci.yml`, `lint.yml`, `release.yml` — descriptive kebab-case

### 🔒 Security — Supply Chain & Least Privilege
- **ALWAYS pin actions to full commit SHA** — NEVER use floating tags or branches
  ```yaml
  ✅ uses: actions/checkout@b4ffde65f46336ab88eb53be80843a393cfff0ec2  # v4.1.1
  ❌ uses: actions/checkout@v4
  ❌ uses: actions/checkout@main
 
 
- Set explicit  permissions:  at workflow or job level — start minimal, expand only when necessary
yaml  
permissions:
  contents: read
  checks: write   # only if reporting test results
  pull-requests: write  # only if needed
 
- NEVER hard-code secrets, tokens, or keys — always use  ${{ secrets.NAME }} 
- Use  ${{ vars.NAME }}  for non-sensitive configuration values
- Never print or expose secrets — avoid  echo ${{ secrets }}  or debug logs that may leak values
 
⚙️ Structure & Clarity
 
- Give every workflow, job, and step a clear, human-readable name
yaml  
name: FastAPI CI
run-name: CI • ${{ github.head_ref || github.ref_name }} • ${{ github.sha }}
jobs:
  test:
    name: Run Tests & Coverage
 
- Define explicit triggers — avoid relying on defaults
yaml  
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
 
- Add  timeout-minutes  to prevent hung runs
- Use  needs:  for sequential dependencies — do not rely on execution order
- Add  concurrency:  groups to cancel stale overlapping runs
yaml  
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
 
 
🔄 Reuse & Performance
 
- Avoid duplication — extract shared logic into reusable workflows or composite actions under  .github/actions/ 
- Cache dependencies when installation takes > 30s (pip, npm, etc.)
- Keep workflows focused — separate concerns (lint → test → build → deploy) rather than one giant file
 
✅ Quality & Reliability
 
- Run full pipeline: format check → lint → test → security scan → build
- Make steps deterministic — no silent failures; fail fast and clearly
- Use  if: always()  for cleanup/teardown steps that must run regardless of prior status
- Preserve existing triggers and required checks when modifying workflows — unless the change explicitly requires adjustment
 
🧪 Validation Before Commit
 
- Verify YAML syntax is valid and indentation is consistent
- Confirm all referenced SHAs exist in upstream repos
- Review: no secrets exposed • permissions minimal • actions pinned
- Run locally with act if possible
 
 
 
📋 Quick Reference — Good Patterns
 
Do ✅ Don't ❌ 
 permissions: { contents: read }  Omit permissions (defaults to broad) 
 @full-sha-hash   @v4 ,  @latest ,  @main  
 ${{ secrets.KEY }}  Hard-coded keys/tokens 
 timeout-minutes: 10  Jobs with no time limit 
 concurrency:  Unbounded parallel runs 
 needs: [lint]  Implicit order dependence 
Reusable workflows Copy-pasted identical steps 
 
plaintext  

---

# 📄 .github/instructions/workflows.instructions.md — Targeted Rules

```markdown
---
applyTo: ".github/workflows/**/*.yml,.github/workflows/**/*.yaml"
---

## 🎯 Workflow-Specific Rules — ZyntroAI Standard

### 🔒 Security (Non-Negotiable)
- **Pin ALL external actions to full commit SHA** — mutable tags and branches are forbidden
- **Start with minimal permissions** — `contents: read` baseline; add only what is strictly necessary
- **Never hard-code credentials** — use `${{ secrets.* }}` for sensitive values, `${{ vars.* }}` for configuration
- **Never echo or print secrets** — mask or omit from logs

### ⚙️ Structure & Maintainability
- Include **`timeout-minutes`** on every job — prevent infinite runs
- Use **`if:`, `needs:`**, and job-level permissions explicitly
- Add **`concurrency`** grouping to cancel outdated runs
- Keep jobs focused and reusable — extract common patterns to `.github/actions/`
- Avoid over-specific path filters unless truly necessary

### ✅ Quality Gates
- Lint → format → test → security scan sequence
- Fail fast — place fastest checks first
- Preserve existing trigger logic unless intentionally changing behavior
- Validate syntax and SHA references before committing
 
 
 
 
🚀 Create Both Files — Copy-Paste Commands
 
bash  
# Create directory if missing
mkdir -p .github/instructions

# Write copilot-instructions.md
cat > .github/copilot-instructions.md << 'ENDOFFILE'
---
applyTo: ".github/workflows/**/*.yml,.github/workflows/**/*.yaml"
---

## 🛡️ GitHub Actions Workflow — Standards & Guidelines
**Standard:** ZyntroAI Enterprise • Security-First • Reproducible • Maintainable
**Last Updated:** 2026-09-24

---

### 📁 Placement
- Store all workflows in **.github/workflows/** only
- Use .yml or .yaml extension consistently
- Name clearly: ci.yml, lint.yml, release.yml — kebab-case

### 🔒 Security — Supply Chain & Least Privilege
- **ALWAYS pin actions to full commit SHA** — NEVER use floating tags or branches
  ✅ uses: actions/checkout@b4ffde65f46336ab88eb53be80843a393cfff0ec2  # v4.1.1
  ❌ uses: actions/checkout@v4
  ❌ uses: actions/checkout@main
- **Set explicit permissions:** at workflow or job level — start minimal, expand only when necessary
  permissions:
    contents: read
    checks: write
    pull-requests: write
- **NEVER hard-code secrets, tokens, or keys** — always use ${{ secrets.NAME }}
- Use ${{ vars.NAME }} for non-sensitive configuration
- **Never expose secrets in logs** — avoid printing or echoing secret values

### ⚙️ Structure & Clarity
- Give workflow, job, and step clear readable names
- Define explicit triggers — do not rely on defaults
- Add timeout-minutes to every job
- Use needs: for dependencies — do not rely on execution order
- Add concurrency: groups to cancel stale overlapping runs

### 🔄 Reuse & Performance
- Avoid duplication — extract shared logic to reusable workflows or composite actions
- Cache dependencies when installation is slow
- Separate concerns — keep workflows focused (lint, test, deploy as distinct files)

### ✅ Quality & Reliability
- Run full pipeline: format → lint → test → security → build
- Steps must be deterministic — fail fast and clearly
- Use if: always() for cleanup steps
- Preserve existing triggers and required checks unless intentionally changing

### 🧪 Validation
- Verify YAML syntax
- Confirm all pinned SHAs exist upstream
- Review: minimal permissions • no secrets exposed • all actions pinned
ENDOFFILE

# Write targeted instructions
cat > .github/instructions/workflows.instructions.md << 'ENDOFFILE'
---
applyTo: ".github/workflows/**/*.yml,.github/workflows/**/*.yaml"
---

## 🎯 Workflow-Specific Rules — ZyntroAI Standard

### 🔒 Security (Non-Negotiable)
- **Pin ALL actions to full commit SHA** — no @vX, @latest, @main
- **Minimal permissions baseline:** contents: read — add only what's strictly needed
- **Secrets via ${{ secrets.* }}** — never hard-code
- **No secrets in logs** — never echo or print sensitive values

### ⚙️ Structure
- timeout-minutes on every job
- Explicit if:, needs:, and job-level permissions
- concurrency: group + cancel-in-progress
- Reuse instead of copy-paste — composite actions or reusable workflows
- Avoid over-restrictive path filters unless justified

### ✅ Quality
- Lint → format → test → security sequence
- Fail fast — fastest checks first
- Validate SHA references before commit
- Preserve existing trigger logic unless changing intentionally
ENDOFFILE

# Verify
ls -la .github/copilot-instructions.md
ls -la .github/instructions/workflows.instructions.md

# Commit
git add .github/copilot-instructions.md .github/instructions/workflows.instructions.md
git commit -m "docs: add enhanced Copilot workflow instructions

- Full security guidelines: SHA pinning • least privilege • secrets handling ✅
- Targeted path-specific rules for Copilot context ✅
- Concurrency, timeouts, reuse patterns documented ✅
- Quick-reference Do/Dont table included ✅
- Aligns with ZyntroAI CI standards & existing workflows ✅"

git push origin main
 
 
 
 
✅ Key Improvements from Original
 
Before After 
Plain list Structured sections + examples + patterns ✅ 
No SHA guidance Explicit ✅ correct vs ❌ incorrect patterns shown 
No concurrency Added as standard practice ✅ 
No reuse explanation Reusable workflows/actions called out specifically ✅ 
Single file Two-layer system: general + path-targeted for Copilot precision ✅ 
No validation step Pre-commit checklist included ✅ 
Generic tone Branded to ZyntroAI standards — matches your existing CI ✅ 
 
This setup means:
 
- Copilot sees targeted rules only when editing workflow files → more accurate suggestions
- Humans have full reference in  copilot-instructions.md  → complete documentation
- Both enforce your security policy automatically → no more unpinned actions or missing permissions 🛡️🔒🚀
 
Ready to commit? Let's go! ✅