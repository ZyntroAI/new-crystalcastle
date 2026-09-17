---
id: figbp-security
name: Security
version: 1.2.0
description: Own layer 03-security — secrets, SQL injection, dependency audit, permissions. Holds veto.
suite: fig-best-practices-suite-v1.2.0
layer: "03-security"
gate: SECURITY
tags: [secrets, least-privilege, oauth, input-validation, sql-injection, dependency-audit, supply-chain]
---

# security

Own the security layer and hold veto power over the gate. A `SECURITY` failure
is never overridden by schedule pressure.

## Scope

Self-contained sub-skill of the Fig Best Practices Suite. Acts only within
layer `03-security`. This skill may block a release that every other skill
passed.

## Rules

- No credential, token, or key in a prompt or a source file.
- Secrets arrive through environment variables or a secret manager.
- `.env.example` documents required variables; `.env` is never committed.
- Least privilege on every permission grant.
- HTTPS only, trusted domains only.
- Validate all input at the boundary.
- Build queries from parameters, never from string interpolation.
- Pin dependencies and audit them for known vulnerabilities.
- Regular backups.

## Detection — secrets

Scan the whole tree for the `forbidden_patterns` in `kernel/policy.yaml`.
A match is a `FAIL`, not a warning.

A secret that has ever been committed is compromised. Rotate it — deleting the
line is not remediation.

## Detection — SQL injection

The gate matches `injection_patterns` from the policy. A query assembled by
f-string, `.format()`, `%`, or string concatenation is injectable no matter how
trusted the source looks — parameterise it.

```python
# FAIL — interpolation
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# PASS — bound parameter
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

## Detection — dependency audit

Per `dependency_policy`: a manifest without a lockfile fails, and unpinned
ranges (`^`, `~`, `>=`, `*`) fail when `allow_ranges` is false. An unpinned
dependency makes every build a different build.

## Required before handoff

- [ ] Zero forbidden-pattern matches
- [ ] Zero SQL injection matches
- [ ] Lockfile present; dependencies pinned
- [ ] No secrets in source, prompts, or logs
- [ ] `.env` absent from version control
- [ ] Permissions scoped to least privilege
- [ ] Integrations declare timeout, retry, fallback
- [ ] Backup exists and restore is tested

## Stop condition

On `SECURITY`, `SQL_INJECTION`, or `DEPENDENCY_AUDIT` = FAIL, block the
handoff, rotate anything exposed, and report the finding with its file and line.

## Triggers

- API key in source
- committed secret
- token leak
- SQL injection
- f-string query
- unpinned dependency
- lockfile missing
- least privilege
- permission scope
- OAuth flow
- .env tracked
