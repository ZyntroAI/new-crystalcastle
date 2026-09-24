#!/usr/bin/env python3
"""Warn about (or, with --strict, fail on) unpinned GitHub Actions references.

Why pinning matters
===================
An action reference of the form ``owner/repo@v4`` or ``owner/repo@main`` is a
moving pointer. Whoever controls the action's repository -- or anyone who
compromises it -- can repoint that pointer at different code, which then runs
in this repository's workflows with this repository's secrets. A full
40-character commit SHA cannot be repointed, so the code that runs is the code
that was reviewed.

A step may be written in either of two forms, and BOTH are checked::

      uses: actions/checkout@<sha>
    - uses: actions/checkout@<sha>

Missing the second form is the classic blind spot. An earlier pass over this
repository used ``^\\s*uses:`` and silently skipped 28 references that were
written as list items -- which is why the pattern here makes the leading
``- `` optional rather than assuming it away.

Default behaviour is to WARN
============================
Violations are reported as GitHub annotations and in the job summary, and the
process exits 0. A repository with a pre-existing backlog can therefore adopt
this check without turning every pull request red on the first run -- a gate
that is red before you start is a gate people disable. Pass ``--strict`` when
you want it to actually block.

Exit codes
==========
``0``
    Clean: every reference is pinned. Also returned when violations ARE found
    in the default warn mode -- the check reports them and exits clean, so a
    pull request is never blocked by a backlog that existed before it.

``1``
    Violations found **and** ``--strict`` was passed. Use ``--strict`` where a
    hard gate is wanted -- a scheduled audit, a pre-commit hook, a release
    gate -- without changing the workflow, which stays in warn mode. This is
    the only condition that produces exit 1; it means "unpinned references
    exist and you asked to be blocked by them".

``2``
    The check could not run: the workflows directory is missing or is not a
    directory, or a file beneath it could not be read or decoded. A check that
    cannot run is never silently reported as a pass, and this exit code is not
    suppressed by warn mode -- a broken guard should be visible.

Usage
=====
    python3 ci/check-action-pins.py                 # warn, exit 0
    python3 ci/check-action-pins.py --strict        # gate, exit 1
    python3 ci/check-action-pins.py --summary-file "$GITHUB_STEP_SUMMARY"
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SHA_RE = re.compile(r"^[0-9a-f]{40}$")
USES_RE = re.compile(r"^\s*(?:-\s*)?uses:\s*([^\s#]+)")
WF_SUFFIXES = (".yml", ".yaml")

FIX_HINT = (
    "Pin each one to a full commit SHA, keeping the version readable:\n"
    "    uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262  # v4\n"
    "Resolve a tag's SHA with:\n"
    "    gh api repos/OWNER/REPO/git/ref/tags/TAG --jq .object.sha\n"
    "If a reference genuinely cannot be pinned, add it to\n"
    ".github/action-pin-allowlist with a comment explaining why."
)


def load_allowlist(path: Path | None) -> set[str]:
    """One allowed ``owner/repo@sha`` or bare ``owner/repo`` per line; # comments."""
    if not path or not path.is_file():
        return set()
    out: set[str] = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.split("#", 1)[0].strip()
        if line:
            out.add(line)
    return out


def scan(workflows: Path, allow: set[str]) -> tuple[list[dict], int, int, int, list[str]]:
    """Return (violations, pinned, local, file_count, unreadable)."""
    violations: list[dict] = []
    unreadable: list[str] = []
    pinned = local = 0
    files = sorted(p for p in workflows.rglob("*") if p.suffix in WF_SUFFIXES)
    for f in files:
        try:
            lines = f.read_text(encoding="utf-8").splitlines()
        except (OSError, UnicodeDecodeError) as exc:
            unreadable.append(f"{f}: {exc}")
            continue
        for n, line in enumerate(lines, 1):
            m = USES_RE.match(line)
            if not m:
                continue
            ref = m.group(1).rstrip(";,")
            if ref.startswith("./"):
                local += 1
                continue
            if ref in allow or ref.split("@")[0] in allow:
                pinned += 1
                continue
            if "@" not in ref:
                violations.append({
                    "file": str(f), "line": n, "ref": ref,
                    "reason": "no @ref at all -- runs whatever the default branch holds",
                })
                continue
            token = ref.rsplit("@", 1)[1]
            if SHA_RE.match(token):
                pinned += 1
            else:
                violations.append({
                    "file": str(f), "line": n, "ref": ref,
                    "reason": f"'{token}' is a moving pointer, not a commit SHA",
                })
    return violations, pinned, local, len(files), unreadable


def emit_annotations(violations: list[dict]) -> None:
    """Surface each violation as a GitHub annotation (a no-op elsewhere)."""
    for v in violations:
        msg = f"Unpinned action reference: {v['ref']} ({v['reason']})"
        print(f"::warning file={v['file']},line={v['line']},"
              f"title=Unpinned action::{msg}")


def build_summary(violations: list[dict], pinned: int, local: int,
                  file_count: int, strict: bool) -> str:
    lines = [
        "## Action pin check",
        "",
        f"Scanned **{pinned + local + len(violations)}** reference(s) "
        f"in **{file_count}** workflow file(s).",
        "",
        "| | count |",
        "|---|---|",
        f"| pinned to a commit SHA | {pinned} |",
        f"| local (`./...`) | {local} |",
        f"| **unpinned** | **{len(violations)}** |",
        "",
    ]
    if violations:
        mode = "blocking (`--strict`)" if strict else "warning only"
        lines += [
            f"### {len(violations)} unpinned reference(s) — {mode}",
            "",
            "| file | line | reference | why |",
            "|---|---|---|---|",
        ]
        for v in violations:
            lines.append(
                f"| `{v['file']}` | {v['line']} | `{v['ref']}` | {v['reason']} |"
            )
        lines += ["", "```", FIX_HINT, "```", ""]
    else:
        lines += ["Every action reference is pinned to a commit SHA.", ""]
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Check that every GitHub Actions reference is pinned to a commit SHA.",
        epilog="Exit 0 = clean (or warn mode). 1 = violations with --strict. 2 = could not run.",
    )
    ap.add_argument("--workflows", default=".github/workflows",
                    help="directory holding workflow files (default: .github/workflows)")
    ap.add_argument("--allow", default=".github/action-pin-allowlist",
                    help="optional allowlist file; one ref or owner/repo per line")
    ap.add_argument("--strict", action="store_true",
                    help="exit 1 when violations exist (default: warn and exit 0)")
    ap.add_argument("--summary-file", default="",
                    help="append a markdown summary here (e.g. $GITHUB_STEP_SUMMARY)")
    args = ap.parse_args()

    wf = Path(args.workflows)
    if not wf.is_dir():
        print(f"error: workflows directory not found: {wf}", file=sys.stderr)
        return 2

    allow = load_allowlist(Path(args.allow) if args.allow else None)
    violations, pinned, local, file_count, unreadable = scan(wf, allow)

    if unreadable:
        print("error: could not read some workflow files:", file=sys.stderr)
        for u in unreadable:
            print(f"  {u}", file=sys.stderr)
        return 2

    total = pinned + local + len(violations)
    print(f"scanned {total} action reference(s) in {file_count} workflow file(s): "
          f"{pinned} pinned, {local} local, {len(violations)} unpinned")

    emit_annotations(violations)

    if violations:
        print(f"\n{len(violations)} unpinned reference(s):", file=sys.stderr)
        for v in violations:
            print(f"  {v['file']}:{v['line']}: {v['ref']}  ({v['reason']})",
                  file=sys.stderr)
        print("\n" + FIX_HINT, file=sys.stderr)
        if args.strict:
            print("\n--strict: exiting 1 (unpinned references are blocking here).",
                  file=sys.stderr)
        else:
            print("\nwarn mode: exiting 0. This does not block the pull request; "
                  "re-run with --strict to fail instead.", file=sys.stderr)
    else:
        print("OK: every action reference is pinned to a commit SHA")

    if args.summary_file:
        try:
            with open(args.summary_file, "a", encoding="utf-8") as fh:
                fh.write(build_summary(violations, pinned, local, file_count,
                                       args.strict))
        except OSError as exc:
            print(f"warning: could not write summary ({exc})", file=sys.stderr)

    return 1 if (violations and args.strict) else 0


if __name__ == "__main__":
    sys.exit(main())
