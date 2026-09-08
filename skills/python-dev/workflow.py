"""Workflow glue — mirrors AST10 gate ordering for the orchestrator API."""
from __future__ import annotations

from typing import Any, Callable

# Decision table: how to route based on static result.
def decide(static: dict[str, Any]) -> str:
    status = static.get("status")
    if status == "clean":
        return "report"       # nothing to do
    if status == "warn":
        return "advice"       # fix guidance, no runtime needed
    return "reproduce"        # needs sandbox runtime


def route(static: dict[str, Any], reproduce: Callable[[], dict[str, Any]]) -> dict[str, Any]:
    step = decide(static)
    out: dict[str, Any] = {"step": step, "static": static}
    if step == "reproduce":
        out["runtime"] = reproduce()
    return out
