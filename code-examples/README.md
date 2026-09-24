# ZyntroAI API — code examples

Runnable examples for the Cron Automation System API, in JavaScript, Python,
TypeScript and cURL.

Every example targets the endpoints defined in `backend/routers/`. Nothing here
is aspirational — each call maps to a real route.

## Layout

```
code-examples/
├── config/         shared configuration
├── javascript/     Node 18+ (built-in fetch, no dependencies)
├── python/         httpx + requests
├── typescript/     typed client, compiled with tsc
└── curl/           shell scripts
```

## Quick start

See [QUICK-SETUP.md](QUICK-SETUP.md). The short version:

```bash
export ZYNTRO_API_URL=http://localhost:8000
curl -s "$ZYNTRO_API_URL/health"
```

## Requirements

| Language | Needs |
|---|---|
| JavaScript | Node 18 or newer — no `npm install` required |
| Python | `httpx` (preferred) or `requests` |
| TypeScript | `typescript`, and `@types/node` for the `fetch` typings |
| cURL | `curl` and `bash` |

## Configuration

All examples read `ZYNTRO_API_URL`, defaulting to `http://localhost:8000`.
No example contains a credential. If authentication is enabled on your
instance, pass a token via `ZYNTRO_API_KEY` — never hardcode it.
