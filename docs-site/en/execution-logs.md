# Execution logs

Every workflow and job run is recorded. The log endpoint is how you find out
what happened without reading server stdout.

## Reading the log

```bash
curl -s "http://localhost:8000/api/execution/logs?limit=10"
```

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `limit` | integer | `50` | Number of records to return |

The response is an array of `ExecutionLogResponse`, newest first.

## Filtering client-side

There is no server-side filter yet, so narrow the result locally:

```python
import httpx

with httpx.Client(base_url="http://localhost:8000") as client:
    logs = client.get("/api/execution/logs", params={"limit": 200}).json()

failures = [row for row in logs if row.get("status") not in ("success", "completed")]
for row in failures:
    print(row.get("job_id"), row.get("status"), row.get("message"))
```

!!! warning "`limit` is a hard cap, not a page"
    `limit` controls how many rows come back; it is not a cursor. To walk the
    whole history, raise `limit` and slice in your client, or add a proper
    pagination parameter server-side.

## Using the log to debug

1. Reproduce the failure with a manual execute call.
2. Read the newest log entries — the most recent run is first.
3. Note the status and message; both are what the scheduler recorded.

If the log is empty but you know a run happened, check that the scheduler is
enabled (`SCHEDULER_ENABLED`) and that the database connection points where you
think it does.
