"""AST10 orchestration flow: G1 (static) -> G2 (intent) -> G3 (runtime).

Pure orchestration — each gate lives in its own module and can be swapped for
testing. G1 here is a lightweight offline static scan; hook in Bandit/Semgrep
in production by replacing ``run_static_scan``.
"""
from __future__ import annotations

import re
from typing import Any, Callable, Dict, Optional

from .g2 import G2IntentVerifier
from .g3 import g3_sandbox_node

# G1 static-signal patterns (deterministic, offline). Production: replace with
# Bandit / Semgrep output.
_G1_CRITICAL = re.compile(
    r"\b(os\.system|subprocess\.(call|run|Popen)|eval\(|exec\(|pickle\.loads|"
    r"yaml\.load\()",
    re.I,
)


def run_static_scan(script: str) -> Dict[str, Any]:
    """G1: return {'safe': bool, 'issues': [...]}."""
    issues = []
    for m in _G1_CRITICAL.finditer(script):
        issues.append(f"possible dangerous call: {m.group(0).strip()}")
    return {"safe": not issues, "issues": issues}


def _block(gate: str, reason: Any) -> Dict[str, Any]:
    return {"status": "blocked", "stage": gate, "reason": str(reason)}


def ast10_security_flow(
    state: Dict[str, Any],
    *,
    verifier: Optional[G2IntentVerifier] = None,
    g3_kwargs: Optional[Dict[str, Any]] = None,
    static_scan: Callable[[str], Dict[str, Any]] = run_static_scan,
) -> Dict[str, Any]:
    """G1 -> G2 -> G3 with early block on any gate.

    Injects ``verifier`` and ``g3_kwargs`` for tests; production defaults are
    the real gates.
    """
    script = state.get("script") or state.get("proposed_script")
    task = state.get("task") or {}
    if not script or not isinstance(script, str):
        return _block("G0", "NO_SCRIPT_PROVIDED")

    # G1 static
    g1 = static_scan(script)
    if not g1["safe"]:
        return _block("G1", g1["issues"])

    # G2 intent
    v = verifier or G2IntentVerifier()
    g2 = v.verify(script, task.get("desc") or task.get("name") or "")
    if g2["intent_score"] < 0.8 or not g2["within_scope"]:
        out = _block("G2", g2.get("reason", "Low intent score / out of scope"))
        out["g2"] = g2
        return out

    # G3 runtime
    result = g3_sandbox_node(
        {"proposed_script": script, "g2_verification": g2},
        **(g3_kwargs or {}),
    )
    result["g2"] = g2
    result["g1"] = g1
    return result
