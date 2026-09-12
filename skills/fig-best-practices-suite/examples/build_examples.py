#!/usr/bin/env python3
"""Build a clean reference project and a deliberately broken one.

The clean project must pass all 11 criteria; the broken one must fail the
seven a reviewer would care about most. Run from anywhere:

    python examples/build_examples.py
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent

TOKENS = {
    "color": {
        "primary": "#2563eb",
        "secondary": "#64748b",
        "background": "#ffffff",
        "surface": "#f8fafc",
        "text": "#0f172a",
        "muted": "#64748b",
    },
    "spacing": {"sm": "8px", "md": "16px", "lg": "24px"},
    "radius": {"sm": "6px", "md": "10px"},
    "typography": {"scale": {"base": "16px", "lg": "20px"}},
    "accessibility": {"minContrastRatio": 4.5, "minTouchTargetPx": 44},
}

PERMISSIONS = """\
roles:
  admin: zyntro
  developer: zyntro
  reviewer: fig-ai-agent
  viewer: public
agents:
  developer:
    scope: "01-structure"
  security:
    scope: "03-security"
"""

DEPLOYMENT = """\
stage: production
approval: zyntro
production:
  - https
  - backup
  - health_check
  - monitoring
  - alerting
  - rollback_strategy
"""

CI = """\
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8
      - uses: actions/setup-python@a26af69be951a213d495a4c3e4e4022e16d87065
"""

CARD = """\
import { tokens } from "../design/tokens";

export function Card({ title }: { title: string }) {
  return <div style={{ color: tokens.color.text }}>{title}</div>;
}
"""

README = """\
# Reference project

A minimal project that satisfies every FIG-BEST-PRACTICES criterion.

```bash
python loader.py --gate examples/clean-project
# RESULT: PASS — ready to deploy
```
"""

STANDARD = "# Standard\n\nSee the suite `SKILL.md` for the full criterion table.\n"


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def build_clean(root: Path) -> None:
    if root.exists():
        shutil.rmtree(root)

    write(root / "README.md", README)
    write(root / "BEST-PRACTICES.md", STANDARD)
    write(root / "design" / "design-tokens.json", json.dumps(TOKENS, indent=2) + "\n")
    write(root / "tests" / "test_smoke.py", "def test_smoke():\n    assert True\n")
    write(root / ".fig" / "permissions.yaml", PERMISSIONS)
    write(
        root / ".fig" / "backup.json",
        json.dumps({"last_backup": "2026-09-12T00:00:00Z", "rollback_available": True}, indent=2) + "\n",
    )
    write(root / ".fig" / "deployment.yaml", DEPLOYMENT)
    write(root / ".github" / "workflows" / "ci.yml", CI)
    write(root / "requirements.txt", "pyyaml>=6.0\n")
    write(root / "uv.lock", "version = 1\n")
    write(root / "src" / "Card.tsx", CARD)


def build_broken(root: Path) -> None:
    """Start from the clean project, then break seven things on purpose."""
    build_clean(root)

    # 1. DESIGN — a hard-coded colour outside the token set.
    write(root / "src" / "Widget.tsx", 'export const ACCENT = "#ff00aa";\n')

    # 2. SECURITY — a credential committed to source.
    write(root / "config.py", 'API_KEY = "sk-' + "a" * 32 + '"\n')

    # 3. SQL_INJECTION — a query built by interpolation.
    write(root / "db.py", "cursor.execute(" + 'f"SELECT * FROM users WHERE id = {user_id}"' + ")\n")

    # 4. SHA_PINNING — an action pinned to a movable tag.
    write(
        root / ".github" / "workflows" / "ci.yml",
        "name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n"
        "    steps:\n      - uses: actions/checkout@v4\n",
    )

    # 5. DEPENDENCY_AUDIT — no lockfile.
    (root / "uv.lock").unlink(missing_ok=True)

    # 6. TESTING — no tests.
    (root / "tests" / "test_smoke.py").unlink(missing_ok=True)

    # 7. BACKUP — no rollback recorded.
    (root / ".fig" / "backup.json").unlink(missing_ok=True)

    write(
        root / "README.md",
        "# Broken project\n\nDeliberately violates seven criteria. The gate must catch each one.\n",
    )


if __name__ == "__main__":
    build_clean(HERE / "clean-project")
    build_broken(HERE / "broken-project")
    print("built examples/clean-project and examples/broken-project")
