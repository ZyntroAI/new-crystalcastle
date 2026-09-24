# Repaired workflows — invalid YAML (v4)

The **6 workflow files in this repository that are not valid YAML**,
and therefore have never run. Each is a distinct paste-corruption pattern, not a
typo.

These are held here rather than applied in place because the automation that
produced them cannot write to `.github/workflows/` at all — that path requires
the `workflows` permission, and both the contents API and the git objects API
answer `403 Resource not accessible by integration` for it.

## The six files

| file | what was wrong |
|---|---|
| `CICD_Pipeline.yaml` | a step indented one space too far, and a `shell:` key left inside `run:`'s block body |
| `download-a-Build-Artifact.yml` | a bare step fragment — no `on:` and no `jobs:`; not a workflow at all |
| `errorlog-generator.yml` | a blank line inserted between every key, destroying the mapping nesting |
| `pages-ci.yml` | `uses: X; with: {...}` collapsed onto one line, throughout the file |
| `pytest-markers.yml` | a stray `4` glued onto the first line |
| `scorecsv.yml` | a duplicated step whose keys lost their indentation; also missing `name:` and `on:` |

## Install

```sh
sh ci/repaired-workflows-v4/install.sh
```

Then commit. Every file in this bundle has been verified to parse as YAML.

## Why this matters beyond tidiness

A workflow that does not parse is not a failing workflow — it is an **absent**
one. Nothing reports it: no job starts, so no check turns red for the right
reason, and the work it was meant to do silently never happens. Three of these
six are named for their purpose (`errorlog-generator`, `pytest-markers`,
`scorecsv`), so the repository has been accumulating the state they were
supposed to maintain.

## Not included

This bundle fixes **parseability only**. Separately, and still outstanding:

- `actions/checkout@b4ffde65...cfff0ec2` — 41 hex characters, not a possible
  git SHA. Referenced from `FastAPI_CI.yaml`.
- `actions/setup-node@0a44ba7841...b29bc` — 39 hex characters. Also
  `FastAPI_CI.yaml`.
- `actions/checkout@11bd7190...` and `github/codeql-action@c549b93d...` — both
  return `422 No commit found`. Because the CodeQL pins are fabricated, **CodeQL
  has never run from this repository.**
- 47 references still using moving tags (`@v4`, `@main`) rather than commits.

Those are action-reference defects in files that DO parse, so they are out of
scope here and carry their own fix.
