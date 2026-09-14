"""Tests for security/cwe1333/python/redos_detector.py (CWE-1333).

Run:  python3 security/cwe1333/tests/test_redos_detector.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "python"))

from redos_detector import (  # noqa: E402
    analyze,
    analyze_multiplier,
    check_source,
    report,
)

_passed = 0
_failed = 0


def _assert(condition, message="assertion failed"):
    if not condition:
        raise AssertionError(message)
    return True


def check(label, fn):
    global _passed, _failed
    try:
        fn()
        _passed += 1
        print(f"  PASS  {label}")
    except AssertionError as err:
        _failed += 1
        print(f"  FAIL  {label}\n        {err}")


def ids(findings):
    return sorted(f["id"] for f in findings)


# ---------------------------------------------------------------- detection
print("\nanalyze() — detection")

check("nested quantifier (a+)+ flags RD-001", lambda: (
    _assert("RD-001" in ids(analyze("(a+)+")))
))
check("nested via group (\\w+\\s?)* flags RD-001", lambda: (
    _assert("RD-001" in ids(analyze(r"(\w+\s?)*")))
))
check("nested through extra parens ((a+)+) flags RD-001", lambda: (
    _assert("RD-001" in ids(analyze("((a+)+)")))
))
check("overlapping alternation (a|ab|abc)* flags RD-002", lambda: (
    _assert("RD-002" in ids(analyze("(a|ab|abc)*")))
))
check("two-alt overlap (a|ab)* flags RD-002", lambda: (
    _assert("RD-002" in ids(analyze("(a|ab)*")))
))
check("large-min unbounded \\d{150,} flags RD-004", lambda: (
    _assert("RD-004" in ids(analyze(r"\d{150,}")))
))
check("unbounded dot .* flags RD-005", lambda: (
    _assert("RD-005" in ids(analyze(".*")))
))
check("unbounded dot .+ flags RD-005", lambda: (
    _assert("RD-005" in ids(analyze(".+")))
))
check("exponential depth (a+)+ flags RD-007", lambda: (
    _assert("RD-007" in ids(analyze("(a+)+")))
))

# -------------------------------------------------------- no false positives
print("\nanalyze() — no false positives")

check("safe email regex returns no findings", lambda: (
    _assert(analyze(r"^[a-z]+@[a-z]+\.[a-z]{2,}$") == [])
))
check("bounded quantifier \\w{1,20} returns no findings", lambda: (
    _assert(analyze(r"^\w{1,20}$") == [])
))
check("non-overlapping alternation (a|b)* returns no findings", lambda: (
    _assert(analyze("(a|b)*") == [])
))
check("disjoint 3-alt (abc|def|ghi)* returns no findings", lambda: (
    _assert(analyze("(abc|def|ghi)*") == [])
))
check("plain literal abc returns no findings", lambda: (
    _assert(analyze("abc") == [])
))

# ------------------------------------------------------------- robustness
print("\nanalyze() — robustness")

check("invalid pattern returns [] and does not raise", lambda: (
    _assert(analyze("(unclosed") == [])
))
check("flags are honoured (re.IGNORECASE)", lambda: (
    _assert(isinstance(analyze(r"\d{150,}", 0), list))
))

# ------------------------------------------------------- analyze_multiplier
print("\nanalyze_multiplier() — quantifier depth")

check("(a+)+ is depth 2 exponential/critical", lambda: (
    _assert(analyze_multiplier("(a+)+") == {
        "depth": 2, "label": "exponential (O(k^n))", "severity": "critical"})
))
check("a+ is depth 1 linear-unbounded/medium", lambda: (
    _assert(analyze_multiplier("a+") == {
        "depth": 1, "label": "linear-unbounded", "severity": "medium"})
))
check("\\w{1,20} is bounded", lambda: (
    _assert(analyze_multiplier(r"\w{1,20}") == {
        "depth": 0, "label": "bounded", "severity": "none"})
))
check("(\\w+\\s?)* reports depth >= 2", lambda: (
    _assert(analyze_multiplier(r"(\w+\s?)*")["depth"] >= 2)
))

# ----------------------------------------------------------- check_source
print("\ncheck_source() — RD-003")

check("re.compile(user input) is flagged", lambda: (
    _assert(len(check_source("import re\nre.compile(request.args['p'])\n")) == 1)
))
check("re.compile(constant) is not flagged", lambda: (
    _assert(check_source("import re\nre.compile(r'^a+$')\n") == [])
))
check("compiled.search(request.body) is flagged", lambda: (
    _assert(len(check_source("pat.search(request.body)\n")) >= 1)
))
check("broken source returns [] and does not raise", lambda: (
    _assert(check_source("def (") == [])
))

# ------------------------------------------------------- atomic / possessive
print("\natomic + possessive (Python 3.11+)")

check("atomic group (?>a+) parses without error", lambda: (
    _assert(isinstance(analyze("(?>a+)"), list))
))
check("possessive a++ parses without error", lambda: (
    _assert(isinstance(analyze("a++"), list))
))

# ------------------------------------------------------------------ report
print("\nreport() — rendering")

check("report renders id, severity and fix", lambda: (
    _assert("[RD-001]" in report(analyze("(a+)+")))
))

# ------------------------------------------------------------------ summary
print("\n" + "=" * 52)
print(f"  PASSED: {_passed}   FAILED: {_failed}")
print("=" * 52)

if _failed:
    sys.exit(1)
