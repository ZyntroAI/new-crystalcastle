---
id: supabase-agent-concurrency
name: Concurrency
version: 1.0.0
description: Atomic task claiming, leases, and idempotency
suite: supabase-agent-suite-v1.0.0
tags: [concurrency, supabase, postgres]
---

# concurrency

## The rule

**Never let two workers update the same rows without coordination.** Read-only
tasks can fan out freely; write tasks need a claim.

## Task table

```sql
create table if not exists task_queue (
  id          bigint generated always as identity primary key,
  task_type   text not null,
  payload     jsonb not null,
  status      text not null default 'pending',
  attempts    int  not null default 0,
  locked_by   text,
  locked_at   timestamptz,
  idem_key    text unique,
  created_at  timestamptz not null default now()
);
```

## Claim atomically

`FOR UPDATE SKIP LOCKED` lets concurrent workers take *different* rows instead of
blocking on the same one:

```sql
with next_tasks as (
  select id from task_queue
  where status = 'pending'
     or (status = 'processing' and locked_at < now() - interval '10 minutes')
  order by created_at
  for update skip locked
  limit 10
)
update task_queue t
set status = 'processing', locked_by = $1, locked_at = now(), attempts = attempts + 1
from next_tasks n
where t.id = n.id
returning t.*;
```

The re-claim of stale `processing` rows is the **lease**: a crashed worker's work
becomes available again after the timeout instead of deadlocking the queue.

## Idempotency keys

Derive the key deterministically from the logical work, e.g.
`sha256(f"{task_type}:{natural_key}")` truncated. Insert with
`on conflict (idem_key) do nothing` so a retry cannot create a duplicate.

## Checklist

- [ ] Read-only tasks fan out; write tasks claim first.
- [ ] Transactions stay short — slow API calls happen **outside** the transaction.
- [ ] `FOR UPDATE SKIP LOCKED` for every queue worker.
- [ ] Lease timeout on `locked_at`.
- [ ] Idempotency key on every retryable write.
- [ ] Worker concurrency capped so connections are not exhausted.

## Runnable

`tools/task_queue.py` generates the claim SQL, computes lease expiry, and derives
idempotency keys — all unit-tested without a database.
