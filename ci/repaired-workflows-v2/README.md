# repaired-workflows-v2

Corrected versions of the eight workflow files in `.github/workflows/` that
produce failing runs with **zero jobs** — they never reach a runner, so nothing
in them is exercised.

## Why this pack exists

Eight files on `main` fail with no jobs at all. Diagnosed individually, they are
three different problems that were being counted as one:

| # | File | Real defect | Fix |
|---|---|---|---|
| 1 | `CICD_Pipeline.yaml` | Line 23 indented 5 spaces (needs 6); line 27 `shell: bash` sat **inside** a `run: \|` block | Re-indent; move `shell:` to a step key |
| 2 | `errorlog-generator.yml` | Lines 45+ are a bare step list at column 1 — no `jobs:`/`runs-on:` wrapper | Wrap the steps in `jobs.generate-error-logs` |
| 3 | `pages-ci.yml` | Lines 19/20/23 chain `uses:` and `with:` with `;` and an inline `{...}` map | Split into proper `uses:` + `with:` |
| 4 | `pytest-markers.yml` | Line 1 reads `4# .github/…` — a stray `4` glued to the comment | Restore the comment |
| 5 | `scorecsv.yml` | Lines 26-34: a second `name:`/`uses:` at wrong indent, plus `path:` list items not indented under `path:` | Rebuild the malformed step |
| 6 | `supabase-branch.yml` | Valid YAML. `uses: ./.github/actions/notify` (line 94) points at a composite action that does not exist | Inline the equivalent Job Summary step |
| 7 | `apply-branch-protection.yml` | Valid YAML. `actions/checkout@v7` and `actions/github-ruleset-toolkit@v1` do not exist | Replace with `gh api` calls, same intent + permissions |
| 8 | `download-a-Build-Artifact.yml` | Not a workflow. A bare `- name:`/`uses:`/`with:` fragment copied from the `actions/download-artifact` README | Archive out of `.github/workflows/` |

Files 6 and 7 matter: they parse fine and were never YAML problems. Treating
"zero jobs" as a single symptom would have left both broken.

## Install

```bash
./ci/repaired-workflows-v2/install.sh            # dry run — changes nothing
./ci/repaired-workflows-v2/install.sh --apply    # writes the files
```

Overwrite an existing target deliberately with `--force`.

The installer is **two-phase**: it validates every file first and only writes if
all of them pass. A single bad file cannot leave a half-applied pack behind —
that behaviour is tested.

Each file is checked for valid YAML **and** for action refs pinned to a full
40-character SHA. A tag ref (`@v4`) is rejected.

## What it does *not* claim to fix

These files will parse and schedule jobs after this pack. They will not
necessarily go green, because they have downstream problems that are not YAML:

- `CICD_Pipeline.yaml` runs `pip install -r requirements.txt` then `pytest`.
  With root `requirements.txt` added (PR #216) the install works; whether
  pytest collects anything depends on the test layout.
- `pytest-markers.yml` runs `pytest -m smoke` / `pytest -m ci`. Both need
  markers registered — see `pytest.ini` / `pyproject.toml` marker config.
- `pages-ci.yml` needs pnpm, vite and vitest configs for the `pages/` tree.
- `scorecsv.yml` guards its scorer call and no-ops with a message if the script
  is absent, rather than failing.
- `supabase-branch.yml` still needs `SUPABASE_PROJECT_ID` and a working Supabase
  CLI; it will now at least reach a runner.

## Action refs

Every `uses:` in this pack is pinned to a resolved commit SHA, taken from the
live GitHub API on 2026-09-24 and recorded inline as a trailing `# vN` comment:

| Action | Tag | SHA |
|---|---|---|
| `actions/checkout` | v4 | `11d5960a326750d5838078e36cf38b85af677262` |
| `actions/setup-python` | v5 | `a26af69be951a213d495a4c3e4e4022e16d87065` |
| `actions/setup-node` | v4 | `49933ea5288caeca8642d1e84afbd3f7d6820020` |
| `actions/upload-artifact` | v4 | `ea165f8d65b6e75b540449e92b4886f43607fa02` |
| `actions/download-artifact` | v4 | `d3f86a106a0bac45b974a628896c90dbdf5c8093` |
| `pnpm/action-setup` | v4 | `b906affcce14559ad1aafd4ab0e942779e9f58b1` |
| `codecov/codecov-action` | v4 | `b9fd7d16f6d7d1b5d2bec1a2887e65ceed900238` |
| `actions/upload-pages-artifact` | v3 | `56afc609e74202658d3ffba0e8f6dda462b719fa` |
| `actions/deploy-pages` | v4 | `d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` |
| `supabase/setup-cli` | v1 | `1dedf2c611547ede7232d26866dd3c56ab903bbb` |
| `thollander/actions-comment-pull-request` | v2 | `fabd468d3a1a0b97feee5f6b9e499eab0dd903f6` |

## Relationship to `ci/repaired-workflows/`

That pack already existed on `main` (PR #197). It is left untouched. This pack
is a corrected successor, and it differs in two ways that matter:

1. **It preserves original logic.** `ci/repaired-workflows/pages-ci.yml` has a
   single `pages-ci` job that lints and type-checks `pages/`. The original had
   three jobs — `test`, `build`, `deploy` — including a Pages deploy. That pack
   silently dropped two of them; this one keeps all three.
2. **It covers all eight files.** The earlier pack covers five.

It also supersedes the rejected PR #204, which patched `supabase-deploy.yml`
rather than the missing `notify` action.

## Verification performed

- All 8 pack files parse as YAML.
- Applying the pack takes `.github/workflows/` from 5 unparseable files to
  **27 parse OK, 0 broken**.
- Installer tested in four modes: dry-run (writes nothing), `--apply`
  (7 files installed, targets byte-identical to the pack), corrupt-file failure
  (writes nothing, exit 3), and unpinned-ref rejection.
- `download-a-Build-Artifact.yml` is moved out of `.github/workflows/` to
  `ci/archived-nonworkflows/`, not deleted.
