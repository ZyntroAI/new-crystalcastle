---
id: supabase-agent-migrations
name: Migrations
version: 1.0.0
description: Local migration files vs. remote migration history
suite: supabase-agent-suite-v1.0.0
tags: [migrations, supabase, postgres]
---

# migrations

## The trap

A migration file in the repo does **not** mean it ran against the remote database.
Two agents can each add `003_add_orders.sql`, both look "applied" locally, and the
remote history disagrees.

## Verify both, always

1. The live schema (what actually exists) — see `schema-inventory`.
2. The **remote** migration history.

## Check the remote history

Supabase Dashboard -> Database -> Migrations, or via MCP `list_migrations`, or:

```sql
select version, name, inserted_at
from supabase_migrations.schema_migrations
order by version;
```

## Before applying a migration, return

- the SQL,
- expected lock impact (will it take an `ACCESS EXCLUSIVE` lock? how long?),
- the rollback plan,
- the validation query that proves it worked.

Then **wait for approval.**

## Safe defaults

- Additive first: `add column ... default` on a large table locks — prefer
  nullable-add, backfill in batches, then set `not null`.
- Create indexes with `concurrently` outside a transaction.
- One logical change per migration file; never edit an applied migration.
- Rehearse on a branch project before production.
