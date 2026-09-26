#!/usr/bin/env python3
"""Generate docs/INDEX.md from the actual contents of docs/.

Usage:
    python3 scripts/python/gen_docs_index.py [--star <filename>]

Run from anywhere in the repo; paths derive from this file's location.
Deterministic and idempotent — safe to re-run after adding or removing docs.
"""
import os
import sys
import datetime
from urllib.parse import quote

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = os.path.join(REPO, "docs")

# Optional: `--star <filename>` marks one entry as new in the table.
MARKER = None
if "--star" in sys.argv:
    idx = sys.argv.index("--star")
    if idx + 1 < len(sys.argv):
        MARKER = sys.argv[idx + 1]

files, dirs = [], []
for entry in sorted(os.listdir(DOCS)):
    (dirs if os.path.isdir(os.path.join(DOCS, entry)) else files).append(entry)


def cell(name):
    """Escape a name for a markdown table cell and build a URL-safe link."""
    return f"[`{name.replace('|', chr(92) + '|')}`]({quote(name, safe='')})"


def human(name):
    return name.replace("-", " ").replace("_", " ").strip()


def count_entries(directory):
    try:
        return len(
            [x for x in os.listdir(os.path.join(DOCS, directory))
             if not x.startswith(".")]
        )
    except OSError:
        return 0


L = []
A = L.append
A("---")
A("Title: Documentation Index")
A("Subtitle: Every document under docs/ — generated from the directory tree")
A("Kicker: Index")
A("Author: Nattapong Pornlumfah · v1.1")
A(f"Date: {datetime.date.today().isoformat()}")
A("Theme: professional")
A("Genre: reference")
A("Font: plex")
A("---")
A("")
A("# 📚 Documentation Index")
A("")
A("This is the canonical index for `docs/` — it replaced the former "
  "`docs/summary.md`.")
A("")
A(f"Generated from the live `docs/` tree — **{len(files)} files** and "
  f"**{len(dirs)} directories**.")
A("")
A("> Regenerate with `python3 scripts/python/gen_docs_index.py` after adding or "
  "removing docs.")
A("")
A("## 📄 Documents")
A("")
A("| Document | Description |")
A("|---|---|")
for f in files:
    if f.startswith("."):
        continue
    star = f" — ⭐ **new**" if f == MARKER else ""
    A(f"| {cell(f)} | {human(f)}{star} |")
A("")
A("## 📁 Directories")
A("")
A("| Directory | Entries |")
A("|---|---|")
for d in dirs:
    A(f"| {cell(d + '/')} | {count_entries(d)} |")
A("")
A("## 🔁 Replaced files")
A("")
A("| File | Replaced by | Reason |")
A("|---|---|---|")
A("| `docs/summary.md` | **this file** (`docs/INDEX.md`) | Listed 13 files, "
  "12 of which did not exist (`VERSIONS.md`, `RELEASE_NOTES.md`, `DOCS.md`, "
  "`CICDPIPELINE.md`, …). Removed in favour of a generated index. |")
A("| `docs/README.md` | Curated entry point — rewritten | Was a 155-line pasted "
  "AI chat transcript that opened *\"Here's a complete, bilingual README.md…\"*, "
  "closed by offering to commit itself, and described a repository structure "
  "this repo does not have. Content preserved in git history. |")
A("")
A("---")
A("")
A("*Auto-generated against the live `docs/` tree.*")
A("")

out = os.path.join(DOCS, "INDEX.md")
with open(out, "w", encoding="utf-8") as fh:
    fh.write("\n".join(L) + "\n")

visible = [f for f in files if not f.startswith(".")]
print(f"wrote docs/INDEX.md ({len(L) + 1} lines)")
print(f"files indexed:  {len(visible)}")
print(f"dirs indexed:   {len(dirs)}")
print(f"summary.md gone: {'summary.md' not in files}")
print(f"marker present: {MARKER in files if MARKER else 'n/a'}")
