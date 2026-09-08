"""G3 — behavioral sandbox node (AST10 gate 3).

Runs ONLY after G2 has passed (intent_score >= 0.8 AND within_scope). It
delegates actual container execution to the shared hardened executor in
``scripts/sandbox/sandbox.py`` so the isolation guarantees stay in one place
(network none, read-only root, cap-drop, no-new-privileges, tmpfs, timeout
kill). G3's own job is the **gatekeeping + runtime-anomaly + alerting** layer.
"""
from __future__ import annotations

import os
import sys
from typing import Any, Callable, Dict, Optional

# Allow importing the sibling hardened sandbox whether run as a package or a
# loose script (tests set this up, but be safe).
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from sandbox import sandbox_execution_node  # noqa: E402  (hardened executor)

G3_MIN_SCORE = 0.8

# Production defaults. Callers may only tune timeout/image (hardened executor
# enforces the rest, and it wins over anything we pass in).
G3_DEFAULTS: Dict[str, Any] = {
    "network": "none",
    "memory": "256m",
    "cpus": "0.5",
    "timeout": 15,
    "read_only": True,
}


def _g2_passed(g2: Optional[Dict[str, Any]]) -> bool:
    if not isinstance(g2, dict):
        return False
    return (
        g2.get("within_scope") is True
        and isinstance(g2.get("intent_score"), (int, float))
        and g2["intent_score"] >= G3_MIN_SCORE
    )


def g3_sandbox_node(
    state: Dict[str, Any],
    *,
    alert: Optional[Callable[[str, Dict[str, Any]], Any]] = None,
    sandbox_exec=None,
    sandbox_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """LangGraph node.

    ``state`` keys: proposed_script (str), g2_verification (dict, optional but
    required to proceed), permission_manifest (dict, optional).

    ``alert`` is an injectable ``(severity, payload) -> any`` notifier
    (default: no-op) so tests and non-Slack deployments stay dependency-free.
    ``sandbox_exec`` overrides the executor for tests.
    ``sandbox_config`` tunes timeout/image only.
    """
    script = state.get("proposed_script")
    g2 = state.get("g2_verification")
    manifest = state.get("permission_manifest", {})

    if not script or not isinstance(script, str):
        return {"status": "error", "stage": "G3", "reason": "NO_SCRIPT_PROVIDED"}

    if not _g2_passed(g2):
        reason = g2.get("reason", "Failed G2 Semantic Check") if isinstance(g2, dict) else "No G2 result"
        if alert:
            alert("WARNING", {"event": "G2 Blocked", "stage": "G3", "msg": reason})
        return {
            "status": "blocked",
            "stage": "G3",
            "reason": "Failed G2 Semantic Check",
            "detail": reason,
            "isolated": True,
        }

    config = dict(G3_DEFAULTS)
    config.update(sandbox_config or {})  # only timeout/image pass through to executor

    exec_fn = sandbox_exec or sandbox_execution_node
    result = exec_fn(
        {
            "proposed_script": script,
            "permission_manifest": manifest,
            "sandbox_config": config,
        }
    )

    status = result.get("status")
    if status == "success":
        out = {
            "status": "success",
            "stage": "G3",
            "output": result.get("output"),
            "format": result.get("format", "text"),
            "isolated": True,
            "g2_score": g2["intent_score"],
        }
        if alert:
            alert("SUCCESS", {"event": "Script Executed", "stage": "G3"})
        return out

    # Runtime anomaly / timeout / policy error
    anomaly_status = {
        "failed": "runtime_failed",
        "error": "timeout" if "EXECUTION_TIMEOUT" in str(result.get("error", "")) else "runtime_failed",
        "denied": "blocked",
        "error_": "system_error",
    }.get(status, "runtime_failed")

    out = {
        "status": anomaly_status,
        "stage": "G3",
        "error": result.get("error", result.get("reason", "unknown")),
        "isolated": True,
        "g2_score": g2.get("intent_score"),
    }
    if status == "denied":
        out["status"] = "blocked"
        out["reason"] = result.get("reason", "Manifest denied")
        severity = "WARNING"
    elif anomaly_status in ("timeout", "runtime_failed"):
        severity = "CRITICAL"
    else:
        severity = "ERROR"

    if alert:
        alert(severity, {"event": "G3 Runtime Failure", "msg": out["error"]})
    return out
