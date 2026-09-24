# API reference

Base URL in local development: `http://localhost:8000`.

Every endpoint below is taken from the running router definitions in
`backend/routers/`.

## Health

### `GET /health`

Liveness probe. Always unauthenticated.

```bash
curl -s http://localhost:8000/health
```

```json
{"status": "healthy", "scheduler_running": true}
```

---

## Workflows

### `GET /api/workflows/`

List every workflow. Response model: `list[WorkflowResponse]`.

```bash
curl -s http://localhost:8000/api/workflows/
```

### `POST /api/workflows/{workflow_id}/execute`

Run a workflow immediately. Response model: `ExecutionResult`.

```bash
curl -s -X POST http://localhost:8000/api/workflows/1/execute
```

### `POST /api/workflows/{workflow_id}/toggle`

Enable or disable a workflow. Response model: `WorkflowResponse`.

```bash
curl -s -X POST http://localhost:8000/api/workflows/1/toggle
```

---

## Cron jobs

### `POST /api/jobs/{job_id}/execute`

Run a job immediately. Response model: `ExecutionResult`.

```bash
curl -s -X POST http://localhost:8000/api/jobs/1/execute
```

### `POST /api/jobs/{job_id}/toggle`

Enable or disable a job. Response model: `CronJobResponse`.

```bash
curl -s -X POST http://localhost:8000/api/jobs/1/toggle
```

---

## Execution logs

### `GET /api/execution/logs`

Read execution history, newest first. Response model:
`list[ExecutionLogResponse]`.

| Query parameter | Type | Default | Purpose |
|---|---|---|---|
| `limit` | integer | `50` | Maximum number of records to return |

```bash
curl -s "http://localhost:8000/api/execution/logs?limit=10"
```

---

## Errors

FastAPI returns standard status codes:

| Code | Meaning |
|---|---|
| `200` | Success |
| `404` | The workflow, job, or record does not exist |
| `422` | Validation error — check the field types in your payload |
| `500` | Unhandled server error; check the logs |
