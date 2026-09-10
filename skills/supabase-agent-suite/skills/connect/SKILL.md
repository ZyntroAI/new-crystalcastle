---
id: supabase-agent-connect
name: Supabase Connect
version: 1.0.0
description: Wire an agent to a live Supabase project without leaking secrets
suite: supabase-agent-suite-v1.0.0
tags: [connect, supabase, postgres]
---

# connect

Establish access from Fig Agent to a Supabase project.

## Principle

**Never move credentials through chat.** Use the connector's OAuth flow, or an
environment variable on the machine doing the work. The agent should be able to
say *which* project it is connected to without ever seeing a key.

## Three ways in

| Path | Use when | Secret handling |
|---|---|---|
| Supabase connector (OAuth) | You want managed, approval-gated access | Handled by the connector; nothing in chat |
| Supabase MCP server | The agent runtime speaks MCP | Token in the runtime's env, not the prompt |
| Direct DSN (`DATABASE_URL`) | You run your own tools/scripts | Env var only; never in a prompt or a commit |

## Steps

1. Confirm the target project **by name and ref** before doing anything.
2. Verify the connection is read-capable first: list schemas, tables, and the applied migrations.
3. Only then allow writes — and only with approval gates on.

## Verification prompt

```text
Which Supabase project are you connected to? Return the project name, ref, and
region, then list the schemas visible to this role. Do not modify anything.
```

## Failure handling

- `permission denied for table ...` -> the role is not granted; do **not** reach for
  the service-role key. Ask for a grant on the restricted role instead.
- `relation does not exist` -> re-run the schema inventory; your model of the DB is stale.
