---
id: crystalcastlex-auto-debugging
name: Auto Debugging
version: 1.0.0
description: Read-Reproduce-Fix-Verify debugging with evidence guardrails
suite: crystalcastlex-core-suite-v1.0.0
tags: [evidence-based debugging, reproduce failure, root-cause hypothesis, minimal patch, regression test, baseline comparison, verify before claim]
---

# auto-debugging

Read-Reproduce-Fix-Verify debugging with evidence guardrails.

## Scope

- Self-contained sub-skill of the CrystalCastleX Core Suite.

## Triggers

- evidence-based debugging
- reproduce failure
- root-cause hypothesis
- minimal patch
- regression test
- baseline comparison
- verify before claim

## Workflow

1. **Read** — error message, stack trace, failing test, CI logs, recent diff,
   environment. Record the exact failure and the command that produced it.
2. **Establish baseline** — repository status before editing; run the smallest
   existing test or reproduction command; record pass/fail/skip/error counts;
   separate pre-existing failures from failures this task introduced.
3. **Reproduce** — prefer an existing failing test; otherwise a minimal
   temporary reproducer or a regression test when appropriate. No "fixed" claim
   without a reproduction or strong direct evidence.
4. **Localize** — trace to the smallest set of files/functions/config/deps and
   state confidence plus alternative hypotheses.
5. **Plan before patching** — minimal repair plan, the files allowed to change,
   expected behavior, and validation commands. No unrelated cleanup.
6. **Patch** — the smallest justified change; preserve existing APIs and
   conventions; add or update a focused regression test when the bug is testable.
7. **Verify** — re-run the original reproducer, the focused test, related tests,
   and lint/type-check/build where available; compare against the baseline;
   inspect the final diff and repository status.
8. **Decide** — `fixed` only when the original failure is gone and relevant
   checks pass; otherwise `partially-fixed`, `blocked`, or `not-a-bug`.

## Hard stop conditions

- Three unsuccessful patch attempts for the same root-cause hypothesis.
- Two consecutive attempts with no meaningful progress.
- The required test command is unknown and cannot be safely inferred.
- The change would affect security, auth, payments, database migrations,
  production infrastructure, or public APIs without explicit review.
- Credentials, secrets, production data, or external destructive actions would
  be required.
- Before applying changes to a live environment.

## Output per run

Failure summary · baseline command and result · reproduction steps ·
root-cause hypothesis · files inspected · files changed · patch rationale ·
tests and validation commands · before/after results · remaining risks and
blockers · final status.

## Repository-specific rules

Before fixing any CI or YAML failure:

- Record the current branch and Git status.
- Inspect all `.github/workflows/` files.
- Validate YAML syntax independently from action-policy validation.
- Separate failures caused by invalid YAML, unpinned action references, missing
  permissions, unavailable secrets, dependency errors, and test failures.
- Never claim CI is fixed just because one workflow file parses; report the
  exact number of failing workflows and remaining failures.
- Preserve the SHA-pinning policy — never replace a pinned SHA with a mutable tag.

For a suite under `deliverables/<suite>/`:

- Treat that suite as an isolated package; read its `pyproject.toml`, README,
  source, and tests first.
- Run its own test and validation commands before repository-wide checks.
- Do not move files across suites; preserve each suite's conventions.

## Safety

- Read-only analysis by default.
- No repo-wide settings change without approval.
- Propose a patch and open a PR with evidence; never auto-merge, never touch
  production.
- Never hide failures or convert failing tests into skipped tests to obtain a
  green result.
