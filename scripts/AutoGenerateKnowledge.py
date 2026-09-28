#!/usr/bin/env python3
"""
AutoGenerateKnowledge.py — ZyntroAI Knowledge Base Generator
Version: 1.0 | Updated: 28SEPTEMBER2026
Purpose: Scan sources → Extract/Generate → Validate → Export → Archive
"""

import os
import re
import json
import yaml
import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

# ──────────────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
WORKSPACE = ROOT / "02-WORKSPACE"
IMMUTABLE = ROOT / "00-IMMUTABLE"
ARCHIVE = ROOT / "03-ARCHIVE"
SKILLS_DIR = WORKSPACE / "skills-edits"
KNOWLEDGE_OUT = IMMUTABLE / "KNOWLEDGE"

TIMESTAMP = datetime.datetime.now().strftime("%d%B%Y_%H%M")
RUN_NUM = 1  # Auto-incremented below

# Auto-increment run number
changelog_dir = ARCHIVE / "changelogs"
if changelog_dir.exists():
    existing = list(changelog_dir.glob("knowledge_*.json"))
    RUN_NUM = len(existing) + 1 if existing else 1

OUT_FILE = f"knowledge_{TIMESTAMP}_{RUN_NUM}.json"

# ──────────────────────────────────────────────────────
# SOURCE PARSERS
# ──────────────────────────────────────────────────────
def parse_skill_md(path: Path) -> Dict[str, Any]:
    """Extract frontmatter + body from SKILL.md"""
    text = path.read_text(encoding="utf-8")
    frontmatter = {}
    body = text

    fm_match = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.DOTALL)
    if fm_match:
        try:
            frontmatter = yaml.safe_load(fm_match.group(1)) or {}
            body = fm_match.group(2).strip()
        except yaml.YAMLError:
            body = text

    return {
        "id": path.stem,
        "name": frontmatter.get("name", path.stem.replace("-", " ").title()),
        "category": frontmatter.get("category", "general"),
        "language": frontmatter.get("language", "en"),
        "tags": frontmatter.get("tags", []),
        "description": frontmatter.get("description", "") or body[:200] + "…",
        "body": body,
        "source": str(path.relative_to(ROOT)),
        "updated": datetime.datetime.fromtimestamp(path.stat().st_mtime).isoformat(),
    }


def scan_agents_yaml() -> List[Dict[str, Any]]:
    """Extract knowledge from AGENTS.yaml definitions"""
    agents_yaml = WORKSPACE / "agents-source" / "AGENTS.yaml"
    if not agents_yaml.exists():
        return []

    try:
        data = yaml.safe_load(agents_yaml.read_text(encoding="utf-8")) or {}
    except Exception as e:
        print(f"⚠️ Failed to parse AGENTS.yaml: {e}")
        return []

    entries = []
    for agent in data.get("agents", []):
        desc = agent.get("description", "")
        if not desc:
            desc = f"{agent.get('name', 'Agent')} — {agent.get('type', '')} integration"
        entries.append({
            "id": f"agent-{agent.get('id')}",
            "name": agent.get("name", agent.get("id", "")),
            "category": "agent",
            "language": "bilingual",
            "tags": ["agent", agent.get("type", "unknown")],
            "description": desc,
            "body": json.dumps(agent, ensure_ascii=False, indent=2),
            "source": "agents-source/AGENTS.yaml",
            "updated": datetime.datetime.now().isoformat(),
        })
    return entries


def scan_docs() -> List[Dict[str, Any]]:
    """Scan docs/ folder for markdown knowledge"""
    docs_dir = WORKSPACE / "docs"
    if not docs_dir.exists():
        return []

    entries = []
    for md in docs_dir.rglob("*.md"):
        entries.append(parse_skill_md(md))
    return entries

# ──────────────────────────────────────────────────────
# VALIDATION
# ──────────────────────────────────────────────────────
def validate_entry(entry: Dict) -> List[str]:
    """Return list of issues; empty = valid"""
    issues = []
    required = ["id", "name", "category", "description", "source"]
    for key in required:
        if not entry.get(key):
            issues.append(f"Missing field: {key}")
    if len(entry.get("description", "")) < 10:
        issues.append("Description too short")
    return issues


def validate_all(entries: List[Dict]) -> Dict:
    """Full validation report"""
    report = {
        "total": len(entries),
        "valid": 0,
        "warnings": 0,
        "errors": 0,
        "details": [],
    }
    for e in entries:
        issues = validate_entry(e)
        status = "✅ valid" if not issues else "⚠️ warning" if len(issues) <= 1 else "❌ error"
        if "✅" in status:
            report["valid"] += 1
        elif "⚠️" in status:
            report["warnings"] += 1
        else:
            report["errors"] += 1
        report["details"].append({
            "id": e.get("id"),
            "status": status,
            "issues": issues,
        })
    return report

# ──────────────────────────────────────────────────────
# EXPORT
# ──────────────────────────────────────────────────────
def export_json(entries: List[Dict], report: Dict):
    """Save to IMMUTABLE + copy to ARCHIVE"""
    KNOWLEDGE_OUT.mkdir(parents=True, exist_ok=True)
    changelog_dir.mkdir(parents=True, exist_ok=True)

    output = {
        "schema_version": "1.0",
        "generated_at": datetime.datetime.now().isoformat(),
        "run_number": RUN_NUM,
        "source_root": str(WORKSPACE),
        "count": len(entries),
        "validation": report,
        "entries": entries,
    }

    out_path = KNOWLEDGE_OUT / OUT_FILE
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")

    # Archive copy
    arch_path = ARCHIVE / "changelogs" / OUT_FILE
    arch_path.write_text(out_path.read_text(encoding="utf-8"), encoding="utf-8")

    # Also write latest.json
    latest = KNOWLEDGE_OUT / "latest.json"
    latest.write_text(out_path.read_text(encoding="utf-8"), encoding="utf-8")

    print(f"✅ Generated → {out_path}")
    print(f"📦 Archived → {arch_path}")
    print(f"🔗 Updated  → {latest}")
    return out_path

# ──────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────
def main():
    print("🧠 AutoGenerateKnowledge — Scanning sources…")

    entries = []

    # 1. Skills
    if SKILLS_DIR.exists():
        for md in SKILLS_DIR.rglob("SKILL.md"):
            entries.append(parse_skill_md(md))
        print(f"   ✔ Skills: {len(entries)} found")
    else:
        print("   ⚠ No skills-edits folder found")

    # 2. Agents
    agent_entries = scan_agents_yaml()
    entries.extend(agent_entries)
    print(f"   ✔ Agents: {len(agent_entries)} found")

    # 3. Docs
    doc_entries = scan_docs()
    entries.extend(doc_entries)
    print(f"   ✔ Docs: {len(doc_entries)} found")

    # 4. Validate
    report = validate_all(entries)
    print(f"\n📊 Validation: {report['valid']} valid | {report['warnings']} warnings | {report['errors']} errors")

    # 5. Export
    export_json(entries, report)

    # 6. Summary
    print(f"\n🎉 Done! Total knowledge items: {len(entries)}")
    if report["errors"] > 0:
        print("⚠ Some items have errors — check output above")
        return 1
    return 0


if __name__ == "__main__":
    exit(main())
