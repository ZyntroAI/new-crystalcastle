---
Title: Documentation Directory
Subtitle: Entry point for docs/ — what lives here and how to navigate it
Kicker: Index
Author: Nattapong Pornlumfah
Date: 2026-09-26
Theme: professional
Genre: reference
Font: plex
---

# 📚 docs/ — Documentation Directory

This directory holds technical documentation, reference material, and tooling for this repository. **[INDEX.md](INDEX.md) carries the exact file count and the full listing** — no figure is repeated here, so the two cannot drift.

## 🧭 Start here

| If you want to… | Go to |
|---|---|
| See **every** file in `docs/` | **[INDEX.md](INDEX.md)** — the canonical, auto-generated listing |
| Understand the repository as a whole | [`ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Contribute a change | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |
| See what shipped, and when | [`CHANGELOG.md`](../CHANGELOG.md) |
| Know which task flow is next | [`task-flow-sequencing.md`](task-flow-sequencing.md) |

> **One canonical listing.** `INDEX.md` is the single source of truth for what is in this directory. This README intentionally does not repeat that list — two hand-maintained indexes drift apart, which is exactly the problem this directory had before.

## 🗂 What kinds of material are here

| Type | Files |
|---|---|
| no extension | 24 |
| `.md` | 21 |
| `.txt` | 13 |
| `.html` | 1 |
| `.js` | 1 |
| `.py` | 1 |
| `.skills` | 1 |
| `.webp` | 1 |

## 📁 Subdirectories (7)

| Directory | Entries |
|---|---|
| [`agreement/`](agreement/) | 1 |
| [`ci-repair-bundle/`](ci-repair-bundle/) | 5 |
| [`github-enterprise/`](github-enterprise/) | 2 |
| [`knowledge/`](knowledge/) | 1 |
| [`smart-slack-api/`](smart-slack-api/) | 1 |
| [`src/`](src/) | 1 |
| [`คู่มือการใช้งาน-actions/`](%E0%B8%84%E0%B8%B9%E0%B9%88%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%83%E0%B8%8A%E0%B9%89%E0%B8%87%E0%B8%B2%E0%B8%99-actions/) | 1 |

## 📋 Document conventions

Markdown documents here open with a YAML front-matter block:

```yaml
---
Title: <document title>
Subtitle: <one-line description>
Kicker: <category>
Author: <name>
Date: <YYYY-MM-DD>
Theme: <theme>
Genre: <genre>
Font: <font>
---
```

`INDEX.md` reads this block to describe each file. A document without it still appears in the index, but falls back to its filename as the description.

Filenames are kebab-case with a `.md` extension.

## 🛠 Adding or removing a document

`INDEX.md` is generated — never edit it by hand. After changing anything in `docs/`, regenerate it:

```bash
python3 scripts/python/gen_docs_index.py
```

Optional: `--star <filename>` marks one entry as new in the table.

---

*This README replaced a 155-line pasted AI chat transcript that occupied this path; the original remains in git history. Its content described a repository structure that does not match this one.*

*Last reviewed 2026-09-26.*

