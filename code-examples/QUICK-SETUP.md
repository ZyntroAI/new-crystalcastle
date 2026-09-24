# Quick setup

## 1. Make sure the API is running

```bash
curl -s http://localhost:8000/health
```

Expect `{"status": "healthy", "scheduler_running": true}`. If that fails, start
the backend first — see the documentation site's Getting started page.

## 2. Point the examples at it, if not using localhost

```bash
export ZYNTRO_API_URL=https://your-instance.example.com
```

## 3. Pick a language

### JavaScript (Node 18+)

```bash
cd code-examples/javascript
node workflows.js
```

### Python

```bash
cd code-examples/python
pip install httpx
python workflows.py
```

### TypeScript

```bash
cd code-examples/typescript
npm install
npx tsc --noEmit        # type-check only
npx tsx workflows.ts    # run it
```

### cURL

```bash
cd code-examples/curl
bash health.sh
bash workflows.sh
```

## Note on the example IDs

The workflow and job examples use IDs `1`. Replace them with an ID that exists
in your database — list them first with `GET /api/workflows/`.
