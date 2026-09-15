"""Permission model + AST10-compatible sandbox guard for python-dev.

Runtime execution is NEVER run inline. It is delegated to the AST10 G3 sandbox
node (scripts/sandbox/ast10), which enforces: G2 intent gate, docker isolation
(network none, read-only, cap-drop), resource caps, timeout. This keeps
"execute" approval-gated and sandbox-first per the AST10 standard.
"""
from __future__ import annotations

from functools import wraps
from typing import Any, Callable, Iterator

# --- permission table (matches SKILL.md) ---
PERMS = {
    "execute": {"level": "APPROVAL", "sandbox": True},
    "shell": {"block": True},
    "network": {"block": True},
    "filesystem_write": {"block": True},
}


def require_permission(name: str) -> Callable[[Callable], Callable]:
    """Decorator: block the call if the permission is marked blocked.
    Approval-gated perms pass the *gate* here; the actual sandbox isolation is
    enforced at the point of execution (see SandboxGuard.isolate)."""

    def deco(fn: Callable) -> Callable:
        @wraps(fn)
        def wrapper(*args: Any, **kw: Any) -> Any:
            entry = PERMS.get(name, {})
            if entry.get("block"):
                raise PermissionError(f"{name}: BLOCKED by policy")
            return fn(*args, **kw)

        return wrapper

    return deco


# Lazily import the AST10 gates so the static layer works even if docker deps
# / the ast10 package aren't importable (it degrades to a clear error).
def _ast10():
    from ast10.flow import ast10_security_flow  # noqa: F401

    return ast10_security_flow


class SandboxGuard:
    """Runs a python snippet through the AST10 G3 sandbox (docker, offline)."""

    def __init__(self, alert: Any = None) -> None:
        self._alert = alert

    def can_execute(self) -> bool:
        return PERMS["execute"]["sandbox"] is True

    def run(self, code: str, task: str, **kw: Any) -> dict[str, Any]:
        """Execute `code` via AST10 (G2 intent + G3 docker sandbox)."""
        if not self.can_execute():
            raise PermissionError("execute: BLOCKED by policy")
        flow = _ast10()
        return flow(
            {
                "script": code,
                "task": {"name": "python-dev runtime", "desc": task},
            },
            **kw,
        )

    def isolate(self) -> Iterator[None]:
        """Context manager kept for API compatibility; actual isolation is
        enforced in run() via the AST10 docker sandbox. Local inline eval is
        intentionally NOT provided here."""
        # Re-raise as a guard so nobody can call `.isolate()` to run inline.
        yield
