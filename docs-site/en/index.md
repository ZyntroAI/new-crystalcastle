# ZyntroAI API Documentation

The **Cron Automation System API** manages scheduled workflows and cron jobs.
This site documents the HTTP surface the backend actually exposes, with
runnable examples in JavaScript, Python, TypeScript and cURL.

<div class="grid cards" markdown>

-   **New here?**

    Start with the [Getting started](getting-started.md) guide — you will have a
    local instance answering requests in about five minutes.

-   **Calling the API?**

    Jump to the [API reference](api-reference.md) for every endpoint, its
    payload, and its response model.

-   **Something broken?**

    The [Troubleshooting](troubleshooting.md) page lists the failures we
    actually hit, and what each one means.

</div>

## What this API does

The service exposes three resource families:

| Family | Prefix | Purpose |
|---|---|---|
| Workflows | `/api/workflows` | Define and trigger multi-step automation |
| Cron jobs | `/api/jobs` | Trigger or pause individual scheduled jobs |
| Execution logs | `/api/execution` | Read the history of what has run |

A single health probe sits at `/health`.

## At a glance

```bash
# Is it up?
curl -s http://localhost:8000/health
```

```json
{"status": "healthy", "scheduler_running": true}
```

## Language

This documentation ships in English and Thai. Use the language switcher in the
top bar. Thai pages live under `/th/`; the English pages are the default at the
site root.
