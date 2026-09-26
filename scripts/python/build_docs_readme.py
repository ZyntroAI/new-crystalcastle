#!/usr/bin/env python3
"""Build a real docs/README.md — the curated entry point for docs/.

Deliberately does NOT re-list every file: INDEX.md is the single canonical,
generated listing, and a second hand-maintained list would drift from it (the
exact defect this change removes). Draft mode prints; --write replaces the file.
"""
import os
import io
import sys
import datetime
from urllib.parse import quote

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = os.path.join(REPO, "docs")
SKIP = {"README.md", "INDEX.md"}


def esc(s):
    return s.replace("|", "\\|").strip()


files, dirs = [], []
for entry in sorted(os.listdir(DOCS)):
    if entry in SKIP or entry.startswith("."):
        continue
    (dirs if os.path.isdir(os.path.join(DOCS, entry)) else files).append(entry)


def count(d):
    try:
        return len([x for x in os.listdir(os.path.join(DOCS, d))
                    if not x.startswith(".")])
    except OSError:
        return 0


# Group files by extension so the README can say what KINDS of material live
# here without enumerating them (INDEX.md enumerates).
by_ext = {}
for f in files:
    ext = os.path.splitext(f)[1].lower().lstrip(".") or "no extension"
    by_ext[ext] = by_ext.get(ext, 0) + 1

now = datetime.date.today().isoformat()
L = []
A = L.append
A("---")
A("Title: Documentation Directory")
A("Subtitle: Entry point for docs/ — what lives here and how to navigate it")
A("Kicker: Index")
A("Author: Nattapong Pornlumfah")
A(f"Date: {now}")
A("Theme: professional")
A("Genre: reference")
A("Font: plex")
A("---")
A("")
A("# 📚 docs/ — Documentation Directory")
A("")
A("This directory holds technical documentation, reference material, and tooling "
  "for this repository. **[INDEX.md](INDEX.md) carries the exact file count and "
  "the full listing** — no figure is repeated here, so the two cannot drift.")
A("")
A("## 🧭 Start here")
A("")
A("| If you want to… | Go to |")
A("|---|---|")
A("| See **every** file in `docs/` | **[INDEX.md](INDEX.md)** — the canonical, "
  "auto-generated listing |")
A("| Understand the repository as a whole | [`ARCHITECTURE.md`](../ARCHITECTURE.md) |")
A("| Contribute a change | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |")
A("| See what shipped, and when | [`CHANGELOG.md`](../CHANGELOG.md) |")
A("| Know which task flow is next | "
  "[`task-flow-sequencing.md`](task-flow-sequencing.md) |")
A("")
A("> **One canonical listing.** `INDEX.md` is the single source of truth for what "
  "is in this directory. This README intentionally does not repeat that list — "
  "two hand-maintained indexes drift apart, which is exactly the problem this "
  "directory had before.")
A("")
A("## 🗂 What kinds of material are here")
A("")
A("| Type | Files |")
A("|---|---|")
for ext, n in sorted(by_ext.items(), key=lambda kv: (-kv[1], kv[0])):
    label = f"`.{esc(ext)}`" if ext != "no extension" else "no extension"
    A(f"| {label} | {n} |")
A("")
A(f"## 📁 Subdirectories ({len(dirs)})")
A("")
A("| Directory | Entries |")
A("|---|---|")
for d in dirs:
    A(f"| [`{esc(d)}/`]({quote(d)}/) | {count(d)} |")
A("")
A("## 📋 Document conventions")
A("")
A("Markdown documents here open with a YAML front-matter block:")
A("")
A("```yaml")
A("---")
A("Title: <document title>")
A("Subtitle: <one-line description>")
A("Kicker: <category>")
A("Author: <name>")
A("Date: <YYYY-MM-DD>")
A("Theme: <theme>")
A("Genre: <genre>")
A("Font: <font>")
A("---")
A("```")
A("")
A("`INDEX.md` reads this block to describe each file. A document without it "
  "still appears in the index, but falls back to its filename as the "
  "description.")
A("")
A("Filenames are kebab-case with a `.md` extension.")
A("")
A("## 🛠 Adding or removing a document")
A("")
A("`INDEX.md` is generated — never edit it by hand. After changing anything in "
  "`docs/`, regenerate it:")
A("")
A("```bash")
A("python3 scripts/python/gen_docs_index.py")
A("```")
A("")
A("Optional: `--star <filename>` marks one entry as new in the table.")
A("")
A("---")
A("")
A("*This README replaced a 155-line pasted AI chat transcript that occupied this "
  "path; the original remains in git history. Its content described a repository "
  "structure that does not match this one.*")
A("")
A(f"*Last reviewed {now}.*")
A("")

text = "\n".join(L) + "\n"

if "--write" in sys.argv:
    with io.open(os.path.join(DOCS, "README.md"), "w", encoding="utf-8") as fh:
        fh.write(text)
    print("wrote docs/README.md")
    print("lines:", text.count("\n"))
    print(f"files: {len(files)}  dirs: {len(dirs)}  types: {len(by_ext)}")
else:
    print(text)
