#!/usr/bin/env python3
"""Generate docs/INDEX.md from the actual contents of docs/."""
import os, datetime
from urllib.parse import quote

REPO = "/workspace/H7tGkmt5NUfW1dxEb7zSB64VDoY2/7e9e5359-2706-4c6f-ae24-41ea764f1458/new-crystalcastle"
DOCS = os.path.join(REPO, "docs")
NEW_DOC = "task-flow-sequencing.md"

files, dirs = [], []
for e in sorted(os.listdir(DOCS)):
    (dirs if os.path.isdir(os.path.join(DOCS, e)) else files).append(e)

def cell(name):
    """Escape for a markdown table cell + link target."""
    target = quote(name, safe="")
    label = name.replace("|", "\\|")
    return f"[`{label}`]({target})"

def human(name):
    return name.replace("-", " ").replace("_", " ").strip()

def count_entries(d):
    try:
        return len([x for x in os.listdir(os.path.join(DOCS, d)) if not x.startswith(".")])
    except OSError:
        return 0

L = []
A = L.append
A("---")
A("Title: Documentation Index")
A("Subtitle: Every document under docs/ — generated from the directory tree")
A("Kicker: Index")
A("Author: Nattapong Pornlumfah · v1.0")
A(f"Date: {datetime.date.today().isoformat()}")
A("Theme: professional")
A("Genre: reference")
A("Font: plex")
A("---")
A("")
A("# 📚 Documentation Index")
A("")
A(f"Generated from the live `docs/` tree — **{len(files)} files** and **{len(dirs)} directories**.")
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
    star = " — ⭐ **new**" if f == NEW_DOC else ""
    A(f"| {cell(f)} | {human(f)}{star} |")
A("")
A("## 📁 Directories")
A("")
A("| Directory | Entries |")
A("|---|---|")
for d in dirs:
    A(f"| {cell(d + '/')} | {count_entries(d)} |")
A("")
A("## ⚠️ Known-broken index files")
A("")
A("These files are *named* like an index but do not function as one. Left")
A("untouched pending a decision — noted here so the gap is visible.")
A("")
A("| File | Problem |")
A("|---|---|")
A("| `docs/README.md` | Pasted AI chat reply, not an index — opens *\"Here's a complete, bilingual README.md…\"* and closes by offering to commit itself |")
A("| `docs/summary.md` | Lists 13 files; 12 do not exist (`VERSIONS.md`, `RELEASE_NOTES.md`, `DOCS.md`, `CICDPIPELINE.md`, …) |")
A("")
A("---")
A("")
A("*Auto-generated against the live `docs/` tree.*")
A("")

out = os.path.join(DOCS, "INDEX.md")
with open(out, "w", encoding="utf-8") as fh:
    fh.write("\n".join(L) + "\n")

print(f"wrote {out} ({len(L)+1} lines)")
print(f"files indexed: {len([f for f in files if not f.startswith('.')])}")
print(f"dirs indexed:  {len(dirs)}")
print(f"new doc present: {NEW_DOC in files}")
