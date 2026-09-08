---
name: python-dev
version: 1.0.0
depends: [pyflakes >= 3.2, ipython >= 8.26]
provides: [static-analysis, lint, execute, debug, inspect, reproduce]
security: permission-gated, sandbox-first, AST10-compatible
priority: 1
---

# python-dev — Layered Python Development Engine

Combine Pyflakes static analysis (fast / secure / no-exec) with a runtime
layer, under one orchestrator. Follows AST10:

```
Scan(Pyflakes) -> Analyze -> Execute(AST10 G3 sandbox) -> Verify -> Patch
```

## Structure

```
skills/python-dev/
├── SKILL.md
├── __init__.py
├── orchestrator.py   # PythonDevOrchestrator — main entry
├── static_layer.py   # StaticAnalyzer  -> Pyflakes (no import, no side effects)
├── runtime_layer.py  # RuntimeSession  -> inspect + AST10-sandboxed execution
├── security.py       # require_permission + SandboxGuard (AST10 G3)
├── workflow.py       # scan -> decide -> reproduce
└── tests/            # test_flow, test_perms, test_isolation
```

## Layers

- **Static (Pyflakes)** — never imports the target; fast, safe for CI.
- **Runtime** — AST inspection is local; **execution is always delegated to the
  AST10 G3 sandbox** (`scripts/sandbox/ast10`), never run inline. Docker,
  offline, gated by G2 intent + resource caps.

## Permission model

| perm | policy |
|------|--------|
| execute | approval-gated + sandbox-first (AST10 G3) |
| shell / network / filesystem_write | **blocked** |

## Usage

```python
from skills.python_dev.orchestrator import PythonDevOrchestrator

dev = PythonDevOrchestrator()
dev.analyze("some/file.py")        # static only (safe)
dev.workflow(source="print('hi')") # scan -> sandboxed run if issues
dev.execute("print(1+1)")          # via AST10 G3 sandbox (docker)
```

## Verification

```bash
python3 -m pytest skills/python-dev/tests/ -q
```
