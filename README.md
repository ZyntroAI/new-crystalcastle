# New-CrystalCastle

*Crystal Castle* is a full-stack platform built by ZyntroAI for managing documentation, tickets, and AI-powered research workflows. It uses a federated GraphQL architecture with an onboarding system, CI/CD, and automation tooling.

### *Tech Stack*
- *Language*: TypeScript, JavaScript, Shell
- *Gateway*: GraphQL Hive Gateway with subgraphs for `docs` and `tickets`
- *Frontend*: React components like `OnboardingWizard` with validation
- *Backend*: Database schemas for Deeper Research System
- *CI/CD*: GitHub Actions for build, deploy, staging, and auto-updating dependencies
- *Tooling*: AI-based PR review script with OpenAI
 1d3c552e6d18aee786d82cd3

### *Key Features*
1. *GraphQL Hive Gateway* 
   Federated gateway config in `backend/gateway.config.ts` with plugins for auth, rate limiting, caching, and OpenTelemetry

2. *Onboarding Wizard* 
   Multi-step onboarding component that validates project type and feature selection. Types documented in `src/types/Readme.md`

3. *Deeper Research System* 
   SQL DDL + JSON schema for researchers, projects, topics, sources, and findings

4. *CI/CD & Automation*
   - `ci.yml`: Staging deploys to Vercel + audit trail TH/EN
   - `auto-update-package.yml`: Weekly npm lockfile updates
   - `build-vsix.yml`: Lint + build on push/PR
   - `scripts/build.sh`: Project setup and production build
   - `scripts/ai-pr-review.js`: Automated AI code reviews for PRs

5. *Docs Structure* 
   Reorganized to fix path length errors. Main docs in `docs/` and `docs/kb/`
 1d3c552e7b196d1886d8aee788a78bfb2cd31f2d

### *Getting Started*
# 1. Clone the repo
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle

# 2. Install dependencies
npm install

# 3. Build for production
./scripts/build.sh
### *Project Structure*
.
├── backend/
│ └── gateway.config.ts # GraphQL Hive gateway config
├── src/
│ ├── components/
│ │ └── OnboardingWizard.tsx # Onboarding flow with validation
│ └── types/
│ └── Readme.md # Onboarding type docs
├── docs/
│ ├── howtos.md
│ └── kb/ # Knowledge base
├──.github/workflows/
│ ├── ci.yml # Staging + deploy
│ ├── auto-update-package.yml # Weekly dependency update
│ └── build-vsix.yml # Build + lint
└── scripts/
    ├── build.sh # Setup + build
    └── ai-pr-review.js # AI PR reviewer
### *Environment Variables*
Set these for local dev and CI:
- `GITHUB_TOKEN` - for CI and AI PR review
- `OPENAI_API_KEY` - for AI PR review
- `VERCEL_TOKEN` - for deployment

### *Contributing*
1. Push to `staging` branch for auto deploy
2. PRs get AI review comments automatically
 86d82cd3

### *License*
MIT
