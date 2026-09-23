#!/usr/bin/env python3
"""
CrystalCastle — GitHub Actions Permission Auditor
Scans all .github/workflows/*.yml for:
  • Missing permissions blocks
  • Excessive/broad scopes (write-all, unrestricted contents:write)
  • Best-practice violations
Usage:
    python scripts/ci/permission-audit.py              # Scan & report
    python scripts/ci/permission-audit.py --fix        # Auto-suggest minimal scopes
    python scripts/ci/permission-audit.py --json       # Machine-readable output
"""

import re
import json
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional

# ========== CONFIGURATION ==========
ROOT = Path(__file__).resolve().parent.parent.parent
WORKFLOW_DIR = ROOT / ".github" / "workflows"

SEVERITY = {
    "CRITICAL": 4,
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
    "INFO": 0
}

# Scope recommendations — map triggers/actions → minimal scopes
SCOPE_GUIDANCE = {
    "contents": {
        "read": "Read repo files, commits, metadata",
        "write": "Push commits, create releases, edit files — RESTRICT to publishing workflows"
    },
    "actions": {
        "read": "List/download artifacts, view runs",
        "write": "Cancel/re-run workflows — use only when needed"
    },
    "pull-requests": {
        "read": "View PR details",
        "write": "Merge/edit/comment — restrict to automation"
    },
    "issues": {
        "read": "View issues",
        "write": "Create/comment/close — restrict to automation"
    },
    "pages": {
        "write": "Deploy GitHub Pages — required only for publish"
    },
    "id-token": {
        "write": "OIDC/Cloud auth — required for deployments"
    },
    "deployments": {
        "write": "Manage deployment environments"
    },
    "administrative": {
        "read": "View repo settings",
        "write": "Branch protection, settings — HIGHLY SENSITIVE"
    },
    "secrets": {
        "write": "Create/update repository secrets — SENSITIVE"
    },
    "packages": {
        "read": "Pull packages",
        "write": "Push packages"
    },
    "runs-on": {
        "self-hosted": "⚠️ Self-hosted runner — trust boundary extends"
    }
}

# Dangerous patterns
DANGEROUS = {
    "write-all": {
        "pattern": r"permissions:\s*write-all\b",
        "severity": "CRITICAL",
        "message": "Uses `permissions: write-all` — grants every scope with write access. Replace with minimal explicit scopes."
    },
    "no-permissions-block": {
        "pattern": r"^name:.*\n(?!\s*permissions:)",
        "severity": "HIGH",
        "message": "No `permissions:` block found — inherits broad default scopes. Add explicit minimal permissions."
    },
    "contents-write-broad": {
        "pattern": r"contents:\s*write\b",
        "severity": "MEDIUM",
        "message": "`contents: write` — confirm this is actually needed (publish/deploy only). Prefer `read` for CI/linting/tests."
    },
    "no-top-level-permissions": {
        "pattern": r"^on:",
        "severity": "LOW",
        "message": "Consider top-level `permissions:` to apply defaults to all jobs"
    }
}

# Trigger-to-scope mapping for auto-suggest
TRIGGER_SCOPE_HINTS = {
    "pull_request": {"contents": "read", "pull-requests": "read"},
    "push": {"contents": "read"},
    "schedule": {"contents": "read"},
    "workflow_dispatch": {"contents": "read"},
    "workflow_call": {},
    "release": {"contents": "write"},
    "deployment": {"contents": "read", "deployments": "write"},
    "pages_build": {"contents": "read", "pages": "write", "id-token": "write"}
}
# ====================================

class Finding:
    def __init__(self, rule_id: str, severity: str, message: str,
                 file: str, line: int = 0, fix_suggestion: str = ""):
        self.rule_id = rule_id
        self.severity = severity
        self.message = message
        self.file = file
        self.line = line
        self.fix_suggestion = fix_suggestion

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rule_id": self.rule_id,
            "severity": self.severity,
            "message": self.message,
            "file": self.file,
            "line": self.line,
            "fix_suggestion": self.fix_suggestion
        }

    def __str__(self) -> str:
        icon = {
            "CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🔵", "INFO": "⚪"
        }.get(self.severity, "?")
        loc = f"{self.file}:{self.line}" if self.line else self.file
        out = f"{icon} {self.severity} — {self.rule_id}\n   📄 {loc}\n   💬 {self.message}"
        if self.fix_suggestion:
            out += f"\n   ✅ Suggested Fix:\n{self.fix_suggestion}"
        return out


def list_workflows() -> List[Path]:
    """Return all .yml/.yaml in workflows dir"""
    if not WORKFLOW_DIR.exists():
        return []
    return list(WORKFLOW_DIR.glob("*.yml")) + list(WORKFLOW_DIR.glob("*.yaml"))


def extract_triggers(content: str) -> List[str]:
    """Extract trigger names from `on:` block"""
    m = re.search(r"^on:\s*\n((?:\s+[\w_-]+.*\n)+)?", content, re.MULTILINE)
    if not m:
        return []
    trigger_block = m.group(0)
    return re.findall(r"^\s+([a-z_]+):", trigger_block, re.MULTILINE)


def suggest_minimal_scopes(content: str) -> str:
    """Generate minimal permissions block based on triggers"""
    triggers = extract_triggers(content)
    scopes: Dict[str, str] = {}

    for t in triggers:
        if t in TRIGGER_SCOPE_HINTS:
            scopes.update(TRIGGER_SCOPE_HINTS[t])

    if not scopes:
        scopes = {"contents": "read"}

    lines = ["permissions:"]
    for scope, level in sorted(scopes.items()):
        lines.append(f"  {scope}: {level}")
    return "\n".join(lines)


def audit_file(path: Path) -> List[Finding]:
    """Audit a single workflow file"""
    findings: List[Finding] = []
    rel_path = path.relative_to(ROOT).as_posix()
    content = path.read_text(encoding="utf-8")
    lines = content.split("\n")

    # 1. Check for write-all
    for i, line in enumerate(lines, 1):
        if re.search(r"write-all\b", line):
            fix = suggest_minimal_scopes(content)
            findings.append(Finding(
                "write-all", "CRITICAL",
                "Uses `write-all` — excessive permission scope",
                rel_path, i,
                f"Replace with minimal scopes:\n{fix}"
            ))

    # 2. Check for top-level permissions block
    has_top_perms = re.search(r"^permissions:", content, re.MULTILINE)
    if not has_top_perms:
        fix = suggest_minimal_scopes(content)
        findings.append(Finding(
            "no-permissions-block", "HIGH",
            "No top-level `permissions:` block — uses broad defaults",
            rel_path, 1,
            f"Add at file top:\n{fix}"
        ))

    # 3. Check for broad contents:write
    for i, line in enumerate(lines, 1):
        if re.search(r"contents:\s*write\b", line):
            # Allow if filename suggests publishing/deploying
            if any(k in path.name.lower() for k in ["publish", "deploy", "release", "pages"]):
                continue
            findings.append(Finding(
                "broad-contents-write", "MEDIUM",
                "`contents: write` without obvious need — use `contents: read` unless publishing",
                rel_path, i,
                "Change to `contents: read` or document why write is required"
            ))

    # 4. Job-level permissions review
    job_perm_lines = [
        (i+1, line) for i, line in enumerate(lines)
        if re.search(r"^\s+permissions:", line)
    ]
    if job_perm_lines and not has_top_perms:
        findings.append(Finding(
            "job-only-permissions", "LOW",
            "Permissions defined only at job-level — consider top-level defaults",
            rel_path, job_perm_lines[0][0]
        ))

    return findings


def summarize(findings: List[Finding]) -> Tuple[int, Dict[str, int]]:
    counts = {k: 0 for k in SEVERITY}
    for f in findings:
        counts[f.severity] += 1

    # Fail on CRITICAL/HIGH
    fail_severity = SEVERITY["HIGH"]
    should_fail = any(SEVERITY[f.severity] >= fail_severity for f in findings)
    return 1 if should_fail else 0, counts


def main():
    args = sys.argv[1:]
    json_output = "--json" in args
    show_fix = "--fix" in args

    workflows = list_workflows()
    if not workflows:
        print("⚠️ No workflow files found at .github/workflows/")
        sys.exit(0)

    all_findings: List[Finding] = []
    for wf in workflows:
        all_findings.extend(audit_file(wf))

    exit_code, counts = summarize(all_findings)

    if json_output:
        result = {
            "scanned_workflows": len(workflows),
            "summary": counts,
            "passed": exit_code == 0,
            "findings": [f.to_dict() for f in all_findings]
        }
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(exit_code)

    # Human-readable output
    print("=" * 65)
    print("🔒 GitHub Actions Permission Auditor")
    print(f"📂 Scanned: {len(workflows)} workflow(s)")
    print("=" * 65)

    if all_findings:
        print(f"\n⚠️ Found {len(all_findings)} issue(s):\n")
        for f in all_findings:
            print(str(f))
            print()
    else:
        print("\n✅ All workflows follow least-privilege permission patterns 🎉\n")

    print("📊 Severity Summary:")
    for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
        icon = {"CRITICAL":"🔴","HIGH":"🟠","MEDIUM":"🟡","LOW":"🔵","INFO":"⚪"}[sev]
        print(f"  {icon} {sev.ljust(8)} {counts[sev]}")

    print()
    if exit_code == 0:
        print("✅ PASS — No CRITICAL/HIGH issues")
    else:
        print("❌ FAIL — CRITICAL/HIGH issues found")
        print("💡 Add --fix to see suggested minimal scopes")
        print("💡 Add --json for machine-readable export")

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
