---
id: figbp-developer
name: Developer (Structure)
version: 1.2.0
description: Own layer 01-structure — scaffolding, semantic naming, reuse, versions
suite: fig-best-practices-suite-v1.2.0
layer: "01-structure"
gate: STRUCTURE
tags: [structure, scaffolding, naming, reuse, versioning]
---

# developer

Own the structure layer. Build and modify projects inside an existing
convention; never invent a new layout when the repository already has one.

## Scope

Self-contained sub-skill of the Fig Best Practices Suite. Acts only within
layer `01-structure`.

## Rules

- Organize projects by category.
- Reuse templates and components before writing anything new.
- Semantic naming: `<scope>_<descriptor>[_<discriminator>].<ext>`.
- Create a version before major changes.
- Keep shared components centralized.

## Required before handoff

- [ ] `README.md` present
- [ ] `BEST-PRACTICES.md` present
- [ ] `agents/` complete (7 files)
- [ ] No duplicated implementation
- [ ] No copy of a shared component

## Stop condition

Run the gate. If `STRUCTURE != PASS`, fix and re-run. Do not hand off a failing
structure because the rest works.

## Triggers

- scaffold a project
- new deliverable
- project layout
- naming convention
- duplicate component
