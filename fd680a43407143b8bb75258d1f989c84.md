# Architecture Reference — CrystalCastle X

> โหลดไฟล์นี้เมื่อ: แก้ code ใน `src/`, `app/`, หรือถามเกี่ยวกับโครงสร้าง repo / วิธีรัน local

## Stack สรุป

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind, pnpm, Node 22 |
| Backend | Python 3.12, FastAPI, Uvicorn (4 workers) |
| AI Providers | OpenAI, Gemini, Mistral (ผ่าน abstraction `src/ai/providers/`) |
| DB / Cache | PostgreSQL 16, Redis 7 (AOF) |
| Queue | Celery + Redis (broker db=1, result db=2) |
| Infra | Docker → GHCR → sandbox host (preview) / Vercel (production) |
| Reverse proxy | NGINX + Let's Encrypt (certbot auto-renew) |

## Directory Layout

```
.
├── src/                          # Next.js frontend
│   ├── ai/
│   │   ├── prompts/               # prompt templates (versioned, .md/.txt)
│   │   ├── pipelines/             # orchestration: video → render → captions
│   │   └── providers/             # ⚠️ LLM abstraction — ห้ามเรียก SDK โดยตรง
│   ├── core/
│   │   ├── video/                 # upload, transcode, thumbnail
│   │   ├── render/                # render engine (FFmpeg / WebGL)
│   │   └── captions/              # caption generation + styling
│   ├── app/                       # Next.js App Router pages
│   └── components/
├── app/                           # Python FastAPI backend
│   ├── main.py                    # uvicorn entry, GET /health
│   ├── api/                       # routers
│   ├── core/                      # config, security, deps
│   ├── models/                    # SQLAlchemy / Pydantic
│   ├── services/                  # business logic
│   └── worker.py                  # Celery app instance
├── scripts/
│   └── ai_repair.py               # AI auto-repair agent (เรียกจาก workflow)
├── docker-compose.yml             # production stack (api+db+redis+nginx)
├── docker-compose.sandbox.yml     # preview per-PR stack
├── Dockerfile                     # multi-stage, non-root (appuser UID 1000)
├── .github/workflows/             # 40+ workflows (ดู workflows.md ก่อนเพิ่ม)
└── .claude/skills/crystalcastle-dev/
```

## Data Flow (หลัก)

```
User upload video
   │
   ▼
Next.js → POST /api/v1/jobs  (FastAPI)
   │
   ▼
Celery task (broker=Redis db1)
   │
   ├─ core/video: transcode → thumbnail
   ├─ ai/pipelines: เอา prompt จาก ai/prompts → เรียกผ่าน ai/providers (failover)
   ├─ core/captions: generate + style
   └─ core/render: compose final video
   │
   ▼
บันทึกลง PostgreSQL + storage (uploads volume) → notify frontend (SSE/poll)
```

## รัน Local

```bash
# 1. infra
docker compose up -d db redis      # postgres:5432, redis:6379

# 2. backend
cd app && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env               # ใส่ DB_*, REDIS_*, *_API_KEY
uvicorn app.main:app --reload --port 8000
# health: http://localhost:8000/health

# 3. frontend
pnpm install --frozen-lockfile
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
pnpm dev                           # http://localhost:3000

# 4. celery worker (ถ้ามี background task)
celery -A app.worker worker --loglevel=info
```

## Ports & Endpoints

| Service | Port | Note |
|---|---|---|
| Frontend (Next.js) | 3000 | `NEXT_PUBLIC_*` เท่านั้นที่เห็นฝั่ง browser |
| API (FastAPI) | 8000 | `GET /health` — ใช้โดยทุก health check |
| PostgreSQL | 5432 | internal only (ไม่เปิดออก) |
| Redis | 6379 | มี requirepass; db0=cache, db1=celery broker, db2=result |
| NGINX (prod) | 80/443 | จุดเข้าเดียว; `/api/*` → api, `/` → frontend |

## Build & Deploy Targets

- **PR** → preview sandbox (`pr-<n>.preview.yourdomain.com`) + Lighthouse + Playwright e2e
- **push develop** → build image `:sha-<short>` → GHCR → sandbox deploy → health check → (fail → auto-repair)
- **push main** → production deploy (Vercel frontend + docker deploy backend) + release drafter

## กฎสำคัญ

- ห้าม hardcode LLM model/key ใน code — อ่านจาก env + ผ่าน `src/ai/providers/`
- Prompt templates อยู่ใน `src/ai/prompts/` เป็นไฟล์ (versioned) — ไม่เขียนในโค้ด
- ทุก async job ต้องผ่าน Celery — ห้าม block request ด้วยการเรียก LLM โดยตรง
- ทุก service ต้องมี `GET /health` และ healthcheck ใน compose/workflow
