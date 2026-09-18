#!/usr/bin/env python3
"""Workflow Permission Check — permission-aware gate for GitHub App operations.

Pure standard library. Answers one question before an action is attempted:
*does the identity actually hold the permissions this operation needs?*

The lesson this encodes: `contents: write` is NOT `workflows: write`. An identity
can push ordinary files and still be rejected on `.github/workflows/*`, so probing
blindly wastes attempts. Check first, then act.
"""
from __future__ import annotations

from typing import Dict, List

# Operation -> the full set of permissions it requires.
OPERATIONS: Dict[str, List[str]] = {
    "code_write": ["contents:write"],
    "workflow_write": ["contents:write", "workflows:write"],
    "rerun_ci": ["actions:write"],
    "read_repo": ["contents:read"],
}

# Operations whose writes touch .github/workflows/ and therefore need the
# `workflows` App permission on top of contents.
WORKFLOW_SCOPED = {"workflow_write"}


def required(operation: str) -> List[str]:
    """Permissions required for an operation (sorted). Unknown -> read-only."""
    return sorted(OPERATIONS.get(operation, ["contents:read"]))


def can_write(operation: str, granted: List[str]) -> bool:
    """True only when every permission the operation needs is granted."""
    return set(required(operation)).issubset(set(granted))


def missing(operation: str, granted: List[str]) -> List[str]:
    """Permissions the operation needs but the identity lacks."""
    return sorted(set(required(operation)) - set(granted))


def explain(operation: str, granted: List[str]) -> Dict[str, object]:
    """Machine-readable verdict for one operation."""
    need = required(operation)
    lack = missing(operation, granted)
    return {
        "operation": operation,
        "required": need,
        "granted": sorted(set(granted)),
        "missing": lack,
        "allowed": not lack,
        "workflow_scoped": operation in WORKFLOW_SCOPED,
    }


def check_workflow_write(granted: List[str]) -> Dict[str, object]:
    """Convenience gate for the common blocked case."""
    return explain("workflow_write", granted)


def check_many(operations: List[str], granted: List[str]) -> Dict[str, object]:
    """Evaluate several operations at once; blocked if any is not allowed."""
    results = {op: explain(op, granted) for op in operations}
    blocked = [op for op, r in results.items() if not r["allowed"]]
    return {"results": results, "blocked": blocked, "all_allowed": not blocked}


if __name__ == "__main__":  # pragma: no cover
    import json
    print(json.dumps(explain("workflow_write", ["contents:write"]), indent=2))
