---
id: crystalcastlex-git-repair
name: Git Repair
version: 1.0.0
description: Repair git tree corruption
suite: crystalcastlex-core-suite-v1.0.0
tags: [git fsck, mktree/commit-tree, filter-repo, atomic renames]
---

# git-repair

Repair git tree corruption.

## Scope

- Self-contained sub-skill of the CrystalCastleX Core Suite.

## Triggers

- git fsck
- mktree/commit-tree
- filter-repo
- atomic renames

## Safety

- Read-only analysis by default.
- No repo-wide settings change without approval.
