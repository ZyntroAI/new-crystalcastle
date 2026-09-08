"""Runtime layer — interactive/debug via IPython, but EXECUTION is sandboxed.

We use IPython for *inspecting* a file's AST + building a reproduce snippet,
never for running arbitrary code inline. Actual code execution is delegated to
the AST10 G3 sandbox through ``SandboxGuard.run``.
"""
from __future__ import annotations

import ast
from typing import Any

from .security import SandboxGuard


def _syntax_ok(source: str) -> tuple[bool, str]:
    try:
        ast.parse(source)
        return True, ""
    except SyntaxError as e:
        return False, f"{e.msg} (line {e.lineno})"


class RuntimeSession:
    """Inspect + reproduce within the AST10 sandbox boundary."""

    def __init__(self, guard: SandboxGuard | None = None) -> None:
        self._guard = guard or SandboxGuard()

    # -- static inspection (no exec) --------------------------------------
    def inspect_source(self, source: str) -> dict[str, Any]:
        ok, err = _syntax_ok(source)
        if not ok:
            return {"valid": False, "error": err}
        tree = ast.parse(source)
        names = sorted({n.id for n in ast.walk(tree) if isinstance(n, ast.Name)})
        return {"valid": True, "top_level_names": names, "kind": "python"}

    # -- sandboxed execution ----------------------------------------------
    def run(self, code: str, task: str = "execute user snippet") -> dict[str, Any]:
        """Execute through the AST10 G3 sandbox (docker, offline, gated)."""
        return self._guard.run(code, task)
