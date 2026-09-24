# Configuration

Configuration is read from the environment. `.env.example` in the repository
root lists every variable with placeholder values; copy it to `.env` and fill
in real ones.

## Application

| Variable | Purpose | Example |
|---|---|---|
| `APP_NAME` | Display name | `New Crystal Castle` |
| `APP_ENV` | Environment label | `production` |
| `NODE_ENV` | Node environment | `production` |
| `NEXT_PUBLIC_APP_URL` | Frontend base URL | `https://your-domain.com` |
| `NEXT_PUBLIC_API_URL` | API base URL (browser) | `https://your-domain.com/api` |
| `API_URL` | API base URL (server) | `https://your-domain.com/api` |

## Authentication and security

| Variable | Purpose |
|---|---|
| `API_KEY` | Client key for API access |
| `API_SECRET` | Client secret — server-side only |
| `JWT_SECRET` | Signing secret for access tokens |
| `JWT_EXPIRES_IN` | Access token lifetime, e.g. `24h` |
| `REFRESH_TOKEN_SECRET` | Signing secret for refresh tokens |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh lifetime, e.g. `7d` |
| `DOLA_JWT_SECRET` | Separate signing secret for the DOLA integration |

!!! danger "Never commit real secrets"
    Every value above is a credential. `.env` is gitignored; keep it that way.
    If a secret has ever been committed, **rotate it** — deleting the file does
    not remove it from history.

## Database

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Async PostgreSQL connection string |

The application creates its tables on startup via SQLAlchemy metadata, so a
fresh, empty database is enough to get going.

## Scheduler

| Variable | Purpose |
|---|---|
| `SCHEDULER_ENABLED` | Start the background scheduler on boot |

When `SCHEDULER_ENABLED` is true, the scheduler initialises and starts during
the FastAPI lifespan hook, and stops cleanly on shutdown.

## Building this documentation

Core build dependencies:

```bash
pip install -r requirements.txt
mkdocs serve
```

### Optional PDF export

PDF export needs WeasyPrint, which depends on system libraries:

```bash
# Debian / Ubuntu
sudo apt-get install -y libpango-1.0-0 libpangocairo-1.0-0 \
  libgdk-pixbuf-2.0-0 libffi-dev

pip install -r requirements-pdf.txt
```

PDF export is deliberately kept out of `requirements.txt` so that a
documentation build never fails on a missing native library.
