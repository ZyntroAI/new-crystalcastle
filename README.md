# 🏰 New CrystalCastle — ZyntroAI

> AI-Native full-stack platform · FastAPI · React + TypeScript · Supabase · GitHub Actions

[![CI](https://github.com/ZyntroAI/new-crystalcastle/actions/workflows/ci.yml/badge.svg)](https://github.com/ZyntroAI/new-crystalcastle/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📋 สารบัญ

- [ภาพรวม](#-ภาพรวม)
- [โครงสร้างที่จัดเก็บจริง](#-โครงสร้างที่จัดเก็บจริง)
- [เริ่มต้นอย่างรวดเร็ว](#-เริ่มต้นอย่างรวดเร็ว)
- [การพัฒนา](#-การพัฒนา)
- [ทดสอบ](#-ทดสอบ)
- [CI/CD และ Workflows](#-cicd-และ-workflows)
- [Skills Registry](#-skills-registry)
- [Security Suites](#-security-suites)
- [Knowledge Base](#-knowledge-base)
- [เอกสารเพิ่มเติม](#-เอกสารเพิ่มเติม)
- [ข้อควรระวังด้านความปลอดภัย](#-ข้อควรระวังด้านความปลอดภัย)
- [การมีส่วนร่วม](#-การมีส่วนร่วม)
- [ใบอนุญาต](#-ใบอนุญาต)

---

## 🌟 ภาพรวม

**New CrystalCastle** เป็น monorepo ที่รวม backend, frontend, ชุด security tooling, AI skills และ
knowledge base ไว้ในที่เดียว — ออกแบบมาให้ agent อ่านและแก้ไขได้โดยตรง

- **Backend** — FastAPI + SQLAlchemy (async) + APScheduler สำหรับงาน cron/scheduled jobs
- **Frontend** — React + TypeScript + Vite + Tailwind (shadcn/ui components)
- **Database & Auth** — Supabase (PostgreSQL)
- **DevOps** — GitHub Actions 29 workflows · CodeQL · Dependabot
- **Agent tooling** — skills registry, security suites (CWE-1321, CWE-1333), knowledge base

> หมายเหตุ: รีโปนี้มีไฟล์จำนวนมากที่ยังไม่จัดหมวด (ดู [โครงสร้างที่จัดเก็บจริง](#-โครงสร้างที่จัดเก็บจริง))
> การย้ายไฟล์ควรทำเป็น PR แยก เพื่อไม่ให้ประวัติ git ปนกับงานเอกสาร

---

## 🏗️ โครงสร้างที่จัดเก็บจริง

```
new-crystalcastle/
├── backend/                 # FastAPI service
│   ├── main.py              # entry point (uvicorn)
│   ├── models.py            # SQLAlchemy models
│   ├── Schemas.py           # Pydantic schemas
│   ├── routers/             # workflows.py, jobs.py, ececution.py
│   ├── services/            # scheduler.py, executor.py
│   ├── src/                 # Nest/Prisma worker (auth, redis, prisma)
│   ├── prisma/
│   ├── container/, containers/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── Readme.md            # รายละเอียด backend
├── frontend/                # React component library / UI layer
│   └── src/components/
├── src/                     # React app หลัก (Vite)
│   ├── App.tsx, main.tsx
│   ├── pages/               # Login, Register, Home, Canvas, …
│   ├── components/
│   ├── hooks/, lib/, util/
│   ├── api/, types/, tests/
│   └── payment/
├── skills/                  # AI skill registry
│   ├── index.json           # registry (8 entries)
│   ├── crystalcastlex-skill-suite/
│   ├── fig-suite/, fig-best-practices-suite/
│   ├── supabase-agent-suite/
│   ├── python-dev/, ci-troubleshooter/
│   └── workflow-permission-check/
├── security/                # security suites
│   ├── cwe1321/             # Prototype Pollution Protection (JS + Python)
│   └── cwe1333/             # ReDoS detector (JS + Python)
├── ci/                      # workflow repair bundle
│   ├── install-repaired-workflows.sh
│   └── repaired-workflows/
├── knowledge-base/          # reference material
│   ├── README.md            # index
│   ├── mcp-tools/
│   ├── steam-web-api/
│   └── workflows/
├── docs/                    # คู่มือ, cheatsheet, runbook
├── .github/
│   ├── workflows/           # 29 workflow files
│   ├── actions/, jobs/, helpers/, rulesets/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
├── docker-compose.yml
├── ARCHITECTURE.md
├── CHANGELOG.md
└── README.md
```

---

## ⚡ เริ่มต้นอย่างรวดเร็ว

### ข้อกำหนดเบื้องต้น

- Python 3.12+ (CI รัน 3.10 / 3.11 / 3.12)
- Node.js 20+ & npm
- บัญชี Supabase (สำหรับฐานข้อมูล)

### 1. โคลนรีโป

```bash
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle
```

### 2. Backend

```bash
cd backend

python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env              # แล้วกรอกค่าจริง
uvicorn main:app --reload
```

เปิดเอกสาร API อัตโนมัติที่ http://localhost:8000/docs

### 3. Frontend

```bash
cd ../                       # กลับไปที่ root ของรีโป
npm install
npm run dev
```

---

## 🔧 การพัฒนา

### Backend

Dependencies หลัก (`backend/requirements.txt`):

| Package | Version |
| --- | --- |
| fastapi | 0.111.0 |
| uvicorn[standard] | 0.30.1 |
| sqlalchemy | 2.0.30 |
| pydantic | 2.7.4 |
| pydantic-settings | 2.3.3 |
| apscheduler | 3.10.4 |
| python-dotenv | 1.2.2 |
| aiosqlite | 0.20.0 |

Scheduler ถูกเปิดผ่าน `settings.SCHEDULER_ENABLED` ใน `backend/main.py` — เมื่อเปิด ระบบจะ
`init_scheduler()` และ `start_scheduler()` ตอน startup

> ⚠️ **หมายเหตุจากการตรวจสอบ (2026-09-24):** `backend/main.py` import `config`, `database`
> และ `routers.execution` แต่ในรีโปยังไม่มีไฟล์ `backend/config.py`, `backend/database.py`
> และไฟล์ router ชื่อ `ececution.py` (สะกดไม่ตรงกับที่ import) — backend จะรันไม่ขึ้นจนกว่าจะแก้
> ให้ชื่อไฟล์ตรงกันและเพิ่มโมดูลที่ขาด

### สคริปต์ช่วยงาน

ที่ root ของรีโปมีสคริปต์นับและจัดการไฟล์:

```bash
npm run scripts:list        # list ไฟล์
npm run scripts:stats       # สถิติ
npm run scripts:count       # นับจำนวนไฟล์
npm run scripts:count:json  # นับแบบ JSON
```

---

## 🧪 ทดสอบ

### Backend

```bash
cd backend
pytest ../tests --cov=. --cov-report=term
```

### Frontend

```bash
npm run test
```

### ตรวจคุณภาพโค้ด

```bash
# Backend
ruff check .
black --check .

# Frontend
npm run lint
```

---

## 🔁 CI/CD และ Workflows

รีโปมี **29 workflow files** ใต้ `.github/workflows/` ครอบคลุม CI, security, release และ automation:

- **CI** — `ci.yml`, `FastAPI_CI.yaml`, `Python-CI.yml`, `CICD_Pipeline.yaml`, `test.yml`
- **Security** — `codeql.yml`, `dependency-review.yml`, `permission-check-tests.yml`
- **Release / Publish** — `release.yml`, `npm-publish.yml`, `npm-publish-github-packages.yml`
- **Supabase** — `supabase-branch.yml`, `supabase-deploy.yml`, `supabase-notify.yml`
- **Automation** — `dependabot-automerge.yml`, `auto-update-package.yml`, `open-issue.yml`
- **Quality** — `rubric-scoring.yml`, `scorecsv.yml`, `pytest-markers.yml`, `stacked-pr-check.yml`

Workflow ที่ซ่อมแล้ว (พร้อมสำหรับปัญหา YAML/pin) อยู่ใน `ci/repaired-workflows/`
พร้อมสคริปต์ติดตั้ง:

```bash
bash ci/install-repaired-workflows.sh
```

> ทุก GitHub Action ต้องปักหมุดด้วย commit SHA เต็ม 40 ตัวอักษร ไม่ใช่ tag
> (ดู checklists ใน PR template) — การ push ไฟล์ใต้ `.github/workflows/` ต้องมี
> `workflows` permission บน GitHub App

---

## 🧩 Skills Registry

`skills/index.json` เป็น registry กลางของ skills ทั้งหมด (8 entries):

| Skill | Path | หน้าที่ |
| --- | --- | --- |
| crystalcastlex-skill-suite | `skills/crystalcastlex-skill-suite` | ชุด skill หลักของ CrystalCastleX |
| cwe1321-protection-suite | `security/cwe1321` | ตรวจ/ป้องกัน Prototype Pollution |
| cwe1333-redos-detector | `security/cwe1333` | ตรวจ ReDoS |
| python-dev | `skills/python-dev` | มาตรฐานงาน Python |
| supabase-agent-suite | `skills/supabase-agent-suite` | งาน Supabase |
| fig-best-practices-suite | `skills/fig-best-practices-suite` | best practices ของ Fig |
| fig-suite | `skills/fig-suite` | ชุด skill รวมของ Fig |
| workflow-permission-check | `skills/workflow-permission-check` | ตรวจสิทธิ์เขียน workflow |

---

## 🛡️ Security Suites

### CWE-1321 — Prototype Pollution Protection

`security/cwe1321/` — JS + Python

- `js/sanitize.js`, `js/eslint-rules.json`, `js/semgrep-cwe1321-js.yml`, `js/codeql-query.ql`
- `python/safe_parser.py`, `python/semgrep-cwe1321-py.yml`, `python/bandit.config`
- Tests: `tests/sanitize.test.mjs`, `tests/test_safe_parser.py`
- เอกสาร: `README.md`, `SKILL.md`, `TEST-REPORT.md`, `manifest.json`

### CWE-1333 — ReDoS Detector

`security/cwe1333/` — JS + Python

- `js/index.js`, `js/lib/rules/detect-redos.js`, tests ใน `js/test/`
- `python/redos_detector.py`, `tests/test_redos_detector.py`

---

## 📚 Knowledge Base

`knowledge-base/` เป็นที่เก็บ reference material ที่นิ่งแล้ว มี index อยู่ที่
[`knowledge-base/README.md`](./knowledge-base/README.md):

- `mcp-tools/` — registry และหมวดหมู่ของ MCP tools (development, data, collaboration, marketing, ai-core)
- `steam-web-api/` — infographic + สคริปต์สร้างรูป
- `workflows/` — บันทึกเรื่อง Vite/Vitest Pages

---

## 📁 เอกสารเพิ่มเติม

| เอกสาร | คำอธิบาย |
| --- | --- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | สถาปัตยกรรมแพลตฟอร์ม (feature flags, telemetry, deploy) |
| [`CHANGELOG.md`](./CHANGELOG.md) | ประวัติการเปลี่ยนแปลงจาก PR ที่ merge แล้ว (ใหม่สุดก่อน) |
| [`TOOLS.md`](./TOOLS.md) | เครื่องมือที่ใช้ในโปรเจกต์ |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | คู่มือผู้ร่วมพัฒนา |
| [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) | จรรยาบรรณชุมชม (Contributor Covenant 2.1) |
| [`SECURITY.md`](./SECURITY.md) | นโยบายความปลอดภัยและการรายงานช่องโหว่ |
| `backend/Readme.md` | รายละเอียด backend / cron automation |
| `docs/` | คู่มือการใช้งาน, cheatsheet, runbook ต่าง ๆ |

---

## ⚠️ ข้อควรระวังด้านความปลอดภัย

**รีโปนี้เป็น public** — ข้อมูลทุกอย่างใน PR, issue และ commit จะมองเห็นได้จากอินเทอร์เน็ต

สิ่งที่ตรวจพบและควรแก้:

- ไฟล์ env บางไฟล์ถูก track อยู่ใน git ทั้งที่ควรอยู่ใน `.gitignore`:
  `.env`, `.env.local`, `backend/.env`, `backend/CodeRabbit/.env`, `pdf-convert-ocr/.env`
- ตรวจว่าไม่มี API key, token หรือ secret จริงอยู่ในไฟล์เหล่านั้น แล้ว rotate คีย์ที่อาจรั่ว
- ลบไฟล์ออกจาก index ด้วย `git rm --cached <file>` และเพิ่มใน `.gitignore` เป็น PR แยก

แนวปฏิบัติ:

- ห้าม commit secret/key ใด ๆ ลงรีโป
- ก่อนเปิด PR ทุกครั้ง ให้ยืนยันว่าไม่มีข้อมูลภายใน (checklist, อีเมล, ราคา, billing) ติดไปกับ PR body

---

## 🤝 การมีส่วนร่วม

1. Fork รีโป → สร้างสาขา (`git checkout -b feat/your-idea`)
2. Commit (`git commit -m "feat: ..."`) — ใช้ Conventional Commits (ดู `.Conventional_Commits.md`)
3. ทดสอบให้ผ่าน → เปิด Pull Request (ใช้เทมเพลต `.github/PULL_REQUEST_TEMPLATE.md`)
4. รอตรวจสอบ & ผ่านการรวม

**ข้อกำหนดของสาขา** — รีโปนี้มี ref `docs` และ `fix` อยู่แล้ว การ push สาขาที่ขึ้นต้นด้วย
`docs/...` หรือ `fix/...` จะถูกปฏิเสธด้วย `directory file conflict` ให้ใช้ prefix อื่น เช่น
`feat/`, `chore/` หรือ `fig/`

---

## 📄 ใบอนุญาต

MIT License — ดู [`LICENSE`](./LICENSE)

© 2026 ZyntroAI
