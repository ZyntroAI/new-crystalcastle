---
id: crystalcastlex-monorepo-turborepo
name: Monorepo Turborepo
version: 1.0.0
description: Manage pnpm workspaces + Turborepo
suite: crystalcastlex-core-suite-v1.0.0
tags: [workspace:* deps, turbo.json, filtered builds, renovate automerge]
---

# monorepo-turborepo

Manage pnpm workspaces + Turborepo.

## Scope

- Self-contained sub-skill of the CrystalCastleX Core Suite.

## Triggers

- workspace:* deps
- turbo.json
- filtered builds
- renovate automerge

## Safety

- Read-only analysis by default.
- No repo-wide settings change without approval.
