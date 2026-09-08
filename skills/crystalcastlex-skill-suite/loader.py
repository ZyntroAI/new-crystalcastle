"""CrystalCastleX skill-suite loader.

Reads the suite manifest + per-skill SKILL.md front-matter and lets callers
look up a sub-skill by id. Pure stdlib.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

HERE = Path(__file__).resolve().parent
FM_RE = re.compile(r"^---\s*\n(.*?)\n---", re.S)


def _parse_frontmatter(text: str) -> Dict[str, Any]:
    m = FM_RE.match(text)
    if not m:
        return {}
    out: Dict[str, Any] = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            out[k.strip()] = v.strip()
    return out


class CrystalCastleXSuite:
    def __init__(self, root: Path = HERE) -> None:
        self.root = root
        self._skills_dir = root / "skills"
        self.manifest = json.loads((root / "manifest.json").read_text())

    def list_skills(self) -> List[Dict[str, Any]]:
        out = []
        for d in sorted(self._skills_dir.iterdir()):
            if d.is_dir():
                sk = d / "SKILL.md"
                if sk.exists():
                    fm = _parse_frontmatter(sk.read_text())
                    out.append({"id": fm.get("id", d.name), "name": d.name,
                                "description": fm.get("description", ""), "path": str(sk)})
        return out

    def get_skill(self, skill_id: str) -> Optional[Dict[str, Any]]:
        for s in self.list_skills():
            if s["id"] == skill_id or s["name"] == skill_id:
                return s
        return None

    def ids(self) -> List[str]:
        return [s["name"] for s in self.list_skills()]


suite = CrystalCastleXSuite()
