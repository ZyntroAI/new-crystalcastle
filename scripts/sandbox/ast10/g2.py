"""G2 — semantic intent verification (AST10 gate 2).

Builds the standard prompt and, crucially, offers a **deterministic, offline
fallback classifier** so the gate works even when no LLM is available (tests,
CI, or cold start). The prompt is the intended production path; the static
fallback is the same check expressed as rules, and either output shape is
identical so downstream gates (G3) don't care which produced it.
"""
from __future__ import annotations

import json
import re
from typing import Any, Dict, Optional

# --------------------------------------------------------------------------
# Prompt template (production path — used with an LLM, e.g. Haiku)
# --------------------------------------------------------------------------

_G2_PROMPT = """Role: Senior Security Auditor | Standard: AST10 G2 (Semantic Verification)
Task: {task}

[Script under review]
```python
{script}
```

Judge ONLY against these rules, returning strict JSON:

1. Scope: does the script do exactly the task, without touching anything else?
2. AST10 risk signals (any hit => treat as high risk):
   - exfiltration / network egress: requests, urllib, http.client, curl, socket, base64
   - privilege escalation: sudo, chmod 777, os.chmod, --privileged, setuid
   - destructive / out-of-scope writes: rm -rf, shutil.rmtree, os.remove, git push --force, .git/config writes
   - filesystem access outside the declared sandbox workspace
3. Score 0.0-1.0: 1.0 = safe & on-task; >=0.8 pass; <0.8 require human review.

Return ONLY this JSON, no prose:
{{
  "intent_score": float,
  "is_malicious": bool,
  "risk_type": "none" | "exfiltration" | "privilege_escalation" | "destructive" | "out_of_scope",
  "within_scope": bool,
  "reason": str,
  "requires_approval": bool
}}"""


def get_g2_verification_prompt(
    script_content: str, task_name: str, task_desc: str
) -> str:
    """Standard AST10 G2 prompt. Reusable across every scripted task."""
    task = f"{task_name}: {task_desc}" if task_desc else task_name
    return _G2_PROMPT.format(script=script_content, task=task)


# --------------------------------------------------------------------------
# Deterministic risk signals (shared by the offline classifier)
# --------------------------------------------------------------------------

_EGRESS = re.compile(
    r"\b(requests|urllib\.(request|parse)|http\.client|httpx|curl|wget|"
    r"aiohttp|socket|urlopen|base64\.(b64encode|b64decode))\b",
    re.I,
)
_PRIV_ESC = re.compile(
    r"\b(sudo|setuid|setgid|chown|os\.chmod|chmod 777|--privileged|"
    r"user\.add|passwd)\b",
    re.I,
)
_DESTRUCTIVE = re.compile(
    r"\b(shutil\.rmtree|os\.remove|os\.unlink|os\.rmdir|rm -rf|"
    r"git push --force|git reset --hard|open\([^)]*['\"][wax])",
    re.I,
)
_EGRESS_FUNC = re.compile(r"\b(requests|urllib|httpx|curl|wget|socket)\b", re.I)
_FILE_ACCESS = re.compile(
    r"\bopen\(|os\.(listdir|walk|remove)|shutil\.(copy|move|rmtree)|"
    r"pathlib\.Path\([^)]*\.(read|write|unlink)",
    re.I,
)


def _classify(script: str, task: str) -> Dict[str, Any]:
    """Deterministic G2 evaluation. Returns the same shape the LLM would."""
    lines = [l.strip() for l in script.splitlines() if l.strip()]

    risks: list[str] = []
    if _EGRESS.search(script):
        risks.append("exfiltration")
    if _PRIV_ESC.search(script):
        risks.append("privilege_escalation")
    if _DESTRUCTIVE.search(script):
        risks.append("destructive")

    # Simple scope proxy: reading a workspace file for an extract/read task is
    # in-scope; anything that writes/removes files, shells out, or egresses is
    # assumed out-of-scope unless the task explicitly asks for it.
    writes_outside = bool(
        _FILE_ACCESS.search(script) and not re.search(r"write|save|create|export", task, re.I)
    )
    if writes_outside:
        risks.append("out_of_scope")

    # Score: start full, deduct per risk family.
    score = 1.0 - 0.25 * len(risks)
    is_malicious = any(r in ("exfiltration", "privilege_escalation", "destructive") for r in risks)
    within_scope = not risks or risks == ["out_of_scope"] and score >= 0.75

    # Deterministic guard: ANY egress / priv-esc / destructive signal -> hard fail.
    if is_malicious:
        within_scope = False
        score = min(score, 0.2)

    requires_approval = score < 0.8
    return {
        "intent_score": round(max(score, 0.0), 2),
        "is_malicious": is_malicious,
        "risk_type": risks[0] if risks else "none",
        "within_scope": within_scope,
        "reason": (
            f"detected risk: {', '.join(risks)}"
            if risks
            else "no AST10 risk signals; appears on-task"
        ),
        "requires_approval": requires_approval,
    }


class G2IntentVerifier:
    """Runs the G2 gate. Uses ``llm_invoke`` if given, else the offline
    classifier. ``llm_invoke`` must return text containing a JSON object."""

    def __init__(self, llm_invoke: Optional[Any] = None):
        self._llm = llm_invoke

    def verify(self, script: str, task: str) -> Dict[str, Any]:
        if self._llm is not None:
            raw = self._llm(get_g2_verification_prompt(script, task, ""))
            try:
                m = re.search(r"\{.*\}", raw, re.S)
                if m:
                    parsed = json.loads(m.group(0))
                    # Normalise/validate required keys defensively.
                    return {
                        "intent_score": float(parsed.get("intent_score", 0.0)),
                        "is_malicious": bool(parsed.get("is_malicious", False)),
                        "risk_type": str(parsed.get("risk_type", "none")),
                        "within_scope": bool(parsed.get("within_scope", False)),
                        "reason": str(parsed.get("reason", "")),
                        "requires_approval": bool(
                            parsed.get("requires_approval", True)
                        ),
                    }
            except (json.JSONDecodeError, ValueError, TypeError):
                pass  # fall through to deterministic classifier
        return _classify(script, task)
