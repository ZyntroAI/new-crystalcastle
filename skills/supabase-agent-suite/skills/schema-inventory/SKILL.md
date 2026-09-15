---
id: supabase-agent-schema-inventory
name: Schema Inventory
version: 1.0.0
description: Know which tables already exist before creating anything
suite: supabase-agent-suite-v1.0.0
tags: [schema-inventory, supabase, postgres]
---

# schema-inventory

**The agent must know what already runs in the database before it touches it.**

## Required pre-flight (run before every task)

1. Identify the target project.
2. List every existing table and view in `public`.
3. Inspect columns, types, PKs, FKs, indexes, and RLS status.
4. List migrations already applied remotely.
5. Compare the requested task against that inventory.
6. **Never recreate an existing table, column, index, policy, or migration.**
7. If an object already exists, report its current definition and reuse it.
8. Schema changes are prepared as a migration and require approval before applying.

## SQL

Tables:

```sql
select table_schema, table_name
from information_schema.tables
where table_schema not in ('pg_catalog', 'information_schema')
  and table_type = 'BASE TABLE'
order by table_schema, table_name;
```

Columns:

```sql
select table_schema, table_name, ordinal_position,
       column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
order by table_name, ordinal_position;
```

Does a specific table exist?

```sql
select exists (
  select 1 from information_schema.tables
  where table_schema = 'public' and table_name = 'orders'
) as table_exists;
```

RLS status:

```sql
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;
```

## Runnable

`tools/schema_inventory.py` runs the above (plus indexes and FKs) and can diff
the live schema against an expected object list — so concurrent agents converge
instead of colliding.

## Rule

Return a schema inventory **before** making changes. A local migration file is not
evidence that anything ran remotely.
