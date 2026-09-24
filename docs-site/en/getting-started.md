# Getting started

This walks you from a clone to a running instance answering requests.

## Prerequisites

- Python 3.11 or newer
- PostgreSQL 14 or newer
- `git`

## 1. Clone and enter the repository

```bash
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle
```

## 2. Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
```

## 3. Install the backend dependencies

Backend requirements live at `backend/requirements.txt`:

```bash
pip install -r backend/requirements.txt
```

!!! note
    There is no `requirements.txt` at the repository root. Several CI
    workflows reference one, which is why the Python jobs fail before they
    start — see [Troubleshooting](troubleshooting.md).

## 4. Configure the environment

```bash
cp .env.example .env
```

Open `.env` and set at minimum `DATABASE_URL` and `JWT_SECRET`. Never commit
this file — `.gitignore` already excludes it.

## 5. Start the server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 6. Confirm it is alive

```bash
curl -s http://localhost:8000/health
```

You should get:

```json
{"status": "healthy", "scheduler_running": true}
```

## 7. Explore the generated reference

FastAPI serves interactive docs for free:

- Swagger UI — <http://localhost:8000/docs>
- ReDoc — <http://localhost:8000/redoc>

## Next

- [Configuration](configuration.md) — the environment variables that matter
- [API reference](api-reference.md) — every endpoint
