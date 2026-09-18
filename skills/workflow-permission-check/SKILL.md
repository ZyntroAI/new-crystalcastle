---
id: workflow-permission-check
name: Workflow Permission Check
version: 1.0.0
description: Permission-aware gate — check required App permissions before acting.
suite: workflow-permission-check
tags: [github, permissions, workflows, ci-cd, least-privilege]
---

# Workflow Permission Check

Answers one question before an action is attempted: **does the identity actually
hold the permissions this operation needs?**

## The lesson it encodes

`contents: write` is **not** `workflows: write`. An identity can push ordinary
files successfully and still be rejected on `.github/workflows/*` with:

> refusing to allow a GitHub App to create or update workflow ... without
> `workflows` permission

Probing for that by trying a push wastes attempts. Check first, then act.

## Operations

| operation | required permissions |
|---|---|
| `code_write` | `contents:write` |
| `workflow_write` | `contents:write` + `workflows:write` |
| `rerun_ci` | `actions:write` |
| `read_repo` | `contents:read` |

## Usage

```python
from loader import can_write, explain, check_many

can_write("workflow_write", ["contents:write"])          # False
explain("workflow_write", ["contents:write"])["missing"] # ['workflows:write']
check_many(["code_write", "workflow_write"], ["contents:write"])["blocked"]
# -> ['workflow_write']
```

Pure standard library. No network, no credentials.

## Tests

```bash
pytest skills/workflow-permission-check/tests -q   # 10 passed
```
