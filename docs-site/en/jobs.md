# Cron jobs

A **cron job** is a single scheduled unit of work. Jobs are independently
triggerable, independent of the workflows that may reference them.

## Running a job now

```bash
curl -s -X POST http://localhost:8000/api/jobs/1/execute
```

Returns an `ExecutionResult`.

## Pausing and resuming a job

```bash
curl -s -X POST http://localhost:8000/api/jobs/1/toggle
```

Returns the updated `CronJobResponse`, whose state reflects the new value.

## Jobs versus workflows

| | Workflow | Cron job |
|---|---|---|
| Scope | Multi-step automation | Single scheduled unit |
| Trigger | `/api/workflows/{id}/execute` | `/api/jobs/{id}/execute` |
| Response model | `WorkflowResponse` | `CronJobResponse` |
| Toggle endpoint | `/api/workflows/{id}/toggle` | `/api/jobs/{id}/toggle` |

## A full round trip

```python
import httpx

BASE = "http://localhost:8000"

with httpx.Client(base_url=BASE, timeout=30) as client:
    # Run it
    result = client.post("/api/jobs/1/execute").json()
    print("executed:", result)

    # Stop it running again until we say so
    paused = client.post("/api/jobs/1/toggle").json()
    print("state now:", paused)

    # Read what happened
    for entry in client.get("/api/execution/logs", params={"limit": 5}).json():
        print(entry)
```
