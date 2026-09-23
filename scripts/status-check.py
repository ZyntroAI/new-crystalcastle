#!/usr/bin/env python3
"""
CrystalCastle — Status & Workflow Checker
Validates: file paths • workflow permissions • secrets exposure • CI readiness
Usage:
    python scripts/status-check.py              # Standard scan
    python scripts/status-check.py --strict     # Fail on MEDIUM findings
    python scripts/status-check.py --json       # Machine-readable output
"""

import os
import re
import json
import sys
from pathlib import Path
from typing import List, Dict, Any, Tuple

# ========== CONFIGURATION ==========
ROOT = Path(__file__).resolve().parent.parent
WORKFLOW_DIR = ROOT / ".github" / "workflows"
SCRIPT_DIR = ROOT / "scripts"

IGNORE_DIRS = {
    "node_modules", ".git", "dist", "build", "__pycache__",
    ".cache", "logs", "tmp", ".turbo"
}

SEVERITY = {
    "CRITICAL": 4,
    "HIGH": 3,
    "MEDIUM": 2,
    "LOW": 1,
    "INFO": 0
}

# Secrets & sensitive patterns
SECRET_PATTERNS = [
    ("github-token", re.compile(r"gh[pors]_[A-Za-z0-9]{30,}")),
    ("slack-webhook", re.compile(r"hooks\.slack\.com/services/[A-Za-z0-9/_-]+")),
    ("aws-key", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("private-key", re.compile(r"-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----")),
    ("api-key-plain", re.compile(r"(api[_-]?key|secret[_-]?key)\s*[:=]\s*['\"][A-Za-z0-9_\-]{16,}['\"]", re.I)),
]

# Workflow permission anti-patterns
PERMISSION_RULES = [
    ("no-permissions-block", "Missing `permissions:` block — uses excessive defaults", "HIGH"),
    ("write-all", "Uses `write-all` — replace with minimal scopes", "CRITICAL"),
    ("broad-contents-write", "`contents: write` without documented need", "MEDIUM"),
]

# Path/file structural rules
PATH_RULES = [
    (r"\.md/", "Directory ends in .md — causes Git checkout failure", "CRITICAL"),
    (r"\.(yml|yaml|json)/", "Directory has file extension — will break checkout", "HIGH"),
    (r"[<>:\"|?*]", "Filename contains forbidden characters", "MEDIUM"),
]
# ====================================

class Issue:
    def __init__(self, severity: str, rule: str, message: str, path: str = "", line: int = 0):
        self.severity = severity
        self.rule = rule
        self.message = message
        self.path = path
        self.line = line

    def to_dict(self) -> Dict[str, Any]:
        return {
            "severity": self.severity,
            "rule": self.rule,
            "message": self.message,
            "path": self.path,
            "line": self.line
        }

    def __str__(self) -> str:
        icon = {
            "CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🔵", "INFO": "⚪"
        }.get(self.severity, "?")
        loc = f"{self.path}:{self.line}" if self.line else self.path
        return f"{icon} {self.severity} — {self.rule}\n   📄 {loc}\n   💬 {self.message}"


def walk_files(directory: Path, extensions: List[str] = None) -> List[Path]:
    """Recursively list files, skipping ignored directories"""
    found = []
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        root_path = Path(root)
        for name in files:
            if extensions and not any(name.endswith(ext) for ext in extensions):
                continue
            found.append(root_path / name)
    return found


def check_paths() -> List[Issue]:
    """Validate file & directory names"""
    issues = []
    all_files = walk_files(ROOT)

    for path in all_files:
        rel = path.relative_to(ROOT).as_posix()
        # Check full path string
        for pattern, msg, sev in PATH_RULES:
            if re.search(pattern, rel):
                issues.append(Issue(sev, "path-violation", msg, rel))
        # Check dirs ending in extensions
        parts = rel.split("/")
        for part in parts[:-1]:  # exclude filename
            if re.search(r"\.(md|yml|yaml|json)$", part):
                issues.append(Issue("CRITICAL", "dir-extension",
                    f"Directory '{part}' has file extension — checkout will fail",
                    "/".join(parts[:parts.index(part)+1]) + "/"))
    return issues


def check_workflows() -> List[Issue]:
    """Scan .github/workflows for permission & trigger issues"""
    issues = []
    if not WORKFLOW_DIR.exists():
        return [Issue("INFO", "no-workflows", "No .github/workflows directory found")]

    for wf in WORKFLOW_DIR.glob("*.yml"):
        content = wf.read_text(encoding="utf-8")
        rel_path = wf.relative_to(ROOT).as_posix()

        # Check permissions block exists
        if not re.search(r"^permissions:", content, re.MULTILINE):
            issues.append(Issue("HIGH", "no-permissions",
                "No `permissions:` block — uses broad default scopes", rel_path))
            continue

        # Check for write-all
        if "write-all" in content:
            issues.append(Issue("CRITICAL", "write-all-permissions",
                "Uses `permissions: write-all` — excessive, replace with minimal scopes", rel_path))

        # Check overly broad contents:write
        if re.search(r"contents:\s*write", content) and "protect" not in wf.name.lower():
            issues.append(Issue("MEDIUM", "broad-contents-write",
                "`contents: write` — confirm minimal scope is sufficient", rel_path))

        # Check for empty/undefined triggers
        if not re.search(r"^on:", content, re.MULTILINE):
            issues.append(Issue("HIGH", "no-trigger", "Workflow has no `on:` trigger", rel_path))

    return issues


def check_secrets() -> List[Issue]:
    """Scan committed files for accidentally exposed secrets"""
    issues = []
    code_files = walk_files(ROOT, extensions=[".py", ".js", ".ts", ".yml", ".yaml", ".json", ".md"])

    for path in code_files:
        try:
            text = path.read_text(encoding="utf-8")
        except:
            continue  # skip binary/unreadable

        rel = path.relative_to(ROOT).as_posix()
        for rule_name, pattern in SECRET_PATTERNS:
            for i, line in enumerate(text.split("\n"), 1):
                if pattern.search(line):
                    issues.append(Issue(
                        "CRITICAL" if "token" in rule_name or "key" in rule_name else "HIGH",
                        f"exposed-{rule_name}",
                        f"Potential {rule_name} committed to repo",
                        rel, i
                    ))
    return issues


def summarize(issues: List[Issue], strict: bool = False) -> Tuple[int, Dict[str, int]]:
    """Summarize issues and determine exit code"""
    counts = {k: 0 for k in SEVERITY}
    for iss in issues:
        counts[iss.severity] += 1

    # Determine failure threshold
    fail_level = SEVERITY["MEDIUM"] if strict else SEVERITY["HIGH"]
    should_fail = any(SEVERITY[iss.severity] >= fail_level for iss in issues)
    exit_code = 1 if should_fail else 0

    return exit_code, counts


def main():
    args = sys.argv[1:]
    strict = "--strict" in args
    json_output = "--json" in args

    issues: List[Issue] = []
    issues.extend(check_paths())
    issues.extend(check_workflows())
    issues.extend(check_secrets())

    exit_code, counts = summarize(issues, strict)

    if json_output:
        result = {
            "summary": counts,
            "total_issues": len(issues),
            "passed": exit_code == 0,
            "issues": [i.to_dict() for i in issues]
        }
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(0 if result["passed"] else 1)

    # Human-readable output
    print("=" * 60)
    print("🔍 CrystalCastle Status Check")
    print(f"📂 Scanning: {ROOT}")
    print("=" * 60)

    if issues:
        print(f"\n⚠️ Found {len(issues)} issue(s):\n")
        for iss in issues:
            print(str(iss))
            print()
    else:
        print("\n✅ All checks passed — repository is clean & secure 🎉\n")

    print("📊 Summary:")
    for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]:
        if counts[sev] > 0 or sev in ["CRITICAL", "HIGH"]:
            icon = {"CRITICAL":"🔴","HIGH":"🟠","MEDIUM":"🟡","LOW":"🔵","INFO":"⚪"}[sev]
            print(f"  {icon} {sev.ljust(8)} {counts[sev]}")

    print()
    if exit_code == 0:
        print("✅ Ready to merge / push")
    else:
        threshold = "MEDIUM+" if strict else "HIGH+"
        print(f"❌ Blocked — fix all {threshold} issues before pushing")
        print(f"💡 Use --strict to enforce MEDIUM; --json for machine-readable report")

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
