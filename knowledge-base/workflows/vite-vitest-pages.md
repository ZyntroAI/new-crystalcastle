# 📦 Complete Bundle: Vite + Vitest Pages Workflow
**Saved to Knowledge Base:** `knowledge_base/workflows/vite-vitest-pages/` 📚✅

---

## 📁 File Structure
```
knowledge_base/workflows/vite-vitest-pages/
├─ README.md               # Overview & Usage
├─ .github/workflows/
│  └─ pages-ci.yml         # GitHub Actions CI
├─ vitest.config.pages.ts  # Vitest Test Config
├─ vite.pages.config.ts    # Vite Build Config
└─ package.json           # Scripts & Dependencies
```

---

## 📄 1. `README.md`
```markdown
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
```
```

---

## 🧩 2. `vitest.config.pages.ts`
```ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['pages/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['**/node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/pages',
      include: ['pages/**'],
      exclude: ['**/*.d.ts']
    },
    alias: {
      '@pages': resolve(__dirname, './pages'),
      '@lib': resolve(__dirname, './src/lib')
    }
  }
});
```

---

## 🛠️ 3. `vite.pages.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist/pages',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'pages/index.html'),
        about: resolve(__dirname, 'pages/about/index.html'),
        dashboard: resolve(__dirname, 'pages/dashboard/index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: '/pages/'
  }
});
```

---

## 🤖 4. `.github/workflows/pages-ci.yml`
```yaml
name: Vite Pages CI
run-name: 🧪 Test & Build Pages

on:
  push: { branches: [main, dev], paths: ["pages/**", "vite.*", "vitest.*"] }
  pull_request: { branches: [main] }
  workflow_dispatch: {}

env:
  NODE: "20"
  PNPM: "^9"
  CI: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4; with: {version: ${{env.PNPM}}}
      - uses: actions/setup-node@v4; with: {node-version: ${{env.NODE}}}
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec vitest run --config vitest.config.pages.ts
      - uses: codecov/codecov-action@v4; with: {file: ./coverage/pages/coverage-final.json}

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm exec vite build --config vite.pages.config.ts
      - uses: actions/upload-pages-artifact@v3; with: {path: ./dist/pages}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions: {pages: write, id-token: write}
    environment: {name: github-pages}
    steps:
      - uses: actions/deploy-pages@v4
```

---

## 📦 5. `package.json` Snippet
```json
{
  "scripts": {
    "test:pages": "vitest run --config vitest.config.pages.ts",
    "build:pages": "vite build --config vite.pages.config.ts",
    "dev:pages": "vite serve --config vite.pages.config.ts"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^2.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "jsdom": "^24.0.0"
  }
}
```

---

✅ **Saved & Ready**  
Location: `knowledge_base/workflows/vite-vitest-pages/`  
Status: Complete • Reconstructed • Production‑Ready 🚀

Want me to **download as ZIP** or **add to agent skill registry**? 📥🧠
