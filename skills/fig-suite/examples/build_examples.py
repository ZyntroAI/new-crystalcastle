#!/usr/bin/env python3
"""Regenerate the two example projects the suite gates against.

clean-project passes all nine criteria; broken-project fails seven on purpose.
Run from anywhere:

    python examples/build_examples.py
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
CLEAN = HERE / "clean-project"
BROKEN = HERE / "broken-project"


def _write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def build_clean() -> None:
    if CLEAN.exists():
        shutil.rmtree(CLEAN)

    _write(CLEAN / ".fig" / "context.yaml", """\
mission: >-
  Ship a documentation site for the Acme design system, authored in the
  workspace and published from this project.
owner: acme-docs
""")

    _write(CLEAN / ".fig" / "routing.yaml", """\
mode: build
type: website
notes: Landing page, not a question — an artifact was requested.
""")

    _write(CLEAN / ".fig" / "evidence.json", json.dumps({
        "claims": [
            {"claim": "The design system ships 42 components.",
             "source": "design-tokens.json", "kind": "file"},
            {"claim": "The site must pass WCAG 2.1 AA.",
             "source": "internal standard", "kind": "file"},
        ]
    }, indent=2) + "\n")

    _write(CLEAN / ".fig" / "external-writes.yaml", """\
writes:
  - target: gmail
    action: send draft to the docs reviewer
    approved: true
""")

    _write(CLEAN / ".fig" / "verify.json", json.dumps({
        "verified": True,
        "checks": ["typecheck", "unit-tests", "render-smoke"],
    }, indent=2) + "\n")

    _write(CLEAN / ".fig" / "handoff.yaml", """\
card: true
follow_ups:
  - Add a changelog page
  - Wire the publish workflow
notify: true
""")

    _write(CLEAN / "README.md", """\
# Acme Design System Docs

Documentation site for the Acme design system. Publication target is the
project's own site; content is authored here and reviewed before release.
""")

    _write(CLEAN / "requirements.txt", "mkdocs>=1.6\n")

    _write(CLEAN / "src" / "site_config.py", '''\
"""Site configuration for the Acme design system docs."""

SITE_TITLE = "Acme Design System"
COMPONENT_COUNT = 42
BASE_PATH = "/docs"
''')

    _write(CLEAN / "tests" / "test_site_config.py", '''\
from site_config import COMPONENT_COUNT, SITE_TITLE


def test_title_present():
    assert SITE_TITLE


def test_component_count_is_positive():
    assert COMPONENT_COUNT > 0
''')


def build_broken() -> None:
    if BROKEN.exists():
        shutil.rmtree(BROKEN)

    # CONTEXT — mission is empty.
    _write(BROKEN / ".fig" / "context.yaml", "mission: \"\"\nowner: \"\"\n")

    # ROUTING — a build with no type.
    _write(BROKEN / ".fig" / "routing.yaml", "mode: build\n")

    # EVIDENCE — one claim has no source. No web claims, so SOURCES still passes.
    _write(BROKEN / ".fig" / "evidence.json", json.dumps({
        "claims": [
            {"claim": "Users want a dark theme.", "source": "", "kind": "file"},
        ]
    }, indent=2) + "\n")

    # APPROVAL — an unapproved external write.
    _write(BROKEN / ".fig" / "external-writes.yaml", """\
writes:
  - target: gmail
    action: send the launch announcement
    approved: false
""")

    # VERIFY — marked verified, but no check actually ran.
    _write(BROKEN / ".fig" / "verify.json", json.dumps({
        "verified": True,
        "checks": [],
    }, indent=2) + "\n")

    # HANDOFF — a clean handoff; this one passes.
    _write(BROKEN / ".fig" / "handoff.yaml", """\
card: true
follow_ups:
  - Review the copy
notify: true
""")

    # NAMING — a generic filename.
    _write(BROKEN / "output.txt", "scratch output, superseded\n")

    # SECRETS — a credential committed to the workspace.
    _write(BROKEN / "config.py", '''\
"""Project configuration."""

API_KEY = "sk-abcdefghijklmnopqrstuvwxyz0123456789"
DEBUG = True
''')


def main() -> None:
    build_clean()
    build_broken()
    print(f"wrote {CLEAN}")
    print(f"wrote {BROKEN}")


if __name__ == "__main__":
    main()
