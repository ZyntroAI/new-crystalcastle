---
name: crystalcastle-obsidian-rest
description: >-
  Connects the CrystalCastle agent suite (crystal-global, crystal-planner,
  crystal-developer, crystal-admin) to an Obsidian vault via the team-standard
  Obsidian Local REST API (TEAM-STD-2026-009). Use when an agent needs to read,
  write, patch, or search vault notes; sync Canvas state; or route a
  CrystalCastle → Obsidian request. Enforces HTTPS-only, localhost-bound,
  Bearer-token access and PATCH-first editing.
license: Internal
metadata:
  author: ZyntroAI
  version: "1.0"
  standard_ref: TEAM-STD-2026-009
  internal: true
---

# CrystalCastle ↔ Obsidian REST Bridge

Gives every CrystalCastle agent a single, standardized way to talk to the
Obsidian vault. Built on top of the **Obsidian Local REST API** plugin
(coddingtonbear), following the mandatory settings in `TEAM-STD-2026-009`
(effective 2026-09-12).

## When to Use

- A CrystalCastle agent needs to read, create, edit, or delete a vault note
- `crystal-planner` is mapping `/api/v1/canvas` to Obsidian Canvas
- `crystal-developer` is implementing Obsidian sync/fetch logic
- `crystal-admin` is auditing auth, CORS, or key rotation for the Obsidian connection
- Any task description mentions "Obsidian", "vault", "Canvas", or "REST API sync"

## Connection Standard (non-negotiable)

| Setting | Value |
|---|---|
| Base URL | `https://127.0.0.1:27124` |
| Bind address | `127.0.0.1` only — never `0.0.0.0` or an external IP |
| Protocol | HTTPS only — port `27123` (HTTP) must stay disabled |
| Auth header | `Authorization: Bearer ${OBSIDIAN_API_KEY}` on every request |
| Key storage | Environment variable / secret manager only — never hardcoded, never committed |
| Key rotation | Every 90 days, or immediately on suspected leak |

Any agent call that doesn't meet all five rows above must be rejected before
it runs — this is a hard gate, not a suggestion.

## Allowed Endpoints

| Category | Endpoint | Method | Use |
|---|---|---|---|
| Vault CRUD | `/vault/{path}` | GET | Read file content + metadata |
| | `/vault/{path}` | PUT | Create / overwrite a file |
| | `/vault/{path}` | PATCH | **Preferred** — edit part of a note |
| | `/vault/{path}` | DELETE | Delete a file (use with caution) |
| | `/vault/{path}` | POST | Create a new file |
| Active file | `/active/` | any | Work with the currently open note |
| Search | `/search/simple/` | POST | Plain-text search |
| | `/search/` | POST | Advanced search (JsonLogic) |
| Periodic notes | `/periodic/{period}/` | GET/POST | Daily / Weekly / Monthly notes |
| Commands | `/commands/` | GET | List available Obsidian commands |
| | `/commands/{id}/` | POST | Run an Obsidian command |
| Tags | `/tags/` | GET | List vault tags |
| Open in UI | `/open/{path}` | GET | Open a file in the Obsidian UI |
| AI integration | `/mcp/` | — | MCP Server entry point for agents |

**PATCH is the default edit operation.** Only fall back to `PUT` when the
entire file is being replaced.

```json
{
  "operation": "append",
  "scope": "heading",
  "target": "TODO",
  "content": "- new item from crystal-developer"
}
```
Allowed `operation`: `replace`, `prepend`, `append`, `delete`.
Allowed `scope`: `content`, `marker`, `markerAndContent`, `parent`.

## Agent-Specific Responsibilities

### crystal-global (Root Orchestrator)
- Owns the single source of truth for the connection: base URL, active key
  reference (never the raw value), and vault path conventions.
- Routes every Obsidian-bound request through this skill rather than letting
  planner/developer/admin call the API ad hoc.
- On startup, verifies the plugin is reachable (`GET /active/`) before
  dispatching work to other agents.

### crystal-planner (Strategy & Design)
- Defines the `/api/v1/canvas` ↔ Obsidian Canvas mapping spec.
- Decides which vault folders map to which CrystalCastle entities
  (e.g. `Projects/`, `Daily/`, `Notes/`).
- Never calls the REST API directly — hands the spec to crystal-developer.

### crystal-developer (Engineering Agent)
- Implements the actual fetch/sync logic against the endpoints above.
- Defaults to `PATCH` for incremental note updates; uses `PUT`/`POST` only
  for full-file creation or replacement.
- Wraps every call with status-code checks, timeout, and retry/backoff.
- Never inlines `OBSIDIAN_API_KEY` — reads it from environment/secret manager.

### crystal-admin (Operations & Security)
- Owns key issuance, storage, and the 90-day rotation schedule.
- Confirms bind address stays `127.0.0.1` and HTTP (27123) stays off.
- Reviews logs for API usage (never logs the key itself).
- Approves any `DELETE` against the vault before it runs.

## Standard Workflow

1. **crystal-global** receives an Obsidian-related request, checks
   `GET /active/` for connectivity, routes to the right agent.
2. **crystal-planner** (if new mapping needed) defines the vault path /
   Canvas spec.
3. **crystal-developer** implements the call:
   - Read: `GET /vault/{path}`
   - Search: `POST /search/simple/` or `POST /search/`
   - Edit: `PATCH /vault/{path}` (preferred) with an `operation`/`scope`/
     `target`/`content` body
   - Create: `POST` or `PUT /vault/{path}`
4. **crystal-admin** enforces the security gate — HTTPS, Bearer header,
   127.0.0.1-only, key rotation status — before any write/delete executes.
5. **crystal-global** returns the structured result:
   `{ status, agent, output, next }`.

## Reference cURL (for crystal-developer)

```bash
# Read a note
curl -H "Authorization: Bearer ${OBSIDIAN_API_KEY}" \
     -k "https://127.0.0.1:27124/vault/Projects/CrystalCastle.md"

# Patch a section (preferred edit method)
curl -X PATCH \
     -H "Authorization: Bearer ${OBSIDIAN_API_KEY}" \
     -H "Content-Type: application/json" \
     -k --data '{"operation":"append","scope":"heading","target":"TODO","content":"- new task"}' \
     "https://127.0.0.1:27124/vault/Daily/2026-09-12.md"

# Create a new note
curl -X PUT \
     -H "Authorization: Bearer ${OBSIDIAN_API_KEY}" \
     -H "Content-Type: text/markdown; charset=UTF-8" \
     -k --data "# New Note\n\ncontent here" \
     "https://127.0.0.1:27124/vault/Notes/NewNote.md"
```

## Forbidden Actions (hard stop, no exceptions)

- Hardcoding `OBSIDIAN_API_KEY` in source, prompts, or logs
- Binding to `0.0.0.0` or any non-localhost address
- Enabling or calling the HTTP port (`27123`)
- Using `PUT` to change a single line of a large file (use `PATCH`)
- Running `DELETE` without prior crystal-admin approval
- Sharing the API key across agents/sessions instead of referencing the
  secret store

## Quality Checklist

- [ ] Request uses `https://127.0.0.1:27124`
- [ ] `Authorization: Bearer ${OBSIDIAN_API_KEY}` header present
- [ ] Edit uses `PATCH` unless a full-file replace is genuinely required
- [ ] No API key literal appears anywhere in code, logs, or chat output
- [ ] `DELETE`/destructive calls have explicit crystal-admin sign-off
- [ ] Response status code checked; errors retried with backoff, not silently swallowed
