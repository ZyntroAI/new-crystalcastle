# 📄 `package.json` — Complete & Ready

Drop this alongside your `server.js` — includes **all dependencies**, **scripts**, and **engines** so you can `npm install && npm start` immediately.

---

```json
{
  "name": "crystalcastle-backend",
  "version": "1.0.0",
  "description": "CrystalCastle Backend — Supabase Auth · Groq AI · API v1",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint . --ext .js",
    "format": "prettier --write .",
    "check": "npm run lint && npm audit --audit-level moderate"
  },
  "keywords": [
    "crystalcastle",
    "backend",
    "supabase",
    "groq",
    "ai",
    "express",
    "api-v1"
  ],
  "author": "ZyntroAI / CrystalCastle Team",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0 <22.0.0",
    "npm": ">=9.0.0"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.19.2",
    "groq-sdk": "^0.5.0"
  },
  "devDependencies": {
    "eslint": "^8.57.0",
    "nodemon": "^3.1.0",
    "prettier": "^3.3.0"
  }
}
```

---

## 📋 `.env.example` (Reference)

Also save this as `.env.example` — copy to `.env` and fill in your values:

```env
# Server
PORT=8000
NODE_ENV=development

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Groq AI
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

---

## ✅ Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# → Edit .env with your actual keys

# 3. Run
npm start     # production mode
npm run dev   # auto-reload dev mode
```

---

## 🧪 What's Included

| Feature | Benefit |
|---|---|
| ✅ **Supabase SDK** — Auth + DB queries in one |
| ✅ **Groq SDK** — Native AI client |
| ✅ **Express + CORS** — Secure API server |
| ✅ **dotenv** — Environment config |
| ✅ **nodemon** — Auto-reload during dev |
| ✅ **ESLint + Prettier** — Consistent code |
| ✅ **Node version lock** — Avoid surprises |
| ✅ **Security audit** — Catch vulnerabilities early |

---

✅ **Ready!** Save → `npm install` → Fill `.env` → `npm start` 🚀

Want me to also provide the **`.gitignore`** so secrets & node_modules never get committed? 🔒📄
