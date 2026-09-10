"""Loader for the Supabase Agent Skill Suite.

Validates manifest <-> registry consistency and exposes sub-skill bodies.
No third-party dependencies.
"""
from __future__ import annotations

import json
import os
from typing import Any

SUITE_DIR = os.path.dirname(os.path.abspath(__file__))

REQUIRED_MANIFEST_KEYS = ("id", "name", "version", "skill_count", "format")


class SuiteError(ValueError):
    """Raised when the suite on disk is inconsistent."""


def _read_json(path: str) -> dict:
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def _front_matter(text: str) -> dict:
    """Minimal YAML-ish front-matter reader (no dependency on PyYAML)."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    meta: dict[str, Any] = {}
    for line in text[3:end].splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        meta[k.strip()] = v.strip()
    return meta


def load_suite(suite_dir: str = SUITE_DIR) -> dict:
    """Load and validate the suite.

    Raises SuiteError if the manifest is incomplete or the registry declares a
    skill whose SKILL.md is missing (or vice versa).
    """
    manifest_path = os.path.join(suite_dir, "manifest.json")
    if not os.path.isfile(manifest_path):
        raise SuiteError(f"manifest.json not found in {suite_dir}")
    manifest = _read_json(manifest_path)

    missing = [k for k in REQUIRED_MANIFEST_KEYS if k not in manifest]
    if missing:
        raise SuiteError(f"manifest missing keys: {missing}")

    registry_path = os.path.join(suite_dir, "metadata", "index.json")
    if not os.path.isfile(registry_path):
        raise SuiteError("metadata/index.json not found")
    registry = _read_json(registry_path)

    declared = registry.get("skills", [])
    if not declared:
        raise SuiteError("registry declares no skills")

    skills: list[dict] = []
    for entry in declared:
        sid = entry.get("id")
        rel = entry.get("path")
        if not sid or not rel:
            raise SuiteError(f"registry entry incomplete: {entry!r}")
        skill_md = os.path.join(suite_dir, rel, "SKILL.md")
        if not os.path.isfile(skill_md):
            raise SuiteError(f"skill {sid!r} declared but {rel}/SKILL.md missing")
        with open(skill_md, encoding="utf-8") as fh:
            body = fh.read()
        skills.append({
            "id": sid,
            "path": rel,
            "meta": _front_matter(body),
            "body": body,
        })

    # every sub-skill directory on disk must be declared
    on_disk = set()
    skills_root = os.path.join(suite_dir, "skills")
    if os.path.isdir(skills_root):
        on_disk = {d for d in os.listdir(skills_root)
                   if os.path.isdir(os.path.join(skills_root, d))}
    undeclared = sorted(on_disk - {s["path"].split("/")[-1] for s in skills})
    if undeclared:
        raise SuiteError(f"directories present but not declared: {undeclared}")

    if manifest["skill_count"] != len(skills):
        raise SuiteError(
            f"manifest skill_count={manifest['skill_count']} but registry has {len(skills)}"
        )

    return {"manifest": manifest, "skills": skills}


def list_skill_ids(suite_dir: str = SUITE_DIR) -> list[str]:
    return [s["id"] for s in load_suite(suite_dir)["skills"]]


def load_skill(skill_id: str, suite_dir: str = SUITE_DIR) -> str:
    """Return the raw SKILL.md body for one sub-skill."""
    for s in load_suite(suite_dir)["skills"]:
        if s["id"] == skill_id:
            return s["body"]
    raise SuiteError(f"unknown skill id: {skill_id!r}")


if __name__ == "__main__":
    import sys
    suite = load_suite()
    print(f"{suite['manifest']['name']} v{suite['manifest']['version']}")
    for s in suite["skills"]:
        print(f"  - {s['id']}")
    sys.exit(0)
