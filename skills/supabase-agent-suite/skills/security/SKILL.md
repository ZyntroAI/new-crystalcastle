---
id: supabase-agent-security
name: Security
version: 1.0.0
description: RLS, least privilege, and approval gates
suite: supabase-agent-suite-v1.0.0
tags: [security, supabase, postgres]
---

# security

## Least privilege

- Do **not** hand an agent the `service_role` key. It bypasses RLS.
- Use a restricted role with only the grants the task needs.
- Prefer the anon/authenticated role + RLS for anything user-facing.

## RLS

Check that policies exist, not just that RLS is on — a table with RLS enabled and
zero policies is deny-all (often a silent bug):

```sql
select schemaname, tablename, policyname, roles, cmd, qual
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Compare enabled-but-unpolicied tables against your expectation before shipping.

## Approval gates (always require a human yes)

- `DROP`, `TRUNCATE`, `DELETE` without a tight `WHERE`
- bulk `UPDATE`
- schema changes / migrations
- role, grant, or policy changes

## Never

- Paste a key, token, or DSN into chat.
- Commit `.env` or a DSN.
- Run destructive SQL "to test".
- Disable RLS to make a query pass.

## Report

Every write task returns: what changed, how many rows, and how to undo it.
