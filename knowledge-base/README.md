# ⚡ Vite + Vitest — Pages Workflow
**Purpose:** Test, build & deploy multi‑page sites/apps with dedicated `pages/` folder
**Stack:** Vite 5 • Vitest 2 • Node 20+ • PNPM

## ✅ Features
- Separate test/build for `pages/**`
- Isolated coverage → `coverage/pages/`
- Multi‑page entry points
- GitHub Actions: Test → Build → Deploy
- JSDom browser environment
- Path aliases: `@pages`, `@lib`

## 🚀 Quick Start
```bash
# Install
pnpm install

# Test pages
pnpm test:pages

# Build pages
pnpm build:pages

# Dev mode
pnpm dev:pages
