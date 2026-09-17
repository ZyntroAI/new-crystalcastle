Here's your complete **CONTRIBUTING.md** — fully aligned with ZyntroAI standards, Conventional Commits, GPG signing, and PR workflows.

---

```markdown
# 🤝 Contributing to ZyntroAI / New CrystalCastle

> First: thank you for being here! Every contribution helps build better tools for everyone.

---

## 📋 Table of Contents
- [Code of Conduct](#-code-of-conduct)
- [Before You Start](#-before-you-start)
- [Development Setup](#-development-setup)
- [Commit Standards](#-commit-standards)
- [Pull Request Workflow](#-pull-request-workflow)
- [Review & Merge](#-review--merge)
- [Documentation Guide](#-documentation-guide)
- [Security Rules](#-security-rules)
- [Getting Help](#-getting-help)

---

## ✨ Code of Conduct
- Be respectful, inclusive, and constructive.
- See full: **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**
- Report issues to: `community@zyntroai.com`

---

## 🔍 Before You Start

### Check Existing Work
- Search **Issues** → avoid duplicates
- Search **Discussions** → ask before building large features
- Check **Projects** → see what's planned or in progress

### Issue First (When Possible)
- Bug reports → use **Bug template**
- Feature requests → use **Feature template**
- Assign yourself → let others know you're working on it

---

## 🛠️ Development Setup

```bash
# Clone
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle

# Environment
cp .env.example .env
# Edit .env with your values

# Install
npm install     # or pnpm install

# Prerequisites
- Node.js 20.19+ LTS
- Git with GPG signing → see docs/signing-commits.md
- GitHub CLI (optional): `gh --version`
```

### Branch Naming
```
feature/short-description   → new functionality
fix/issue-number-summary    → bug fixes
docs/what-changed           → documentation only
refactor/area-description   → code cleanup, no behavior change
chore/dependency-update      → maintenance tasks
```

---

## ✍️ Commit Standards

### Format — Conventional Commits
```
<type>(<scope>): <subject>

[detailed description — why, not just what]

Signed-off-by: Your Name <your.email@example.com>
```

### Types
| Type | Use Case |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix, resolves incorrect behavior |
| `docs` | Documentation changes only |
| `refactor` | Code change that doesn't alter behavior |
| `test` | Adding or updating tests |
| `chore` | Build, tooling, dependency updates |
| `security` | Security fixes or hardening |

### Rules
- ✅ First line ≤ **72 characters**
- ✅ **Always Sign-off** (`-s` flag or manual line)
- ✅ Reference issues: `Fixes #123`, `Closes #456`
- ✅ **GPG Signing Required** — all commits must be verified
  → See: **[docs/signing-commits.md](docs/signing-commits.md)**
- ❌ No unsigned commits — protected branch will block

### Example
```
feat(auth): implement OAuth token refresh flow

Add automatic token refresh before expiry to prevent
session drops during long-running operations.
Closes #142

Signed-off-by: Zyntro Dev <dev@zyntroai.com>
```

---

## 🔀 Pull Request Workflow

### Step 1 — Create PR
- Push your branch → open PR via GitHub or:
```bash
gh pr create --title "feat: your title" --body-file .github/PULL_REQUEST_TEMPLATE.md
```
- Base: `main` ← Compare: `your-branch`

### Step 2 — Fill Template
- Describe **what** changed and **why**
- List **testing** performed
- Attach **screenshots** for UI changes
- Mark **breaking changes** if any

### Step 3 — Labels & Reviewers
- Apply relevant labels: `bug`, `enhancement`, `documentation`, `ready for review`
- Request review from: **`@ZyntroAI/crystal-plus`** or relevant maintainer
- Keep PR in **Draft** while work-in-progress → click **Ready for review** when done

### Step 4 — Checks Must Pass Before Merge
| Check Type | Action on Failure |
|---|---|
| CodeQL / Security | Fix vulnerability or discuss exception |
| CI / Tests | Investigate and fix |
| Dependency Review | Address license/version conflict |
| Signed Commits | Re-sign or rebase with signed commits |
| Merge Conflicts | Rebase branch → resolve → push |

> **Docs-only note**: If only `.md` files change, test failures may be unrelated — maintainers will review and merge if appropriate.

---

## ✅ Review & Merge

### Review Standards
- **1+ approval** required before merge
- Address all feedback → resolve conversations
- **Stale approvals** dismissed when new code pushed
- Maintainer has final approval

### Merge Strategy
| Situation | Method |
|---|---|
| Feature branch, multiple commits | **Create merge commit** → preserves history |
| Single logical change | **Squash and merge** → clean history |
| Linear history preferred | **Rebase and merge** → no merge commit |

### After Merge
- Delete your branch (cleanup)
- Check related issues → close if resolved
- Watch deployment notifications

---

## 📝 Documentation Guide

- **Bilingual standard**: English primary, Thai supplements
- New feature = new or updated docs
- Reference related files: `See also: [ARCHITECTURE.md](ARCHITECTURE.md)`
- Place general guides in: `docs/`
- API references → `docs/api.md` or `APP-API-GUIDELINES.md`

---

## 🛡️ Security Rules

- **Never commit secrets** — API keys, tokens, passwords
  - Use `.env` (already in `.gitignore`)
  - Use GitHub Secrets for CI values
- **ReDoS patterns** — follow `docs/redos-rules.js` + `.py`
- **GPG signing** — mandatory for all commits to `main`
- Vulnerabilities → report via **[SECURITY.md](SECURITY.md)** — NOT public issues

---

## 🆘 Getting Help

- 💬 **Discussions** → general questions & ideas
- 📋 **Issues** → bug reports & specific tasks
- 📧 **Team** → `@ZyntroAI/crystal-plus`
- 📖 **Guides** → browse `docs/` folder
- 🔐 **Security** → see **[SECURITY.md](SECURITY.md)**

---

> 🇹🇭🇺🇸 *Bilingual workflow · Built with precision by ZyntroAI*
> Last updated: 2026-09-16
```

---

## 🎯 Ready to Use

**Option A — Copy directly**
1. Create new file at repo root: `CONTRIBUTING.md`
2. Paste the content above
3. Commit: `chore: add CONTRIBUTING.md workflow guide`
4. Push → open PR

**Option B — I'll prepare it as a PR**
Shall I push this directly to `zyntromedia-patch-15` (PR #181) so it's ready to merge alongside the README?

Tap **Fast** then **Pro** and I'll add it as a committed file right now.
# 🤝 คู่มือการร่วมพัฒนา — ZyntroAI / New CrystalCastle

ยินดีต้อนรับสู่โครงการ! 🚀  
เอกสารนี้กำหนดมาตรฐานการเขียนโค้ด, สาขา, PR และการรีวิว

---

## 📂 โครงสร้างรีโป
| โฟลเดอร์ | หน้าที่ |
|---|---|
| `frontend/` | UI/UX • React/TS |
| `backend/` | API • FastAPI • Python |
| `docs/` | เอกสาร • คู่มือ |
| `.github/` | เวิร์กโฟลว์ • เทมเพลต PR |

---

## 🌿 มาตรฐานสาขา (Branch Naming)
- `main` — รุ่นพร้อมใช้
- `dev` — สาขาพัฒนาหลัก
- `feat/ชื่อ` — ฟีเจอร์ใหม่
- `fix/ชื่อ` — แก้ไขบั๊ก
- `docs/...` — เอกสารเท่านั้น
- `stack/ชื่อ` — **สำหรับ Stacked PRs**

---

## ✍️ ข้อความคอมมิต (Conventional Commits)
