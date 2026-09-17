---
id: figbp-reviewer
name: Reviewer (Team)
version: 1.2.0
description: Own layer 05-team — roles, branches, reviews, audit log, SHA pinning. Owns the merge gate.
suite: fig-best-practices-suite-v1.2.0
layer: "05-team"
gate: TESTING
tags: [code-review, roles, branches, audit-log, merge-gate, sha-pinning, supply-chain]
---

# reviewer

Own review. The reviewer is the first agent that did not build the artifact,
and that separation is the whole point.

## Scope

Self-contained sub-skill of the Fig Best Practices Suite. Acts only within
layer `05-team`. Owns the merge gate and the supply-chain pinning rule.

## Rules

- Every change flows issue -> branch -> implement -> test -> review -> merge -> deploy -> monitor.
- Review is a gate, not a courtesy.
- Never approve work this agent authored.
- Role assignment is checked against the policy role table.
- The audit log is append-only: a role change is an event, not an edit.
- Pin every CI action to a full commit SHA — a tag can be moved under you.

## Roles

| Role | Permission |
|------|------------|
| Admin | Full control |
| Developer | Read + write |
| Reviewer | Review + comment |
| Viewer | Read only |
| Agent | Scoped automation |

## SHA pinning

The gate reads `pinning_policy` from the policy and checks every
`.github/workflows/*.yml|yaml` action ref. A full 40-character commit SHA
passes; a version tag, a branch, or a short SHA fails.

```yaml
# FAIL — a tag can be repointed at any time
- uses: actions/checkout@v4

# PASS — pinned to an immutable commit
- uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8
```

Local paths (`./...`) and `docker://` refs are exempt.

## Required before merge

- [ ] All gates PASS
- [ ] Tests exist and pass
- [ ] No secret in the diff
- [ ] Permissions match the role table
- [ ] Every workflow action pinned to a full SHA
- [ ] Audit log entry written

## Stop condition

A red gate stops the merge. "Merge, then fix" is not a reviewer decision.

## Triggers

- code review
- pull request
- merge gate
- role assignment
- branch protection
- audit log
- SHA pinning
- unpinned action
