# CrystalCastle

Full-stack platform by ZyntroAI for documentation, tickets, and AI-assisted research workflows. This repository is a **monorepo under active consolidation** — it currently hosts several workstreams and a large amount of scratch/archival material at the root that is being organized into the `backend/`, `frontend/`, and `docs/` trees.

## Current state

> **Heads-up:** the repository root still contains many loose files (screenshots, `.docx` notes, stray workflow YAMLs, `.md` snapshots, merged-in component snippets). Treat anything outside the directories below as **scratch/archival**, not part of the running platform. Cleaning this up is tracked work.

## What actually lives here

### `backend/` — Node/Express API (`crystalcastle-backend`)
- **Runtime:** Express + Supabase Auth + Groq AI (`backend/server.js` is the entry — `npm start` runs it)
- **Config:** `.env.example`, Dockerfile, prisma schema, Redis/auth/gateway modules under `backend/src`
- **Scripts:** `start` (node server.js), `dev` (nodemon), `lint` (eslint), `check` (lint + npm audit)
- Mixed NestJS scaffold artifacts (`nest-cli.json`, `src/app.module.ts`) coexist with the Express server — consolidation in progress.

### `frontend/` — canvas/web app components
- Contains React/TSX source (`Canvas.tsx`, `Toolbar.tsx`, `ComponentLibrary.tsx`, layouts) under `frontend/src/components`
- **No standalone package.json/Vite build here yet** — components are being migrated in; currently not independently runnable.

### `src/` — legacy React work
- Vite React template content (`main.tsx`, `App.tsx`) that was merged in and is **not wired to a runnable build**; `index.html` at root is a static snapshot rather than the app entry. Being reconciled.

### `docs/`
- Working documentation and knowledge-base material (see `docs/` and `docs/kb/`).

### `.github/workflows/`
- Many workflow files, several copied from a FastAPI boilerplate and **mismatched to this Node/Express + React stack**. The active set for CI on this repo is being corrected; until then, workflow checks on PRs are **not reliable signals**.

## Getting started
```bash
# Backend
cd backend
cp .env.example .env   # fill in Supabase/Groq keys
npm install
npm run dev
```

## Notes
- This is an honest snapshot of the repo as of September 2026. Sections describing `app/`, `infrastructure/helm/`, Kubernetes charts, and a full DevSecOps layout **do not exist here yet** and were removed from this README to avoid implying otherwise.
