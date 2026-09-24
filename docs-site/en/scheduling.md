# Scheduling

The scheduler runs inside the API process, started during the FastAPI lifespan
hook and stopped on shutdown.

## Enabling it

Set `SCHEDULER_ENABLED=true` in `.env`. On boot, the application:

1. Creates or verifies database tables.
2. Initialises the scheduler with a database session.
3. Starts it.
4. Stops it cleanly on shutdown and disposes the engine.

## Knowing whether it is running

`GET /health` reports it directly:

```bash
curl -s http://localhost:8000/health
```

```json
{"status": "healthy", "scheduler_running": true}
```

That field always reads `true` in the current implementation. Treat it as a
liveness flag for the process, not proof the scheduler loop is healthy — check
the execution log if you need certainty about runs.

## Operational notes

!!! note "Single process"
    Because the scheduler lives in the web process, running multiple workers
    duplicates it. Scale the API horizontally only after moving scheduling to a
    dedicated worker.

- **Restarts** reload the schedule from the database, so schedules survive a
  deploy.
- **Missed runs** during downtime are not back-filled; the log simply shows a
  gap.
- **Time zone** is whatever the container reports. Pin `TZ` explicitly if your
  schedule depends on local time.
