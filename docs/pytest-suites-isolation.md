# Per-suite test execution (CI test isolation)

## Symptom

CI fails at pytest collection while every suite passes when run on its own:

```
import file mismatch: imported module 'test_suite' has this __file__ attribute
ModuleNotFoundError: No module named 'site_config'
```

## Root cause

Two collisions, both caused by collecting every suite in one pytest process:

1. **Duplicate module basenames.** Several suites declare a top-level module
   with the same name, and the first one collected wins `sys.modules`:

   | Basename | Declared in |
   |---|---|
   | `loader.py` | `skills/supabase-agent-suite`, `skills/fig-suite`, `skills/fig-best-practices-suite`, `skills/crystalcastlex-skill-suite` |
   | `test_suite.py` | `skills/supabase-agent-suite/tests`, `skills/fig-suite/tests`, `skills/fig-best-practices-suite/tests` |

   The second suite to be collected is reported as an *import file mismatch*.

2. **Bare imports resolved against the wrong directory.** Test files import
   sibling modules with bare statements (`import loader`,
   `from site_config import ...`). That only works when the suite's own
   directory is first on `sys.path`, which is the case in a per-suite run and
   not in a combined one.

The `ModuleNotFoundError: No module named 'site_config'` comes from
`skills/fig-suite/examples/clean-project/tests/`, an example fixture that
imports `site_config` but does not ship it. It is not a runnable suite; a
combined `pytest` sweeps it up, a per-suite run does not.

## Fix

Run one subprocess per suite — `src/run_test_suites.py`. Each suite keeps its
own directory at the head of `sys.path`, which is how the suite is meant to be
executed.

```
python3 src/run_test_suites.py
python3 src/run_test_suites.py skills/fig-suite security/cwe1321
```

Exit code is 0 only when every suite passes.

## Verification

| Run | Result |
|---|---|
| `python3 -m pytest skills/... scripts/...` (one process) | 3 collection errors, exit 2 |
| `python3 src/run_test_suites.py` | 8/8 suites pass, 167 tests, exit 0 |

Per-suite result:

| Suite | Tests |
|---|---|
| `skills/supabase-agent-suite` | 29 |
| `skills/fig-suite` | 35 |
| `skills/fig-best-practices-suite` | 31 |
| `skills/python-dev` | 17 |
| `security/cwe1321` | 9 |
| `scripts/workflow_guardian` | 10 |
| `scripts/sandbox` | 11 |
| `scripts/sandbox/ast10` | 25 |

## What is deliberately not changed

The bare `import loader` statements and the duplicate `test_suite.py` basenames
are left as they are. Renaming modules inside suites would invalidate their own
imports and tests for no behavioural gain; isolating the runs fixes the CI
symptom without touching suite internals.

## CI

`.github/workflows/pytest-suites.yml` runs `python3 src/run_test_suites.py` on
push and pull requests to `main`. It is additive — it does not replace any
existing workflow.

## Known fixture exception

`skills/fig-suite/examples/clean-project/tests/test_site_config.py` imports
`site_config`, which the fixture does not ship. `run_test_suites.py` targets
each suite's `tests/` directory, so example fixtures are not collected. If that
fixture is meant to be runnable, add the missing `site_config.py`.

## Workflow audit (`.github/workflows`)

Every file in `.github/workflows` was parsed with a YAML loader. Four do not
parse, so GitHub rejects them before any job can run:

| File | Error | Line |
|---|---|---|
| `errorlog-generator.yml` | `expected <block end>, but found '-'` | 45 |
| `pages-ci.yml` | `mapping values are not allowed here` | 19 |
| `pytest-markers.yml` | `mapping values are not allowed here` | 2 |
| `scorecsv.yml` | `could not find expected ':'` | 32 |

Two patterns account for all four:

* `pages-ci.yml` line 19 and `pytest-markers.yml` line 2 both carry a trailing
  `;` on an action reference (`pnpm/action-setup@v4;`), which turns the value
  into an invalid mapping.
* `errorlog-generator.yml` line 45 and `scorecsv.yml` line 32 have an
  unquoted string containing a colon, which YAML reads as a nested mapping.

These are pre-existing and unrelated to test isolation — they are recorded here
so the fix can be scoped separately and not mistaken for a regression from this
change.

Separately, action pins across the workflow set are tag-pinned (`@v4`, `@v5`,
`@v2` …) rather than SHA-pinned. `pytest-suites.yml` follows that existing
convention for consistency; converting the whole set to full SHAs is a
repo-wide policy change that belongs in its own pull request.
