# Workflows

A **workflow** is a named automation with an on/off state, triggered either on
a schedule or on demand.

## Listing workflows

```bash
curl -s http://localhost:8000/api/workflows/
```

The response is an array of `WorkflowResponse` objects. Each carries an
identifier you use for the per-workflow endpoints.

## Running a workflow now

Executing is a `POST` to the workflow's `execute` endpoint:

```bash
curl -s -X POST http://localhost:8000/api/workflows/1/execute
```

This returns an `ExecutionResult` describing the run. It does not wait for a
long-running workflow to finish — the scheduler records progress in the
execution log.

## Enabling and disabling

Toggling flips the workflow's active state and returns the updated
`WorkflowResponse`:

```bash
curl -s -X POST http://localhost:8000/api/workflows/1/toggle
```

Toggling is idempotent in effect but not in outcome — each call flips the
state, so calling it twice returns you to where you started.

## Calling from code

=== "Python"

    ```python
    import httpx

    BASE = "http://localhost:8000"

    with httpx.Client(base_url=BASE) as client:
        workflows = client.get("/api/workflows/").json()
        for wf in workflows:
            print(wf["id"], wf["name"])

        result = client.post("/api/workflows/1/execute").json()
        print(result)
    ```

=== "JavaScript"

    ```javascript
    const BASE = "http://localhost:8000";

    const workflows = await fetch(`${BASE}/api/workflows/`).then((r) => r.json());
    console.log(workflows);

    const result = await fetch(`${BASE}/api/workflows/1/execute`, {
      method: "POST",
    }).then((r) => r.json());
    console.log(result);
    ```
