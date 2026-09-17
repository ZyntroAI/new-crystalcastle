# Supabase Agent Skill Suite — Import Package

**ID:** `supabase-agent-suite-v1.0.0`  **Version:** 1.0.0  **Type:** Suite/Orchestrator
**Tags:** supabase, postgres, database, concurrency, rls, migrations
**Visibility:** Public · Production Ready

## Purpose

Give Fig Agent (or any agent runtime) reliable, procedural guidance for working
against a live Supabase project — safely, and with concurrency in mind.

**The connector provides access. This suite provides procedure.** Skills alone do
not connect to a live project.

## Sub-skills (6)

- **`connect`** — wire Fig Agent to Supabase (OAuth connector / MCP / DSN) without secrets in chat.
- **`schema-inventory`** — know **which tables already exist** before creating anything.
- **`migrations`** — local migration files vs. remote migration history; never assume applied.
- **`concurrency`** — atomic task claiming (`FOR UPDATE SKIP LOCKED`), leases, idempotency keys.
- **`security`** — RLS, restricted DB role, approval gates for destructive SQL.
- **`postgres-best-practices`** — indexes, transactions, deadlocks, connection limits.

## Non-negotiables

1. **Inspect before you write.** List live tables, columns, indexes, FKs, RLS status, and applied migrations first.
2. **Never recreate what exists.** If an object already exists, reuse it and report its definition.
3. **A local migration file does not mean it ran remotely.** Verify the remote history.
4. **Never update the same row concurrently without row locks.**
5. **No destructive or bulk change without explicit approval.**

## Usage

```python
from loader import load_suite
suite = load_suite()                 # validates the registry
for s in suite["skills"]:
    print(s["id"], s["path"])
print(suite["skills"][1]["body"][:200])   # read a sub-skill
```

Or read a sub-skill directly: `skills/<name>/SKILL.md`.

## Runnable tools

- `tools/schema_inventory.py` — table/column/index/RLS inventory + object diff.
- `tools/task_queue.py` — concurrency-safe claimer with `FOR UPDATE SKIP LOCKED`.

Both ship with tests under `tests/`.
