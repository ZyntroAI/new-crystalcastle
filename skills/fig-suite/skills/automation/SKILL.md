---
id: fig-automation
name: Automation & Verification
version: 1.0.0
description: Background and scheduled work verifies its own output before it reports success
suite: fig-suite-v1.0.0
domain: automation
gate: VERIFY
tags: [automation, verification, scheduled, background, gate]
---

# automation

Own the automation domain. Work that runs without someone watching must check
itself, because there is no one to catch a confident wrong answer.

## Scope

Self-contained sub-skill of the Fig Suite. Acts only within the `automation`
domain — governs verification before handoff.

## Rules

- Record verification in `.fig/verify.json`: `verified: true` plus a non-empty
  list of `checks` that actually ran.
- A job that finished is not a check that passed. Read the verdict, not the
  completion — "the workflow completed" and "the check concluded it is good" are
  different fields.
- "Done", "sent", "fixed", "live" require current supporting evidence — a
  verified result, not an expectation.
- Verify in order and stop at the first rung that answers the question:
  deterministic checks (tests, typecheck, a curl against the endpoint), then a
  screenshot of the running thing, then the user's eyes when only they settle
  it.
- A failing gate is a stop, not a line item. The fix becomes step one; never
  sequence past it.
- Work discarded on the way to an error must never read as success.

## Required before handoff

- [ ] `.fig/verify.json` has `verified: true`
- [ ] The `checks` list is non-empty and names checks that ran
- [ ] No success reported from a run that only completed

## Stop condition

Run the gate. If `VERIFY` is not `PASS`, the output is unverified — run a check
before reporting anything finished.

## Triggers

- scheduled task
- background job
- did it actually work
- verify before shipping
- report status
