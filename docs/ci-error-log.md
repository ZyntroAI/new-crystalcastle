Title: CI Error Log — new-crystalcastle
Kicker: What is broken on main, what is inherited, and what each fix requires
Theme: technical
Genre: project-status
tags: [ci, github-actions, incident-log, maintenance]

# CI Error Log

State of `.github/workflows/` for `ZyntroAI/new-crystalcastle`, measured 2026-09-24 against `main` at `f94e1f77`. Every figure was established by querying the live repository and parsing the files — none is inferred from a workflow's name or from an earlier report.

The distinction that governs this document: **a workflow that fails to parse is not a failing workflow, it is an absent one.** GitHub never starts it, so no check turns red for the right reason and the work is silently never done.

```figexec
Six workflow files are not valid YAML and have never run. Four action pins cannot resolve, two of them because the commit does not exist — so CodeQL has never run here either. No check in this repository notices any of it.
```

```figkpi
[{"value": "6", "unit": "workflows", "label": "Not valid YAML", "delta": "never run", "dir": "down"}, {"value": "4", "unit": "refs", "label": "Unresolvable action pins", "delta": "2 malformed, 2 absent", "dir": "down"}, {"value": "47", "unit": "refs", "label": "On moving tags", "delta": "repointable", "dir": "down"}, {"value": "10", "unit": "checks", "label": "Red on main", "delta": "of 19 reported", "dir": "down"}, {"value": "0", "unit": "checks", "label": "Notice a missing workflow", "delta": "no signal at all", "dir": "flat"}]
```

## Defect inventory

```figchart
{"type": "bar", "title": "Defects on main by class", "unit": "occurrences", "data": [{"label": "Moving tag refs", "value": 47}, {"label": "Invalid YAML", "value": 6}, {"label": "No such commit", "value": 2}, {"label": "Malformed SHA", "value": 2}]}
```

The moving-tag bar dominates and is also the least urgent: a tag resolves today, it simply is not immutable. The two right-hand bars are the ones that break execution outright.

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

A commit SHA is exactly 40 hex characters, so the first two can never resolve — the runner reports *unable to find version* before a single step executes. The others were confirmed absent by asking the API about the commit directly.

**Consequence, and it is the significant one:** because all three CodeQL sub-action pins are fabricated, **CodeQL has never run from this repository.** The `analyze (python)` and `analyze (javascript-typescript)` checks that report red are failing to *resolve their actions*, not failing to analyse code.

The same defect also explains `Run Tests & Upload Coverage`, which fails at **set up job** — before any test executes.

**Fix:** repin to real commits — `checkout` → `v4`, `codeql-action` → `v3`, `setup-node` → `v4`.

## 3. Forty-seven references use moving tags

`@v4`, `@main` and similar are pointers their owner can repoint at any code, which then runs with this repository's credentials. Not an outage today; recorded because it is the same defect class as section 2 and shares one fix.

## 4. The red checks, by cause

```figchart
{"type": "donut", "title": "Red checks on main by cause", "unit": "checks", "data": [{"label": "Code or test logic", "value": 5}, {"label": "Unresolvable action refs", "value": 3}, {"label": "Trigger never evaluates true", "value": 1}, {"label": "Environment / other", "value": 1}]}
```

| Check | Failed at | Cause |
|---|---|---|
| `Run Tests & Upload Coverage` | set up job | Unresolvable action refs (section 2) |
| `analyze (python)` | set up job | Unresolvable CodeQL pins (section 2) |
| `analyze (javascript-typescript)` | set up job | Unresolvable CodeQL pins (section 2) |
| `test` | test run | Test failures |
| `test (3.11)` | test run | Test failures |
| `ci` | Lint | Source-tree lint findings |
| `rubric-scoring` | Run Parser Agent | Step logic |
| `Unit Tests (Python 3.9 / 3.11 / 3.12)` | test run | Test failures |
| `Markdown & Docs Check` | condition | Trigger tests a field absent from the event payload, then falls through to a push-only branch — so it skips or fails, never meaningfully passes |
| `build-and-deploy` | — | Not investigated |

### Scope: what is inherited versus what this repository can fix here

Three checks are fixed by repinning actions. The rest are **not**, and must not be reported as fixed once the pins land.

Four checks — `rubric-scoring` and the three `Unit Tests (Python …)` jobs — do not appear on `main` at all but are red on **every one of the nine open pull requests**. A failure uniform across unrelated branches is a repository-level condition, not a property of any single change; treating it as a PR defect would send reviewers hunting in the wrong diff.

## What would have caught all of this

The repository now carries `ci/check-action-pins.py`, which reports unpinned references. The gap it does not close is section 1: **nothing notices when a workflow file stops being valid YAML.** A parse check over `.github/workflows/` — the same shape as the pin check, a few lines of a YAML parser — converts all six of section 1 from *silently absent* to *visibly reported* on the day they are committed.

That is the highest-value follow-up here, because it addresses the only failure mode that produces no signal at all.

## Method

- **YAML validity** — every file parsed with a YAML parser; failures recorded with the parser's own message.
- **Reference lengths** — read from the files and measured, not eyeballed.
- **Non-existent commits** — `GET /repos/{owner}/{repo}/commits/{sha}` per reference, recording the HTTP status.
- **Inherited vs. repository-wide** — the same check-runs query run against `main` and against every open PR head, compared by check name.
