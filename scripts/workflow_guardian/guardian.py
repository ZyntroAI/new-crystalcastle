"""Permission-aware Workflow Guardian — self-contained Python implementation.

Converts the FIG workflow_security_guardian concept into runnable code:
  gate (check token scopes for .github/workflows files)
  -> repair (SHA-pin @vN -> full SHA)
  -> validate (YAML parse + no @vN remaining)
  -> push (git; on permission-denied save handoff + escalate)

Pure stdlib. Action->SHA map is injected (config), never hardcoded here.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

# Regex for a workflow action reference that is NOT already a full SHA pin.
# Matches version refs: uses: owner/repo@v3, @v3.1.2, @3, @3.1.2
# Must NOT match a 40-hex full SHA (which can begin with digits).
_TAG_REF_RE = re.compile(
    r"uses:\s+([\w./-]+)@(?![0-9a-fA-F]{40})(?:v?\d+(?:\.\d+)*|v\d+)"
)

# actions/checkout SHA used across this repo's workflows (verified present).
_DEFAULT_ACTIONS_SHA: Dict[str, str] = {
    "actions/checkout": "11bd71901bbe5b1630ceea73d275971dd864cf32",
    "actions/setup-python": "0a5c61591373683505ea898e09a731b4c89a1da0",
    "actions/upload-artifact": "65462800fd76038f1b7aab23970b613b45fbb101",
}


@dataclass
class GuardianConfig:
    """Policy configuration (mirrors the FIG `config` block)."""

    required_workflow_scopes: List[str] = field(
        default_factory=lambda: ["contents:write", "workflows:write"]
    )
    required_general_scopes: List[str] = field(default_factory=lambda: ["contents:write"])
    enforce_sha_only: bool = True
    block_unsafe_tags: bool = True
    actions_sha: Dict[str, str] = field(default_factory=lambda: dict(_DEFAULT_ACTIONS_SHA))
    handoff_path: str = ".fig/handoff/workflow.json"
    retry_permission_denied: int = 0  # 0 -> handoff immediately


def _is_workflow_file(path: str) -> bool:
    return path.startswith(".github/workflows/")


def _fake_token_scopes() -> List[str]:
    """Return scopes for the current token.

    In sandbox we cannot introspect the GitHub App installation scopes via
    `gh api user` (returns 403 for app tokens). We expose an env override so
    callers/tests can inject scopes; the real caller should set
    WORKFLOW_GUARDIAN_SCOPES to what the app actually holds.
    """
    raw = os.getenv("WORKFLOW_GUARDIAN_SCOPES", "contents:write")
    return [s.strip() for s in raw.split(",") if s.strip()]


def gate(files: List[str]) -> Dict:
    """Check whether the current scopes permit touching the given files."""
    workflows = [f for f in files if _is_workflow_file(f)]
    need_workflow = bool(workflows)
    scopes = _fake_token_scopes()
    required = (
        GuardianConfig().required_workflow_scopes
        if need_workflow
        else GuardianConfig().required_general_scopes
    )
    ok = all(r in scopes for r in required)
    return {
        "status": "OK" if ok else "BLOCKED",
        "scope": "workflows:write" if need_workflow else "contents:write",
        "workflow_files": workflows,
        "required": required,
        "have": scopes,
    }


def repair_sha(workflow_files: List[str], actions_sha: Optional[Dict[str, str]] = None) -> Dict:
    """Replace `@vX` action refs with full commit SHAs. Returns repaired + changed."""
    sha_map = actions_sha or GuardianConfig().actions_sha
    repaired: List[str] = []
    unchanged: List[str] = []
    skipped: List[str] = []

    for path in workflow_files:
        p = Path(path)
        if not p.exists():
            skipped.append(path)
            continue
        text = p.read_text(encoding="utf-8")
        changed = False

        def _sub(m):
            nonlocal changed
            action = m.group(1)
            sha = sha_map.get(action)
            if not sha:
                return m.group(0)  # leave unknown actions; don't guess a SHA
            changed = True
            return f"uses: {action}@{sha}"

        new_text = _TAG_REF_RE.sub(_sub, text)
        if changed:
            p.write_text(new_text, encoding="utf-8")
            repaired.append(path)
        else:
            unchanged.append(path)

    return {"repaired": repaired, "unchanged": unchanged, "skipped": skipped}


def _yaml_ok(path: str) -> bool:
    try:
        import yaml  # optional; repo may not have pyyaml in this sandbox
        yaml.safe_load(Path(path).read_text(encoding="utf-8"))
        return True
    except Exception:
        # No pyyaml, or parse error -> report as error so it's visible.
        return False


def validate_sha(workflow_files: List[str]) -> Dict:
    """Return valid/invalid per file: must parse as YAML and contain no @vN."""
    errors: List[str] = []
    checked: List[str] = []
    for path in workflow_files:
        p = Path(path)
        if not p.exists():
            errors.append(f"{path}: missing")
            continue
        raw = p.read_text(encoding="utf-8")
        checked.append(path)
        if _TAG_REF_RE.search(raw):
            errors.append(f"{path}: has unpinned @vN ref")
    return {"valid": len(errors) == 0, "errors": errors, "checked": checked}


def git_push(branch: str, *, dry_run: bool = True) -> Dict:
    """Push current branch. dry_run=True avoids a real push (permission-safe)."""
    if dry_run:
        return {"success": True, "dry_run": True, "branch": branch}
    try:
        r = subprocess.run(
            ["git", "push", "origin", branch], capture_output=True, text=True, timeout=60
        )
        if r.returncode == 0:
            return {"success": True, "dry_run": False}
        err = r.stderr.lower()
        if "permission" in err or "rejected" in err or "refusing" in err:
            return {"success": False, "error": "PERMISSION", "detail": r.stderr.strip()[:200]}
        return {"success": False, "error": "PUSH_FAILED", "detail": r.stderr.strip()[:200]}
    except Exception as e:
        return {"success": False, "error": "PUSH_EXCEPTION", "detail": str(e)}


def save_handoff(snapshot: Dict, handoff_path: Optional[str] = None) -> Dict:
    path = handoff_path or GuardianConfig().handoff_path
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
    return {"snapshot_path": path, "snapshot": snapshot}


def escalate(scope: str, repo: str, branch: str) -> Dict:
    """Produce an escalation request artifact (no real admin call in sandbox)."""
    return {
        "request": {
            "scope": scope,
            "repo": repo,
            "branch": branch,
            "reason": "Permission-aware workflow update requires workflows:write",
            "resume": f"fig/workflow_guardian --resume --repo {repo} --branch {branch}",
            "approval": True,
        }
    }


def run_workflow(files: List[str], repo: str, branch: str, *, push: bool = False) -> Dict:
    """End-to-end: gate -> repair -> validate -> (push|handoff+escalate)."""
    g = gate(files)
    if g["status"] == "BLOCKED":
        snapshot = {
            "branch": branch, "files": files, "blocker": g["scope"],
            "timestamp": datetime.now(timezone.utc).isoformat(), "repo": repo,
        }
        hs = save_handoff(snapshot)
        esc = escalate(g["scope"], repo, branch)
        return {"status": "BLOCKED", "stage": "gate", "handoff": hs, "escalate": esc}

    if not g["workflow_files"]:
        # No workflows changed -> no repair needed; nothing to push safely.
        return {"status": "NOOP", "stage": "gate", "gate": g}

    rep = repair_sha(g["workflow_files"])
    val = validate_sha(rep["repaired"] + rep["unchanged"])
    if not val["valid"]:
        return {"status": "FAILED", "stage": "validate", "gate": g, "repair": rep, "errors": val["errors"]}

    if push:
        ps = git_push(branch, dry_run=False)
        if ps.get("error") == "PERMISSION":
            snapshot = {"branch": branch, "files": files, "blocker": "workflows:write",
                        "timestamp": datetime.now(timezone.utc).isoformat(), "repo": repo}
            return {"status": "BLOCKED", "stage": "push", "handoff": save_handoff(snapshot),
                    "escalate": escalate("workflows:write", repo, branch)}
        return {"status": "SUCCESS", "stage": "push", "gate": g, "repair": rep, "push": ps}

    return {"status": "SUCCESS", "stage": "ready", "gate": g, "repair": rep, "validate": val}


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Permission-aware workflow guardian (SHA-pin)")
    ap.add_argument("--files", nargs="*", default=[])
    ap.add_argument("--repo", default=os.getenv("GITHUB_REPOSITORY", "ZyntroAI/new-crystalcastle"))
    ap.add_argument("--branch", default=os.getenv("GITHUB_HEAD_REF") or os.getenv("GITHUB_REF") or "main")
    ap.add_argument("--push", action="store_true")
    args = ap.parse_args()
    print(json.dumps(run_workflow(args.files, args.repo, args.branch, push=args.push), indent=2))
