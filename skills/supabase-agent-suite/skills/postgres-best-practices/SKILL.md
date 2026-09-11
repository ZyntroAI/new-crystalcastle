---
id: supabase-agent-postgres-best-practices
name: Postgres Best Practices
version: 1.0.0
description: Indexes, transactions, deadlocks, connections
suite: supabase-agent-suite-v1.0.0
tags: [postgres-best-practices, supabase, postgres]
---

# postgres-best-practices

## Indexes

- Index the columns you actually filter and join on — not every column.
- Composite index column order follows the query's selectivity and equality-then-range pattern.
- Use `create index concurrently` in production; it cannot run inside a transaction.
- Find missing-index candidates from `pg_stat_user_tables` (high `seq_scan` on big tables).

## Transactions

- Keep them **short**. Never hold one open across an HTTP request.
- Do the slow thing first, then open the transaction, write, commit.
- Prefer `read committed` unless you have a proven reason otherwise.

## Deadlocks

- Take locks in a **consistent order** across all code paths.
- `FOR UPDATE SKIP LOCKED` for queues; plain `FOR UPDATE` for contended single rows.
- On `deadlock detected`, retry the whole transaction — do not partial-retry.

## Connections

- Every connection is a server slot. Cap worker concurrency to fit the pool.
- Use a pooler (Supavisor / PgBouncer) for many short-lived clients.
- Set statement and lock timeouts so a stuck query cannot pin a connection forever.

## Quick wins

```sql
-- who is blocking whom
select pid, wait_event_type, wait_event, left(query, 80) as query
from pg_stat_activity
where state <> 'idle' order by query_start;

-- long-running queries
select pid, now() - query_start as runtime, left(query, 80)
from pg_stat_activity
where state = 'active' and now() - query_start > interval '1 minute';
```
