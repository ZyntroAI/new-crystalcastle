Title: CI Error Log — new-crystalcastle
Kicker: What is broken on main right now, what is inherited, and what each fix requires
Theme: technical
Genre: project-status
tags: [ci, github-actions, incident-log, maintenance]

# CI Error Log

State of `.github/workflows/` on `main` for `ZyntroAI/new-crystalcastle`, as
measured on 2026-09-24. Everything here was established by querying the live
repository and running the files through a YAML parser — nothing is inferred
from workflow names or from earlier reports.

The distinction that matters throughout: **a workflow that fails to parse is not
a failing workflow, it is an absent one.** GitHub never starts it, so no check
turns red for the right reason and the work is silently never done. That is a
worse failure mode than a red check, and it is why this log separates the two.

## 1. Six workflows are not valid YAML

They have never run. Each is a distinct paste-corruption pattern.

| File | Parse error | What is actually wrong |
|---|---|---|
| `CICD_Pipeline.yaml` | while parsing a block mapping | A step indented one space too far, and a `shell:` key left inside `run:`'s block body |
| `download-a-Build-Artifact.yml` | not a mapping | A bare step fragment — no `on:` and no `jobs:`. Not a workflow at all |
| `errorlog-generator.yml` | while parsing a block mapping | A blank line inserted between every key, destroying the mapping nesting |
| `pages-ci.yml` | mapping values are not allowed here | `uses: X; with: {...}` collapsed onto one line, throughout the file |
| `pytest-markers.yml` | mapping values are not allowed here | A stray `4` glued onto the first line |
| `scorecsv.yml` | while scanning a simple key | A duplicated step whose keys lost their indentation; also missing `name:` and `on:` |

Three of the six are named for their purpose — `errorlog-generator`,
`pytest-markers`, `scorecsv` — so the repository has been accumulating the state
they were meant to maintain.

**Fix:** corrected versions are in `ci/repaired-workflows-v4/`, with an
installer. All six parse. See that directory's README.

## 2. Two action references cannot be a git SHA at all

| Ref | Length | Where |
|---|---|---|
| `actions/checkout@b4ffde65…cfff0ec2` | 41 hex chars | `FastAPI_CI.yaml:38` |
| `actions/setup-node@0a44ba7841…b29bc` | 39 hex chars | `FastAPI_CI.yaml:97` |

A commit SHA is exactly 40 hex characters. These are 41 and 39, so they can
never resolve — the runner reports *"unable to find version"* before any job
step executes.

**Fix:** repin to a real commit, resolved from GitHub's tag data.

## 3. Two action references point at commits that do not exist

| Ref | API response | Where |
|---|---|---|
| `actions/checkout@11bd7190…` | `422 No commit found for SHA` | `codeql.yml` |
| `github/codeql-action@c549b93d…` | `422 No commit found for SHA` | `codeql.yml` (init, autobuild, analyze) |

Both were confirmed non-existent by asking the API about the commit directly.

**Consequence:** because all three CodeQL sub-action pins are fabricated,
**CodeQL has never run from this repository.** The `analyze (python)` and
`analyze (javascript-typescript)` checks that report failure are failing to
*resolve their actions*, not failing to analyse code.

**Fix:** repin to real commits (`checkout` → `v4`, `codeql-action` → `v3`).

## 4. Forty-seven references use moving tags

`@v4`, `@main` and similar are pointers their owner can repoint at any code,
which then runs with this repository's credentials. Not an outage, and included
because it is the same defect class as 2 and 3 and shares one fix.

## Failures CI reports that are NOT in this scope

A red check is not automatically a defect in the workflow files. Of the failing
checks on the current branch, several are inherited from `main` and are
genuinely about the repository's code or environment:

- **`ci`** — fails at the **Lint** step. Lint findings in the source tree.
- **`rubric-scoring`** — fails at **Run Parser Agent**. A step's own logic.
- **`test`**, **`test (3.10)`**, **`Unit Tests (Python 3.9/3.11/3.12)`** —
  test-run failures. Some are inherited from `main` (where `test` and
  `test (3.10)` also fail); the `Unit Tests` trio appears only on the branch and
  needs separate triage.
- **`Markdown & Docs Check`** — **fails on `main`** but is *skipped* on the
  branch. It skips silently because its trigger condition never evaluates true
  (it tests a field that is absent from the event payload, then falls through to
  a push-only branch). A check that always skips is not a passing check.

None of these are fixed by repinning actions or repairing YAML, and none should
be reported as fixed once those land.

## What would make this permanently visible

The repository's existing `ci/check-action-pins.py` (added separately) reports
unpinned references. Extending the same pattern to a YAML-parse check would turn
class 1 from *silently absent* into *visibly reported* — the one change that
would have caught all six of these on the day they were committed.

## How each finding was established

- YAML validity: every file parsed with a YAML parser; failures recorded with
  their parser message and line.
- Reference lengths: read directly from the files and measured, not eyeballed.
- Non-existent commits: `GET /repos/{owner}/{repo}/commits/{sha}` per reference,
  recording the HTTP status.
- Inherited vs. new failures: the same check-runs query against `main` and
  against the branch, compared by check name.
