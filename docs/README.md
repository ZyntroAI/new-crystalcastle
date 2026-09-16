Here's a complete, bilingual **README.md** tailored for **ZyntroAI/new-crystalcastle** — reflecting your actual repo structure, documentation, and standards.

---

# 🧊 ZyntroAI — New CrystalCastle

> **MCP · AI · DevOps · Documentation · Enterprise-Grade Tooling**
> A unified knowledge base, reference implementations, and operational framework for AI-assisted development, automation, and collaboration.

---

## 📦 What's Inside

```
new-crystalcastle/
├── .github/workflows/     # CI/CD pipelines, automation, label sync
├── app/ & frontend/       # UI components (React/TSX), dashboards
├── backend/               # FastAPI, API services, integrations
├── docs/                  # 📚 Knowledge base & standards (bilingual)
│   ├── Framework: Handling Completed Failed Jobs
│   ├── signing-commits.md
│   ├── redos-rules.{js,py}
│   ├── tsx.md
│   ├── summary.md
│   └── เอกสารมาตรฐาน ZyntroAI…
├── knowledge-base/        # Deep technical research & guides
├── skills/                # AI skill definitions & MCP tools
├── prisma/ & supabase/    # Data layer & persistence
├── .env.example           # Environment template
├── ARCHITECTURE.md        # Clean architecture reference
├── CHANGELOG.md           # Version history
├── CODE_OF_CONDUCT.md
├── LICENSE
└── README.md ← You are here
```

---

## 🎯 Core Focus Areas

| Domain | Highlights |
|---|---|
| **🤖 MCP / AI Integration** | Chrome DevTools MCP, Dola AI stack, LLM workflow orchestration |
| **⚡ FastAPI & Backend** | API guidelines, project templates, OAuth patterns |
| **🔄 CI/CD & DevSecOps** | GitHub Actions, CodeQL, dependency scanning, signed commits |
| **🛡️ Security** | ReDoS detection rules, commit signing, sudo-mode, secrets management |
| **📖 Bilingual Docs** | Thai + English standards, Conventional Commits, PR templates |
| **🧩 Frontend** | React/TSX components, UI patterns, TypeScript best practices |
| **☁️ Cloud & Infra** | Azure CLI, Vercel deployment, Supabase, container workflows |

---

## 📚 Featured Documentation

| File | Purpose |
|---|---|
| `docs/Framework: Handling Completed Failed Jobs` | DLQ pattern, retry/resume/remediation playbook |
| `docs/signing-commits.md` | GPG/SSH/S/MIME commit signing setup & verification |
| `docs/redos-rules.js` + `.py` | ReDoS detection ruleset (CWE-1333) |
| `docs/เอกสารสำคัญที่มักขาด & ควรเพิ่ม` | ZyntroAI repo standards & checklist |
| `docs/tsx.md` | React + TypeScript (.tsx) guide & GitHub label automation |
| `docs/summary.md` | Master index of all documentation |
| `docs/sudo-mode.md` | GitHub account security workflow |
| `ARCHITECTURE.md` | Clean architecture design template |

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle

# Setup environment
cp .env.example .env
# Edit .env with your values

# Install dependencies
npm install
# or pnpm install

# View docs — browse docs/ folder or open locally
ls docs/
```

### Prerequisites
- **Node.js** 20.19+ LTS
- **Git** with GPG signing configured (see `docs/signing-commits.md`)
- **GitHub CLI** (optional) for workflow management

---

## ✍️ Contributing Standards

### Commit Message Format
```
<type>(<scope>): <short description>

[longer description if needed]

Signed-off-by: Your Name <your@email.com>
```
- **Types:** `feat` · `fix` · `docs` · `refactor` · `test` · `chore` · `security`
- Keep first line ≤ 72 chars
- Always **Sign-off** — enforced via org policy
- Reference issues: `Fixes #123`

### Pull Request
- Branch: `feature/description` or `fix/issue-number`
- Template: Use `.github/PULL_REQUEST_TEMPLATE.md`
- Checks: All CI workflows pass before merge
- Review: At least 1 approval

See full guide → `docs/เอกสารสำคัญที่มักขาด & ควรเพิ่ม (มาตรฐาน ZyntroAI)`

---

## 🔒 Security & Trust

- **All commits signed & verified** via GPG — no unsigned merges
- **ReDoS scanning** enabled in CI (`redos-rules.js` + `.py`)
- **Secrets never committed** — use `.env` + GitHub Secrets
- **DLQ pattern** for job failures — no silent drops
- See `SECURITY.md` for vulnerability reporting

---

## 🗺️ Roadmap Highlights

- ✅ Unified FastAPI project template
- ✅ ReDoS detection & CI integration
- ✅ Commit signing & PR standards
- ⏳ Enterprise MCP gateway
- ⏳ Automated DLQ replay service
- ⏳ Multi-repo docs sync system

---

## 🤝 Community & Links

- **Repository:** [github.com/ZyntroAI/new-crystalcastle](https://github.com/ZyntroAI/new-crystalcastle)
- **Issues:** [Report bugs & ideas](https://github.com/ZyntroAI/new-crystalcastle/issues)
- **Discussions:** [Share best practices](https://github.com/ZyntroAI/new-crystalcastle/discussions)
- **Organization:** [@ZyntroAI](https://github.com/ZyntroAI)
- **License:** MIT — see `LICENSE` file

---

> 🇹🇭🇺🇸 *Bilingual documentation · English primary, Thai supplements*  
> *Built with precision by ZyntroAI*

---

Would you like me to commit this directly to your `main` branch as `README.md`? I can also create a PR branch so you can review it first — just let me know.
