# 📚 knowledge-base — settled reference material

Material that has **settled** and is meant to be looked things up in, rather than
edited in place. In-flight working documentation lives in [`docs/`](../docs/); this
folder holds what is done being figured out.

Last reviewed: **2026-09-16**

## Contents

| Folder | What it holds |
|---|---|
| [`mcp-tools/`](mcp-tools/README.md) | MCP & AI tools catalog — 39 tools across 5 categories, with AST security tiers (T1–T4) aligned to the OWASP LLM Top 10. Ships an HTML dashboard and an architecture diagram. |
| [`workflows/`](workflows/vite-vitest-pages.md) | Self-contained workflow bundles — Vite + Vitest Pages workflow (config, CI, package scripts). |

## `mcp-tools/` — MCP & AI tools catalog

The catalog is a table-based reference: one file per category, plus a registry and a
diagram. [Start at its index →](mcp-tools/README.md)

| File | Purpose |
|---|---|
| [`mcp-tools/README.md`](mcp-tools/README.md) | Catalog index — search-by-need, browse-by-category, and the security-tier standard |
| [`mcp-tools/registry.yaml`](mcp-tools/registry.yaml) | Source of truth for the catalog — tool entries plus the T1–T4 tier definitions |
| [`mcp-tools/category-marketing.md`](mcp-tools/category-marketing.md) | Marketing & content tools |
| [`mcp-tools/category-development.md`](mcp-tools/category-development.md) | Development & code tools |
| [`mcp-tools/category-data.md`](mcp-tools/category-data.md) | Data & analytics tools |
| [`mcp-tools/category-collaboration.md`](mcp-tools/category-collaboration.md) | Collaboration & productivity tools |
| [`mcp-tools/category-ai-core.md`](mcp-tools/category-ai-core.md) | AI-core & orchestration tools |
| [`mcp-tools/diagram-mcp-architecture.md`](mcp-tools/diagram-mcp-architecture.md) | MCP architecture diagram ([SVG](mcp-tools/diagram-mcp-architecture.svg)) |
| [`mcp-tools/dashboard.html`](mcp-tools/dashboard.html) | Browsable HTML dashboard over the catalog |

### Security tiers

Every tool carries a tier, and the tier — not the vendor — drives the review bar.

| Tier | Meaning | Risk |
|---|---|---|
| **T1** | Public read — reads public data only | low |
| **T2** | Internal read — reads internal/org data | medium |
| **T3** | Write / execute — writes data or runs commands | high |
| **T4** | Admin / security — manages credentials and permissions | critical |

## `workflows/` — workflow bundles

Complete, self-contained bundles that can be dropped into a project as-is.

- [**Vite + Vitest Pages workflow**](workflows/vite-vitest-pages.md) — test/build/deploy
  a multi-page site with a dedicated `pages/` folder. The folder also ships the real
  config files it documents: [`package.json`](package.json) and
  [`vite.pages.config.ts`](vite.pages.config.ts).

## Conventions

- **`knowledge-base/` vs `docs/`** — `knowledge-base/` is reference material that has
  settled; `docs/` is for work in progress. If something here starts changing again,
  it belongs back in `docs/` until it settles.
- **One topic per file**, named in lowercase kebab-case.
- **Verify against the source before trusting a copy** — catalog entries and workflow
  bundles describe external tools, which change. The registry's `updated` field dates
  the snapshot.
