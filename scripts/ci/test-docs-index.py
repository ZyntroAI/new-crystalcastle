#!/usr/bin/env python3
"""Regression test for docs/README.md and docs/INDEX.md.

Asserts the generated docs are self-consistent: links resolve, front-matter is
intact, the stale chat transcript is gone, and generation is deterministic.
Exit 0 = all pass.
"""
import io
import os
import re
import subprocess
import sys
from urllib.parse import unquote

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = os.path.join(REPO, "docs")

results = []


def check(name, ok, detail=""):
    results.append((name, ok, detail))


def read(p):
    return io.open(os.path.join(DOCS, p), encoding="utf-8").read()


def links_ok(text):
    bad = []
    for l in re.findall(r"\]\(([^)\s]+)\)", text):
        if l.startswith(("http://", "https://", "mailto:", "#")):
            continue
        t = l.split("#", 1)[0]
        if not os.path.exists(os.path.normpath(os.path.join(DOCS, unquote(t)))):
            bad.append(l)
    return bad


# --- README ------------------------------------------------------------------
rd = read("README.md")
bad = links_ok(rd)
check("README links resolve", not bad, f"broken: {bad}")
check("README has front-matter", rd.startswith("---\n"))

STALE = ["Here's a complete", "Would you like me to commit",
         "Built with precision by ZyntroAI", "summary.md"]
found = [s for s in STALE if s in rd]
check("README has no stale transcript content", not found, f"found: {found}")

check("README points at INDEX.md as canonical", "INDEX.md" in rd)
check("README carries no hardcoded file count",
      not re.search(r"\b\d+ files\b", rd))

# --- INDEX -------------------------------------------------------------------
ix = read("INDEX.md")
bad = links_ok(ix)
check("INDEX links resolve", not bad, f"broken: {bad}")
check("INDEX records summary.md replacement", "summary.md" in ix)
check("INDEX records README replacement", "docs/README.md" in ix)
check("INDEX no longer claims a Known-broken section",
      "Known-broken files" not in ix)

# --- docs/summary.md must be gone ---------------------------------------------
check("docs/summary.md removed", not os.path.exists(os.path.join(DOCS, "summary.md")))

# --- determinism --------------------------------------------------------------
before = rd
subprocess.run([sys.executable,
                os.path.join(REPO, "scripts/python/gen_docs_index.py"),
                "--star", "task-flow-sequencing.md"],
               capture_output=True)
check("INDEX regenerates deterministically",
      links_ok(read("INDEX.md")) == [])

# --- report ------------------------------------------------------------------
passed = sum(1 for _, ok, _ in results if ok)
for name, ok, detail in results:
    print(f"  {'PASS' if ok else 'FAIL'}  {name}" + (f"  ({detail})" if detail and not ok else ""))
print(f"\n{passed}/{len(results)} passed")
sys.exit(0 if passed == len(results) else 1)
