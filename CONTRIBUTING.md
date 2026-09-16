# Contributing to new-crystalcastle

Thanks for contributing to **new-crystalcastle** (`ZyntroAI/new-crystalcastle`).
This guide covers the local setup, the commit and branch conventions, and the
pull-request process this repository actually uses.

## Repository layout

This is a monorepo. The root holds the frontend toolchain; the backend and the
supporting tooling live in subdirectories.

| Path | What it is |
| --- | --- |
| `frontend/` | React/TSX source (migrating in; not yet independently runnable) |
| `backend/` | Express + Supabase + Groq API server (`backend/server.js`) |
| `docs/` | Project documentation |
| `skills/` | Skill definitions and suites |
| `security/` | Security rules, tests, and tooling |
| `knowledge-base/` | Curated reference material |

Anything loose at the repository root (screenshots, `.docx` notes, stray
workflow YAML) is **scratch/archival**, not part of the running platform.
See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full picture.

## Prerequisites

- **Node.js** `>=22 <27`
- **npm** `>=10`

## Local setup

```bash
git clone https://github.com/ZyntroAI/new-crystalcastle.git
cd new-crystalcastle
npm ci
```

### Frontend (repository root)

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint (use `npm run lint:fix` to autofix) |
| `npm run typecheck` | TypeScript type check |
| `npm run test` | Run the test suite |

### Backend (`backend/`)

| Command | Purpose |
| --- | --- |
| `npm start` | Run the API server (`node server.js`) |
| `npm run dev` | Run with nodemon |
| `npm run lint` | Lint |
| `npm run format` | Format |
| `npm run check` | Lint + `npm audit` |

## Branch naming

The repository already has bare branches named `docs`, `feat`, `fix`, and
`refactor`. Git cannot hold both a branch `docs` and a branch
`docs/something`, so **pushing a branch whose name starts with one of those
exact prefixes is rejected** with a directory/file conflict.

Use a distinct prefix instead:

```
<type>-<short-description>     # e.g. docs-markdown-refresh
fig/<short-description>        # e.g. fig/markdown-refresh
```

## Commit messages

This project follows [Conventional Commits](.Conventional_Commits.md):

```
<type>(<optional scope>): <description>
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`,
`build`, `perf`, `style`.

Examples:

```
docs: refresh markdown links and table of contents
fix(backend): guard against an empty filter payload
feat(skills): add the notebooklm access suite
```

Do not commit secrets, tokens, or private keys. See
[`SECURITY.md`](SECURITY.md) for how to report a vulnerability privately.

## Pull requests

1. Create your branch using a prefix from the section above.
2. Make your changes and confirm the relevant checks pass locally
   (`npm run lint`, `npm run typecheck`, `npm run test`).
3. Push and open a pull request against `main`.
4. Complete the pull-request template — summary, related issue, change type,
   testing evidence, and the CI-gate checklist.
5. Address review comments and keep the branch up to date with `main`.

Work directly on `main` is not accepted; every change arrives through a pull
request so the CI gates can run.

## Documentation changes

- Keep relative links working. When you move or rename a file, update the
  links that point at it.
- Keep in-page anchors accurate — the anchor is derived from the heading text.
- Record merged work in [`CHANGELOG.md`](CHANGELOG.md).

## Code of conduct

Participation in this project is covered by our
[Code of Conduct](CODE_OF_CONDUCT.md).
