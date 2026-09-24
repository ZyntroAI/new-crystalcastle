# Documentation deploy workflow

`docs-deploy.yml` builds the MkDocs site and publishes it to GitHub Pages.

It lives here rather than in `.github/workflows/` because the Fig GitHub App
does not hold the `workflows` permission, so it cannot push to that directory.
A human with write access installs it.

## Install

```bash
./ci/docs-deploy/install.sh            # dry run — shows what it would do
./ci/docs-deploy/install.sh --apply    # writes .github/workflows/docs-deploy.yml
```

The installer refuses to overwrite an existing target file. If one is already
there, diff the two before deciding.

Then commit the installed file and enable Pages:

1. `git add .github/workflows/docs-deploy.yml`
2. `git commit -m 'ci(docs): add Pages deploy workflow'`
3. `git push`
4. Repository **Settings → Pages → Source: GitHub Actions**

## What it does

| Job | Purpose |
|---|---|
| `build` | Installs `requirements-docs.txt`, runs `mkdocs build --strict`, uploads the `site/` artifact |
| `deploy` | Publishes the artifact to Pages under the `github-pages` environment |

## Design notes

- **`--strict` in CI.** A Markdown warning that is harmless locally becomes a
  failed build here. That is deliberate: a broken link or a missing nav entry
  should stop the deploy, not ship.
- **Least privilege.** `contents: read`, `pages: write`, `id-token: write` —
  nothing else.
- **`concurrency: cancel-in-progress: false`.** Deploys queue instead of
  cancelling, so the newest commit always lands.
- **`paths:` filter.** Only docs-related changes trigger a deploy, so a backend
  commit does not rebuild the site.
- **Every action is SHA-pinned**, resolved from the GitHub API on 2026-09-24.
  This repo has a history of fabricated SHAs failing to resolve; these are the
  real commits.

## Verification before install

```bash
python3 -c "import yaml; yaml.safe_load(open('ci/docs-deploy/docs-deploy.yml'))"
```

Then confirm each pinned SHA resolves (they are all real `actions/*` commits).
