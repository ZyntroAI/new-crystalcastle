"""
CI Troubleshooter Skill — ZyntroAI Agent Framework
Detects & resolves common GitHub Actions failures automatically
"""
from typing import Dict, List, Optional
import re

class CITroubleshooterSkill:
    def __init__(self):
        self.name = "ci-troubleshooter"
        self.version = "1.0.0"
        
        # Known failure patterns → root cause mapping
        self.failure_patterns = [
            {
                "id": "path-filter-exclusion",
                "name": "Restrictive Path Filter",
                "patterns": [
                    r"paths:.*!.*docs",
                    r"paths:.*!.*\*\.(md|rst|txt)",
                    r"No tests found|pytest.*no.*collected",
                    r"Test.*passed.*but.*empty"
                ],
                "severity": "medium",
                "diagnosis": "Workflow excludes documentation paths → docs-only PR runs empty test suite",
                "fix_template": "Remove restrictive `paths:` filter OR add `if:` condition to skip tests safely"
            },
            {
                "id": "missing-permissions",
                "name": "Missing Workflow Permissions",
                "patterns": [
                    r"permission.*not.*write",
                    r"Resource not accessible by integration",
                    r"pull-requests.*not.*found",
                    r"403.*Forbidden.*token"
                ],
                "severity": "high",
                "diagnosis": "Workflow lacks explicit `permissions:` block → defaults to broad or insufficient access",
                "fix_template": "Add minimal permissions block at workflow level"
            },
            {
                "id": "floating-action-ref",
                "name": "Unpinned Action Reference",
                "patterns": [
                    r"uses:.*@v[0-9]+(\.[0-9]+)?\s*$",
                    r"uses:.*@main\s*$",
                    r"uses:.*@latest\s*$"
                ],
                "severity": "critical",
                "diagnosis": "Action referenced by mutable tag → supply-chain vulnerability",
                "fix_template": "Replace tag with full commit SHA pin"
            },
            {
                "id": "module-not-found",
                "name": "Python Path / Import Error",
                "patterns": [
                    r"ModuleNotFoundError.*no module named 'app'",
                    r"ImportError",
                    r"cannot import name"
                ],
                "severity": "high",
                "diagnosis": "PYTHONPATH not set or wrong working directory → pytest can't discover application module",
                "fix_template": "Set PYTHONPATH or cd into correct directory before running tests"
            },
            {
                "id": "sha-invalid-dead",
                "name": "Invalid/Non-Existent SHA Pin",
                "patterns": [
                    r"commit.*not found",
                    r"reference does not exist",
                    r"404.*not found.*ref"
                ],
                "severity": "critical",
                "diagnosis": "Pinned SHA does not exist in target repo → workflow broken permanently",
                "fix_template": "Replace with valid, existing commit SHA from official action repo"
            }
        ]

    def scan_workflow_content(self, content: str) -> List[Dict]:
        """Analyze workflow YAML content for issues"""
        findings = []
        
        for rule in self.failure_patterns:
            matched = False
            matched_line = ""
            
            for pattern in rule["patterns"]:
                if re.search(pattern, content, re.IGNORECASE | re.MULTILINE):
                    matched = True
                    matched_line = pattern
                    break
            
            if matched:
                findings.append({
                    "id": rule["id"],
                    "name": rule["name"],
                    "severity": rule["severity"],
                    "diagnosis": rule["diagnosis"],
                    "fix_template": rule["fix_template"],
                    "evidence": matched_line
                })
        
        return findings

    def generate_fix_yml(self, issue_id: str, original_content: str) -> Optional[str]:
        """Generate corrected workflow YAML"""
        
        if issue_id == "path-filter-exclusion":
            # Remove paths: block entirely or comment it out
            fixed = re.sub(
                r"(\s+)paths:.*(\n\s+-.+)+",
                r"\1# paths: removed — all changes trigger full CI",
                original_content,
                flags=re.MULTILINE
            )
            if fixed == original_content:
                # Add skip-if-docs condition instead
                fixed = original_content.replace(
                    "jobs:",
                    """
    if: |
      !startsWith(github.head_ref, 'docs/') ||
      contains(github.event.pull_request.labels.*.name, 'run-full-ci')
jobs:"""
                )
            return fixed

        elif issue_id == "missing-permissions":
            if "permissions:" not in original_content:
                return original_content.replace(
                    "on:",
                    """on:

permissions:
  contents: read
  checks: write
  pull-requests: write
"""
                )

        elif issue_id == "floating-action-ref":
            # Map known tags → verified SHAs
            sha_map = {
                "actions/checkout@v4": "actions/checkout@b4ffde65f46336ab88eb53be80843a393cfff0ec2",
                "actions/setup-python@v5": "actions/setup-python@0a5c61591373683505ea898e09a731b47b7dfca3",
                "actions/upload-artifact@v4": "actions/upload-artifact@5d5d22aed1cb2921de3f6166a28027556c436d6e"
            }
            fixed = original_content
            for tag, sha in sha_map.items():
                fixed = fixed.replace(f" {tag.split('@')[0]}@{tag.split('@')[1]}", f" {sha}")
            return fixed if fixed != original_content else None

        elif issue_id == "module-not-found":
            return original_content.replace(
                "pytest tests/",
                "cd backend && PYTHONPATH=. pytest tests/"
            )

        return None

    def execute(self, inputs: Dict) -> Dict:
        """Main entry point — called by agent runtime"""
        repo = inputs.get("repo")
        run_id = inputs.get("run_id")
        auto_apply = inputs.get("auto_apply_fix", False)
        
        # 1. Fetch workflow file & logs (integration with GitHub tool here)
        # Simulated — in production: call GitHub API
        workflow_content = inputs.get("_workflow_content", "")
        
        if not workflow_content:
            return {
                "status": "needs-review",
                "root_cause": "Insufficient data",
                "diagnosis": "Please provide workflow file content or grant GitHub API access",
                "next_steps": [
                    "Share the .github/workflows/*.yml file content",
                    "Or grant repo read permission to this agent"
                ]
            }

        # 2. Scan for issues
        findings = self.scan_workflow_content(workflow_content)
        
        if not findings:
            return {
                "status": "diagnosed",
                "root_cause": "No patterns detected — check raw logs manually",
                "severity": "low",
                "diagnosis": "Workflow structure appears valid. Review exact error in job step.",
                "next_steps": [
                    "Open failed run → expand 'Run Tests' step → copy full error",
                    "Re-run once to rule out transient issue"
                ]
            }

        # 3. Prioritize: most severe first
        primary = sorted(findings, key=lambda x: {
            "critical": 4, "high": 3, "medium": 2, "low": 1
        }[x["severity"]], reverse=True)[0]

        # 4. Generate fix
        fixed_content = self.generate_fix_yml(primary["id"], workflow_content)
        
        result = {
            "status": "fixed" if fixed_content and auto_apply else "diagnosed",
            "root_cause": primary["name"],
            "severity": primary["severity"],
            "diagnosis": primary["diagnosis"],
            "evidence": primary.get("evidence"),
            "next_steps": [
                f"Fix: {primary['fix_template']}"
            ]
        }

        if fixed_content:
            result["fix"] = {
                "file": ".github/workflows/ci.yml",
                "change_type": "edit",
                "diff": fixed_content,
                "commit_message": f"fix(ci): auto-resolve — {primary['name']}"
            }
            result["next_steps"].extend([
                "Review the generated fix above",
                "Commit and push → CI re-runs automatically"
            ])
        else:
            result["status"] = "needs-review"
            result["next_steps"].append("Manual review required — no auto-fix available")

        return result


# ===== Agent Skill Runtime Hook =====
def handle_skill_invocation(inputs: Dict) -> Dict:
    skill = CITroubleshooterSkill()
    return skill.execute(inputs)
