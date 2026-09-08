# python-dev Orchestrator — Merged

- **Status:** merged into `main`
- **PR:** #131
- **Commit:** `ebee297`
- **Date:** 2026-09-08
- **Repo:** ZyntroAI/new-crystalcastle
- **Path:** `skills/python-dev/`

## Summary

Layered Python development engine combining a Pyflakes static layer (fast /
secure / no-exec) with a runtime layer whose execution is **always routed
through the AST10 G3 sandbox** (`scripts/sandbox/ast10`) — never run inline.

## Architecture

```
skills/python-dev/
├── SKILL.md
├── __init__.py
├── orchestrator.py   # PythonDevOrchestrator — analyze/inspect/execute/debug/workflow
├── static_layer.py   # StaticAnalyzer  -> Pyflakes (no import, no side effects)
├── runtime_layer.py  # RuntimeSession  -> AST inspect local; exec via AST10 G3
├── security.py       # PERMS table + SandboxGuard (routes runs through AST10 flow)
├── workflow.py       # scan -> decide -> reproduce routing
├── conftest.py       # makes hyphen dir importable as skills.python_dev in tests
└── tests/            # test_flow / test_perms / test_isolation (17 tests)
```

## Permission model

| perm | policy |
|------|--------|
| execute | approval-gated + sandbox-first (AST10 G3) |
| shell / network / filesystem_write | **blocked** |

## Integration with AST10 / G3

- Every code execution call goes through `SandboxGuard.run` -> the AST10
  G1→G2→G3 flow in `scripts/sandbox/ast10`.
- No inline eval/exec path exists in the package.
- Isolation guarantees (docker, offline, read-only root, cap-drop,
  no-new-privileges, tmpfs, timeout-kill) live in one place
  (`scripts/sandbox/sandbox.py`).

## Verification

- `python3 -m pytest skills/python-dev/tests/` → **17 passed**
- `pyflakes` clean
- CI (frontend gate) green on the merged commit

## Related

- AST10 gates: `scripts/sandbox/ast10/` (PR #130, commit `ca3a6ed`)
- Hardened executor: `scripts/sandbox/sandbox.py` (PR #129, commit `fe7d389`)
