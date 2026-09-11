Title: App API Guidelines
Subtitle: The App/API layer contract for crystalcastle
Kicker: Standard Operating Procedure
Author: Nattapong Pornlumfah · v1.0
Date: 2026-09-11
Theme: professional
Genre: sop
Font: plex

```figexec
Frozen contract for every HTTP endpoint in crystalcastle: **the API layer contains no business logic**. Routers validate and delegate; services orchestrate; the OnSpace AI engine stays framework-independent. This document is the reference for all new endpoints after the OnSpace AI engine work — including every route exposed to the React Builder.
```

## Follow this five-layer path, and never skip a layer

Every request moves down a single chain. A layer may only call the layer directly beneath it — no leaps, no upward calls.

```
Client
  ↓
API Router          ← HTTP only: parse, validate, delegate
  ↓
Application Service ← orchestration; owns the transaction
  ↓
Domain / Agent      ← business rules, planner, executor
  ↓
Provider / Infra    ← LLM providers, storage, cloud
```

The rule that keeps the rest honest: **the router is a translator, not a decision-maker.** If a conditional about business state appears in a route handler, it belongs in the service.

## Keep routers thin — the service does the work

A route handler parses the request, calls one service method, and returns its result. Nothing else.

```python
@router.post("/generations")
async def create_generation(
    request: GenerationRequest,
    service: GenerationService = Depends(get_generation_service),
):
    return await service.generate(request)
```

```figcallout
Review test: if you cannot describe a route handler in one sentence — "accept X, hand it to Y, return the result" — business logic has leaked into it.
```

## Version every path, from the first endpoint

Prefix all routes with the API version. Introducing a version later is a breaking change; introducing it now costs nothing.

```
/api/v1/projects
/api/v1/applications
/api/v1/generations
/api/v1/deployments
```

## Type every request and response — no raw dicts at the boundary

Pydantic models are the contract. Define them at module level so the OpenAPI schema generates correctly.

```python
class GenerationRequest(BaseModel):
    prompt: str
    application_id: UUID
    provider: str | None = None


class GenerationResponse(BaseModel):
    id: UUID
    status: str
    output: str | None = None
```

Never return an ORM object or a bare `dict` from a route — return the response model.

## Keep the OnSpace AI engine framework-independent

This is the boundary that decides whether the engine survives the next framework change. FastAPI must not import the engine's internals, and the engine must not import FastAPI.

```
FastAPI
   ↓
GenerationService
   ↓
OnSpaceAIService
   ↓
onspace/
   ├── context
   ├── token_budget
   ├── cache
   ├── circuit_breaker
   ├── fallback
   └── providers
```

```figcallout
The engine exposes a plain service interface. Swap FastAPI for anything else and `onspace/` does not change. If a PR makes `onspace/` import `fastapi`, it is wrong.
```

> **Reconciliation note.** This section preserves the separation established in the OnSpace AI engine work. Two details in the original brief did not match the repository and are corrected here: the separation was **not** established by a PR numbered #197 (the highest PR number in the repo is #144), and the engine does **not** live at `deliverables/onspace-ai/` — that path does not exist. In the current tree the OnSpace AI material sits under `docs/Onspace AI`. Treat this document as the forward contract; treat the engine's current location as a migration item, not a settled fact.

## Standardize errors — one envelope, no provider internals

Every error response uses the same shape. Codes are stable strings the client can branch on.

```json
{
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Generation provider unavailable",
    "request_id": "..."
  }
}
```

**Never expose** provider-specific exception text, stack traces, API keys, or `.env` contents in a response body. Map the provider error to a domain code inside the service; the router never sees the raw exception.

## Resolve identity all the way down before mutating anything

Every mutating endpoint establishes the full chain, in order, and fails closed at the first gap.

```
Identity
  ↓
Organization
  ↓
Project
  ↓
Resource
  ↓
Action
```

For example, `POST /api/v1/projects/{project_id}/generations` must verify that the authenticated principal may *generate within that specific project* — not merely that they are logged in. A principal with no membership in the project gets `403`, not an empty result.

```figcallout
Check resource ownership on every request that carries an ID in the path. Path IDs are attacker-controlled input.
```

## Require an idempotency key on anything that creates work

Generation and deployment calls take a client-generated key. A retry with the same key returns the original result instead of starting a second job.

```
Idempotency-Key: <client-generated-key>
```

Store the key with the created resource's ID — and scope it per principal, so one client's key can never collide with another's.

## Return 202 for long-running work — never hold the connection

An AI generation or deployment can take minutes. Do not keep the HTTP request open for it.

```
POST /generations
        ↓
202 Accepted
        ↓
generation_id
        ↓
GET /generations/{id}
```

The job moves through a known lifecycle:

```
queued → running → completed
                 ↘ failed
```

The client polls the status endpoint; the server never blocks a request on a provider call.

## Emit a fixed telemetry set, and log no secrets

Every request carries these fields on the way through:

```figtable
{"headers":["Field","Purpose"],"rows":[["request_id","Correlate one HTTP request"],["trace_id","Correlate across services"],["user_id","Attribute usage"],["organization_id","Tenant scoping and billing"],["project_id","Resource scoping"],["operation","Which use case ran"],["provider","Which LLM provider served it"],["latency","Performance and SLO tracking"],["token_usage","Cost attribution"],["status","Success or failure outcome"]],"decimals":0}
```

**Never log** API keys, access tokens, OAuth secrets, `.env` contents, or full prompts containing secrets or PII. Redact at the logging boundary, not at review time.

## Expose an explicit resource model to the Builder

The React Builder maps to a stated hierarchy — not to whatever the generator happens to produce. Keep the resource model and the endpoints in lockstep.

```
Project
 └── Application
      ├── ApplicationSchema
      ├── Generation
      ├── Preview
      ├── Deployment
      └── AgentRun
```

| Endpoints | |
|---|---|
| `GET /api/v1/projects` | `POST /api/v1/projects` |
| `GET /api/v1/applications/{id}` | `POST /api/v1/applications` |
| `GET /api/v1/applications/{id}/schema` | `PUT /api/v1/applications/{id}/schema` |
| `POST /api/v1/generations` | `GET /api/v1/generations/{id}` |
| `POST /api/v1/deployments` | `GET /api/v1/deployments/{id}` |
| `POST /api/v1/agents/runs` | `GET /api/v1/agents/runs/{id}` |

## The critical rule: never let the model write into the API contract

The LLM does not emit REST responses. It emits an `ApplicationSchema`; everything downstream consumes that stable contract.

```
Natural Language
       ↓
AI Planner
       ↓
ApplicationSchema   ← stable contract
       ↓
Validator
       ↓
Code Generator
       ↓
Generated Application
       ↓
Test / Review
       ↓
Deployment
```

```figcallout
This is the single largest correctness lever in the system. `ApplicationSchema` is the seam between AI reasoning, application state, generated code, and the HTTP API. Validate the schema before generating code — never after.
```

## Adoption and revision

| Field | Value |
|---|---|
| Applies to | All new endpoints in crystalcastle, including Builder APIs |
| Owner | Nattapong Pornlumfah |
| Status | v1.0 — frozen contract |
| Next review | When the Builder API surface next changes |

| Version | Date | Change |
|---|---|---|
| v1.0 | 2026-09-11 | Initial App/API layer contract: five-layer model, versioning, typed schemas, engine independence, error envelope, authz chain, idempotency, async jobs, telemetry, Builder resource model, schema-first generation. |
