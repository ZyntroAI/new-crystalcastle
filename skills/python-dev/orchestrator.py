"""python-dev orchestrator — main entry.

Workflow (AST10): Scan(Pyflakes) -> Analyze -> Execute(AST10 G3 sandbox) -> Verify.
"""
from __future__ import annotations

from typing import Any

from .security import SandboxGuard, require_permission
from .static_layer import StaticAnalyzer
from .runtime_layer import RuntimeSession


class PythonDevOrchestrator:
    def __init__(self, guard: SandboxGuard | None = None) -> None:
        self.static = StaticAnalyzer()
        self.guard = guard or SandboxGuard()
        self.runtime = RuntimeSession(self.guard)

    def analyze(self, path: str = None, source: str = None) -> dict[str, Any]:
        """Static-only (safe / CI)."""
        return self.static.check(path=path, source=source)

    @require_permission("execute")
    def inspect(self, path: str = None, source: str = None, need_runtime: bool = False) -> dict[str, Any]:
        """Static + optional AST inspection. Runtime exec only when asked and
        always sandboxed via the guard."""
        full: dict[str, Any] = {"static": self.static.check(path=path, source=source)}
        if need_runtime:
            src = source if source is not None else open(path).read()
            full["inspect"] = self.runtime.inspect_source(src)
        return full

    @require_permission("execute")
    def execute(self, source: str, task: str = "execute python snippet") -> dict[str, Any]:
        """Run through the AST10 G3 sandbox."""
        return self.runtime.run(source, task)

    @require_permission("execute")
    def debug(self, path: str = None, source: str = None, line: int | None = None) -> dict[str, Any]:
        """Inspect + sandboxed run (no interactive pdb inline)."""
        src = source if source is not None else open(path).read()
        insp = self.runtime.inspect_source(src)
        run = self.runtime.run(src, f"debug snippet (line {line})" if line else "debug snippet")
        return {"inspect": insp, "run": run}

    def workflow(self, path: str = None, source: str = None) -> dict[str, Any]:
        """Full flow: scan -> if issues, sandbox reproduce -> recheck."""
        res = self.static.check(path=path, source=source)
        if res["status"] == "error":
            # Complex / failing file: try sandboxed reproduce if execution is allowed.
            if self.guard.can_execute():
                src = source if source is not None else open(path).read()
                res["runtime"] = self.runtime.run(src, "reproduce workflow")
                res["fixed"] = self.static.check(source=src)
        return res
