---
id: fig-platform
name: Platform & Workspaces
version: 1.0.0
description: Declare the mission before producing output, and name every file so it can be re-found
suite: fig-suite-v1.0.0
domain: platform
gate: CONTEXT
tags: [platform, workspace, mission, naming, conventions]
---

# platform

Own the platform domain. Before anything is produced, the work states what it is
for. Everything a workspace contains should be re-findable a week later without
opening it.

## Scope

Self-contained sub-skill of the Fig Suite. Acts only within the `platform`
domain — declares context and governs naming.

## Rules

- Declare the mission in `.fig/context.yaml` before producing output. One
  sentence: what this workspace is for.
- Use semantic, collision-resistant filenames:
  `<scope>_<descriptor>[_<discriminator>].<ext>`.
- Never ship a generic name — `output`, `result`, `file`, `data`, `doc`,
  `report`, `chart`, `analysis`, `temp`. Two unrelated requests otherwise
  produce two `report.xlsx` and the second silently overwrites the first.
- For batch outputs, bake the entity id into the filename in the loop, not a
  counter. `customer_acme_report.xlsx` beats `report_0.xlsx`.
- For iterations on one deliverable, overwrite the same path. Do not mint `_v1`,
  `_v2`, `_draft`, `_final` copies.

## Required before handoff

- [ ] `.fig/context.yaml` present with a non-empty `mission`
- [ ] No generic filenames anywhere in the workspace
- [ ] Batch outputs keyed by entity id, not index

## Stop condition

Run the gate. If `CONTEXT` or `NAMING` is not `PASS`, fix and re-run. Do not
hand off because the content is right — an un-named workspace is one you cannot
find again.

## Triggers

- start work in a workspace
- new deliverable
- naming a file
- project layout
- duplicate or overwritten output
