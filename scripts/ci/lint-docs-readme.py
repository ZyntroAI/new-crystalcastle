#!/usr/bin/env python3
"""Lint the generated docs/README.md draft: every link must resolve, and no
stale references may survive. Reads draft from stdin, exits non-zero on failure.
"""
import io
import os
import re
import sys
from urllib.parse import unquote

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = os.path.join(REPO, "docs")

draft = io.open(0, encoding="utf-8").read()

failures = []

# 1. Link resolution -----------------------------------------------------------
links = re.findall(r"\]\(([^)\s]+)\)", draft)
checked = 0
for l in links:
    if l.startswith(("http://", "https://", "mailto:", "#")):
        continue
    checked += 1
    target = l.split("#", 1)[0]
    path = os.path.normpath(os.path.join(DOCS, unquote(target)))
    if not os.path.exists(path):
        failures.append(f"broken link: {l} -> {path}")

# 2. Front-matter contract -----------------------------------------------------
if not draft.startswith("---\n"):
    failures.append("no front-matter block at top")
else:
    fm = draft.split("---", 2)[1]
    for field in ("Title:", "Subtitle:", "Kicker:", "Author:", "Date:",
                  "Theme:", "Genre:", "Font:"):
        if field not in fm:
            failures.append(f"front-matter missing {field}")

# 3. No stale content from the removed chat transcript --------------------------
STALE = [
    "Here's a complete",
    "Would you like me to commit",
    "Built with precision by ZyntroAI",
    "summary.md",       # summary.md was deleted — must not be advertised
    "docs/README.md",
]
for s in STALE:
    if s in draft:
        failures.append(f"stale reference present: {s!r}")

# 4. Must point at the canonical index ------------------------------------------
if "INDEX.md" not in draft:
    failures.append("does not reference INDEX.md as the canonical listing")

# 5. No hardcoded counts that can drift -----------------------------------------
for n in ("63 files", "65 files", "62 files"):
    if n in draft:
        failures.append(f"hardcoded file count present: {n!r}")

print(f"links checked: {checked}")
print(f"failures: {len(failures)}")
for f in failures:
    print("  FAIL:", f)
sys.exit(1 if failures else 0)
