Title: CI Error Log — new-crystalcastle
Kicker: What is broken on main, what is inherited, and what each fix requires
Theme: technical
Genre: project-status
tags: [ci, github-actions, incident-log, maintenance]

# CI Error Log

State of `.github/workflows/` on `main` for `ZyntroAI/new-crystalcastle`, measured 2026-09-24. Every figure below was established by querying the live repository and parsing the files — none is inferred from a workflow's name or from an earlier report.

The distinction that governs this document: **a workflow that fails to parse is not a failing workflow, it is an absent one.** GitHub never starts it, so no check turns red for the right reason and the work is silently never done.

```figexec
10 workflows on main are unrunnable or silently absent — six never parse, four action pins cannot resolve — so CodeQL and the errorlog, pytest-markers and scorecsv jobs have never executed once.
```

```figkpi
[{"value": "6", "unit": "workflows", "label": "Not valid YAML", "delta": "never run", "dir": "down"}, {"value": "4", "unit": "refs", "label": "Unresolvable action pins", "delta": "2 malformed, 2 absent", "dir": "down"}, {"value": "47", "unit": "refs", "label": "On moving tags", "delta": "repointable", "dir": "down"}, {"value": "9", "unit": "checks", "label": "Failing on main", "delta": "of 13 reported", "dir": "down"}, {"value": "0", "unit": "checks", "label": "Detect a missing workflow", "delta": "silent by design", "dir": "flat"}]
```

## Defect inventory

```figchart
{"type": "bar", "title": "Defects on main by class", "unit": "occurrences", "data": [{"label": "Moving tag refs", "value": 47}, {"label": "Invalid YAML", "value": 6}, {"label": "Missing SHA", "value": 2}, {"label": "Malformed SHA", "value": 2}]}
```

The moving-tag bar dominates, and it is also the least urgent: a tag resolves today, it just is not immutable. The two right-hand bars are the ones that break execution outright.

## 1. Six workflows are not valid YAML

They have never run. Each is a distinct paste-corruption pattern, not a typo.

| File | Parser message | What is actually wrong |
|---|---|---|
| `CICD_Pipeline.yaml` | while parsing a block mapping | A step indented one space too far, and a `shell:` key left inside `run:`'s block body |
| `download-a-Build-Artifact.yml` | not a mapping | A bare step fragment — no `on:`, no `jobs:`. Not a workflow at all |
| `errorlog-generator.yml` | while parsing a block mapping | A blank line inserted between every key, destroying the mapping nesting |
| `pages-ci.yml` | mapping values are not allowed here | `uses: X; with: {...}` collapsed onto one line, throughout the file |
| `pytest-markers.yml` | mapping values are not allowed here | A stray `4` glued onto the first line |
| `scorecsv.yml` | while scanning a simple key | A duplicated step whose keys lost their indentation; also missing `name:` and `on:` |

Three of the six are named for their purpose — `errorlog-generator`, `pytest-markers`, `scorecsv` — so the repository has been accumulating the state they were meant to maintain.

**Fix:** corrected versions ship in `ci/repaired-workflows-v4/` with an installer. All six parse.

## 2. Four action references cannot resolve

```figchart
{"type": "donut", "title": "Unresolvable refs by failure mode", "unit": "refs", "data": [{"label": "Malformed length (41 or 39 hex)", "value": 2}, {"label": "No such commit (HTTP 422)", "value": 2}]}
```

| Ref | Failure | Where |
|---|---|---|
| `actions/checkout@b4ffde65…cfff0ec2` | 41 hex chars — cannot be a SHA | `FastAPI_CI.yaml:38` |
| `actions/setup-node@0a44ba7841…b29bc` | 39 hex chars — cannot be a SHA | `FastAPI_CI.yaml:97` |
| `actions/checkout@11bd7190…` | `422 No commit found for SHA` | `codeql.yml` |
| `github/codeql-action@c549b93d…` | `422 No commit found for SHA` | `codeql.yml` (init, autobuild, analyze) |

A commit SHA is exactly 40 hex characters, so the first two can never resolve — the runner reports *unable to find version* before a single step executes. The other two were confirmed absent by asking the API about the commit directly.

**Consequence, and it is the significant one:** because all three CodeQL sub-action pins are fabricated, **CodeQL has never run from this repository.** The `analyze (python)` and `analyze (javascript-typescript)` checks that report red are failing to *resolve their actions*, not failing to analyse code.

**Fix:** repin to real commits — `checkout` → `v4`, `codeql-action` → `v3`.

## 3. Forty-seven references use moving tags

`@v4`, `@main` and similar are pointers their owner can repoint at any code, which then runs with this repository's credentials. Not an outage today; recorded because it is the same defect class as section 2 and shares one fix.

## 4. The nine red checks on main, by cause

```figchart
{"type": "donut", "title": "Failing checks on main by cause", "unit": "checks", "data": [{"label": "Code or test logic", "value": 4}, {"label": "Unresolvable action refs", "value": 3}, {"label": "Trigger never evaluates true", "value": 1}, {"label": "Not investigated", "value": 1}]}
```

| Check | Failed step | Cause |
|---|---|---|
| `Run Tests & Upload Coverage` | set up job | Unresolvable action refs |
| `analyze (python)` | set up job | Unresolvable CodeQL pins |
| `analyze (javascript-typescript)` | set up job | Unresolvable CodeQL pins |
| `ci` | Lint | Source-tree lint findings |
| `test` | test run | Test failures |
| `test (3.10)` | test run | Test failures |
| `test (3.11)` | test run | Test failures |
| `Markdown & Docs Check` | condition | Trigger tests a field absent from the event payload, then falls through to a push-only branch — so it skips or fails, never meaningfully passes |
| `build-and-deploy` | — | Not investigated |

Three of these are fixed by repinning actions. The other six are not, and must not be reported as fixed once the pins land.

## What would have caught all of this

The repository now carries `ci/check-action-pins.py`, which reports unpinned references. The gap it does not close is section 1: **nothing in the repository notices when a workflow file stops being valid YAML.** A parse check over `.github/workflows/` — the same shape as the pin check, a few lines of a YAML parser — would convert all six of section 1 from *silently absent* into *visibly reported*, on the day they were committed.

That is the single highest-value follow-up here, because it addresses the only failure mode that produces no signal at all.

## Method

- **YAML validity** — every file parsed with a YAML parser; failures recorded with the parser's own message.
- **Reference lengths** — read from the files and measured, not eyeballed.
- **Non-existent commits** — `GET /repos/{owner}/{repo}/commits/{sha}` per reference, recording the HTTP status.
- **Inherited vs. new** — the same check-runs query run against `main` and against the branch, compared by check name.
