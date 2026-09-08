# 🏰 CrystalCastle — Intelligent DevSecOps Platform & AI Toolkit

> **Repository:** [`ZyntroAI/new-crystalcastle`](https://github.com/ZyntroAI/new-crystalcastle)  
> **Mission:** Unify Development, Security, AI, and Infrastructure into one intelligent platform

---

## ✨ Overview

**CrystalCastle** is a production-grade DevSecOps platform and AI-powered toolkit built for modern engineering teams. It combines **GitHub-native workflows**, **AI-assisted development**, **automated security & compliance**, and **Kubernetes-ready infrastructure** into a cohesive, developer-friendly foundation.

---

## 🧱 Core Pillars

| Pillar | Description |
|---|---|
| 🤖 **AI-Native** | Claude/Gemini/Groq integration · code review · doc generation · PR automation |
| 🔒 **Security-First** | Gitleaks · CodeQL · SBOM · Dependabot · OIDC · secrets scanning · branch protection |
| ⚡ **Full-Stack Ready** | FastAPI backend · React/TypeScript frontend · PostgreSQL · Redis · Traefik |
| ☸️ **Cloud-Native** | Helm charts · HPA/PDB · ExternalSecrets · Docker Compose · multi-stage builds |
| 📋 **Standards-Driven** | PR templates · workflows · linting · testing · coverage · release automation |
| 📚 **Knowledge-First** | Obsidian-ready docs · Miro/Figma/Notion specs · architecture guides |

---

## 📁 Repository Structure

```
new-crystalcastle/
├── .github/
│   ├── workflows/       # CI/CD · Test · Security · Release · Docs
│   ├── pull_request_template.md
│   └── labels.yml
├── .dola/               # Dola AI Skill Config
│   └── safety.yml
├── app/
│   ├── api/v1/          # REST API versioned
│   ├── schemas/         # Pydantic schemas
│   ├── models/          # ORM / DB models
│   └── core/            # Config · Security · AI Clients
├── infrastructure/
│   └── helm/            # Kubernetes Helm Charts
├── docs/
│   ├── STRIPE_ENTITLEMENTS.md
│   └── knowledge/       # Architecture · DevSecOps · Skills
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/             # Full-stack through Traefik
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── README.md
```

---

## 🚀 Key Features

### 🤖 AI Integration
- **Multi-Provider Router:** Claude · Gemini · Groq · OpenAI
- **Skills System:** Code review · Auto-fix · Doc sync · Safety guard
- **Prompt Caching & Long Context Optimization**
- **Streaming & Tool Use Ready**

### 🔐 DevSecOps
- **Automated Security Scanning:** Gitleaks · CodeQL · Dependency Review
- **Branch Protection:** 3 methods — UI · CLI · Terraform-as-Code
- **Secrets Management:** ExternalSecrets · no plaintext secrets
- **Signed Commits & OIDC**
- **SBOM & Compliance Reporting**

### ⚙️ CI/CD & Quality
- **Test Suite:** Unit · Integration · E2E through Traefik
- **Coverage:** Codecov integration
- **Lint & Type Checks**
- **Auto-Update Dependencies**
- **PR Validation & Auto-Fix Workflows**

### ☸️ Deployment
- **Multi-stage Docker Build**
- **Helm Charts with HPA & PDB**
- **PostgreSQL + Redis + Traefik Stack**
- **Supabase Auth (JWT/PKCE)**
- **Managed Kubernetes Ready (GKE/EKS/AKS)**

---

## 🛠️ Quick Start

### Prerequisites
```
Python 3.11+ · Docker & Docker Compose · Node 20+
```

### Local Development
```bash
# 1. Clone
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle

# 2. Setup environment
cp .env.example .env
# → Edit .env with your Supabase/Groq values

# 3. Install dependencies
pip install -r requirements.txt

# 4. Spin up stack
docker compose up -d postgres redis traefik

# 5. Run migrations
alembic upgrade head

# 6. Start API
uvicorn app.main:app --reload

# 7. Run tests
pytest tests/ -v
```

---

## 📊 Workflow Status

[![Test Suite](https://github.com/ZyntroAI/new-crystalcastle/actions/workflows/test-suite.yml/badge.svg)](https://github.com/ZyntroAI/new-crystalcastle/actions/workflows/test-suite.yml)
[![CodeQL](https://github.com/ZyntroAI/new-crystalcastle/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/ZyntroAI/new-crystalcastle/actions/workflows/codeql-analysis.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🤝 Contributing

1. Fork the repo 🔄
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request ✅

> All PRs automatically run tests, linting, and security scans — see `.github/PULL_REQUEST_TEMPLATE.md` for guidelines.

---

## 📜 License

**MIT License** — see [LICENSE](LICENSE) for details.

---

## 🌟 Roadmap

- [ ] 🤖 AI Code Review Agent
- [ ] 📊 Grafana Dashboard Stack
- [ ] ☁️ One-click Helm Deploy
- [ ] 📱 Desktop Client App
- [ ] 🔐 SSO / Enterprise Auth
- [ ] 📖 Interactive Docs Portal

---

<p align="center">
  <strong>Built with ❤️ by ZyntroAI</strong><br>
  <em>Intelligent DevSecOps Platform — Secure · Fast · Open</em>
</p>

---

✅ **Ready to use!** Save this as `README.md` in your repo root.

Would you like me to also add **Contributing Guide**, **Code of Conduct**, and **SECURITY.md** to complete the standard repo file set? 📄🔒
