"""python-dev — layered Python development engine.

Static (Pyflakes, no-exec) + runtime (IPython/AST10-sandboxed) under one
orchestrator. AST10: Scan -> Analyze -> Execute(Sandbox) -> Verify -> Patch.

The on-disk folder is `skills/python-dev/` (hyphen). For dotted imports
(`skills.python_dev`) tests load the package via conftest.py. Use
`PythonDevOrchestrator` from `.orchestrator`.
"""
