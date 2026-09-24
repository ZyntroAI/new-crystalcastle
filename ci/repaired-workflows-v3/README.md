# CI repair bundle — v3

Corrected GitHub Actions workflows for this repository, plus the action-pin
checker. **29 workflow files.**

The corrected files are held here rather than applied in place because the
automation that produced them cannot write to `.github/workflows/` — that path
requires the `workflows` permission, which is not available to it.

Paths are preserved relative to `.github/workflows/`. That matters for
``.devcontainer/proof-html.yml``: a workflow is only active when it sits **directly** under
`.github/workflows/`, so a nested file must stay nested. Flattening it would
silently activate a workflow that has never run.

## What was wrong

- **8 action references were invalid.** Two malformed (41 and 39 hex characters,
  not a possible git SHA) and six nonexistent — the API answers `422 No commit
  found for SHA`. That group included all three `github/codeql-action` pins, so
  **CodeQL has never actually run** here: the workflow failed to start rather
  than failing at analysis.
- **Six workflows were invalid YAML** and never ran. Each break was a distinct
  paste-corruption pattern: a stray `4` glued to the first line; a blank line
  between every key; a step indented one space too far with `shell:` left inside
  `run:`'s body; `uses: X; with: {{...}}` collapsed onto one line throughout a
  file; a duplicated step whose keys lost their indentation; a bare step with no
  `on:`/`jobs:` at all.
- **One workflow called an action that does not exist.**
  `apply-branch-protection.yml` used `actions/github-ruleset-toolkit@v1` — that
  repository returns `404`, so the job could never have run. Reimplemented with
  `actions/github-script`, pinned.
- **47 references used moving tags** (`@v4`, `@main`) instead of commits. A tag
  is a pointer its owner can repoint at any code, which then runs with this
  repository's credentials.

## Install

```sh
sh ci/repaired-workflows-v3/install.sh
```

Copies the bundle into `.github/workflows/` and installs the checker at
`ci/check-action-pins.py`. Commit the result.

## The checker

`check-action-pins.py` reports references not pinned to a commit SHA. It
**warns by default** rather than failing: a check that is red on its first run
is a check people disable, and this repository starts with a backlog.

| exit | meaning |
|---|---|
| `0` | clean, **or** violations in the default warn mode — a pull request is never blocked by a backlog that predates it |
| `1` | violations found **and** `--strict` was passed — the only blocking condition |
| `2` | the check could not run: workflows directory missing, or a file unreadable. Never reported as a pass |

```sh
python3 ci/check-action-pins.py             # warn, exit 0
python3 ci/check-action-pins.py --strict    # gate, exit 1
```

The regex matches both `uses:` and `- uses:`. That detail matters: an earlier
sweep over this repository used `^\s*uses:`, which silently skipped 28
references written in list form — which is how 17 stayed on moving tags after a
repair that claimed to have pinned everything.

## Verified

- all 29 workflows parse as YAML (6 were broken before)
- 88 action references: 85 pinned, 3 local composite actions, **0 unpinned**
- the checker exits 0 on the repaired tree, and 1 on an unpinned fixture under
  `--strict`
