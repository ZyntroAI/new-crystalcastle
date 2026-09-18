#!/usr/bin/env python3
"""Run each test suite in its own subprocess so suites cannot shadow each other.

Why this exists
---------------
Several suites in this repo declare top-level modules with the SAME name, and
their test files import those modules with bare statements:

* ``loader.py`` lives in four suites (``supabase-agent-suite``, ``fig-suite``,
  ``fig-best-practices-suite``, ``crystalcastlex-skill-suite``) and tests do
  ``import loader`` / ``from loader import ...``.
* ``test_suite.py`` is the test module basename in three suites.

When pytest collects every suite in one process, the first module collected wins
``sys.modules`` and the later ones collide:

    import file mismatch:
    imported module 'test_suite' has this __file__ attribute:
      .../skills/supabase-agent-suite/tests/test_suite.py
    which is not the same as the test file we want to collect:
      .../skills/fig-suite/tests/test_suite.py

Each suite passes on its own. Running one subprocess per suite keeps every
suite's own directory first on ``sys.path``, which is how the suite is meant to
be executed.

Usage
-----
    python3 src/run_test_suites.py
    python3 src/run_test_suites.py skills/fig-suite security/cwe1321

Exit code is 0 only when every suite passes.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

DEFAULT_SUITES = [
    "skills/supabase-agent-suite",
    "skills/fig-suite",
    "skills/fig-best-practices-suite",
    "skills/python-dev",
    "security/cwe1321",
    "scripts/workflow_guardian",
    "scripts/sandbox",
    "scripts/sandbox/ast10",
]

PER_SUITE_TIMEOUT = 120

# pytest's exit codes: 0 = all passed.
PASSING_EXIT_CODES = {0}

_COUNT_RE = re.compile(r"(\d+) (passed|failed|error|errors)")


def suite_target(suite: str) -> str:
    """Prefer the suite's own ``tests/`` directory, fall back to the suite root.

    Suite roots can also contain ``examples/`` fixtures that are not runnable
    without extra setup (e.g. ``fig-suite/examples/clean-project`` imports a
    ``site_config`` module the fixture does not ship), so targeting ``tests/``
    keeps the run honest.
    """
    tests_dir = REPO_ROOT / suite / "tests"
    return f"{suite}/tests" if tests_dir.is_dir() else suite


def summarise(output: str) -> str:
    """Pull the pytest tail line (e.g. ``31 passed in 0.40s``) out of the output."""
    for line in reversed(output.strip().splitlines()):
        if _COUNT_RE.search(line) or "no tests ran" in line:
            return line.strip()
    return "no result line"


def run_suite(suite: str) -> tuple[bool, str, str]:
    target = suite_target(suite)
    cmd = [
        sys.executable,
        "-m",
        "pytest",
        target,
        "-q",
        "--no-header",
        "-p",
        "no:cacheprovider",
    ]
    env = dict(os.environ)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(REPO_ROOT),
            env=env,
            capture_output=True,
            text=True,
            timeout=PER_SUITE_TIMEOUT,
        )
    except subprocess.TimeoutExpired:
        return False, f"TIMEOUT after {PER_SUITE_TIMEOUT}s", ""

    output = (proc.stdout or "") + (proc.stderr or "")
    ok = proc.returncode in PASSING_EXIT_CODES
    return ok, summarise(output), output


def main(argv: list[str]) -> int:
    suites = argv[1:] or DEFAULT_SUITES

    results: list[tuple[str, bool, str]] = []
    print("=" * 68)
    print("Per-suite test run (each suite in its own process)")
    print("=" * 68)

    for suite in suites:
        ok, line, output = run_suite(suite)
        results.append((suite, ok, line))
        status = "PASS" if ok else "FAIL"
        print(f"{status:<5} {suite:<38} {line}")
        if not ok:
            print("-" * 68)
            print(output.rstrip())
            print("-" * 68)

    failed = [s for s, ok, _ in results if not ok]
    print("=" * 68)
    print(f"{len(results) - len(failed)}/{len(results)} suites passed")
    if failed:
        print("Failed suites:")
        for suite in failed:
            print(f"  - {suite}")
    print("=" * 68)

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
