"""
redos_detector.py — CWE-1333 ReDoS detection (Python edition).

Pure-stdlib AST analysis of regular expressions, mirroring the JavaScript
detector in ``security/cwe1333/js``.

The v1 implementation (``docs/redos-rules.py``) matched raw *strings* with
pre-compiled regexes. Probing the real Python parser shows that approach was
partly dead and partly wrong:

  * RD-004 never fired — its pattern ``[+*]\\{(\\d{2,}),\\}`` requires a ``+``
    or ``*`` *before* the brace, but ``\\d{150,}`` has none, so the rule could
    never match the thing it was written for.
  * RD-002 missed two-alternative groups (``(a|ab)*``) because its pattern
    demanded three, and fired spuriously on ``(abc|def|ghi)*`` where the
    branches share no prefix at all.
  * Nested-quantifier detection relied on ``\\([^()]*...\\)`` — parens inside
    the group defeated it, and it could not see past a nested ``SUBPATTERN``.

This module parses the pattern with ``re._parser`` and inspects real
``MAX_REPEAT`` / ``BRANCH`` / ``SUBPATTERN`` nodes instead, which is both
precise and free of catastrophic backtracking while analysing.

Unlike JavaScript, Python 3.11+ *does* support atomic groups ``(?>...)`` and
possessive quantifiers ``*+`` / ``++`` — so RD-006 here is an actionable fix,
not merely advice.
"""

from __future__ import annotations

import ast
import re
from typing import Any, Dict, Iterable, Iterator, List, Optional, Sequence, Tuple

try:  # Python 3.11+
    from re import _constants as _re_const
    from re import _parser as _re_parser
except ImportError:  # pragma: no cover - Python < 3.11
    import sre_constants as _re_const  # type: ignore
    import sre_parse as _re_parser  # type: ignore

__all__ = [
    "REDOS_DEFS",
    "analyze",
    "analyze_multiplier",
    "check_source",
    "report",
]

# ``MAXREPEAT`` is a sentinel int marking an unbounded quantifier.
_MAXREPEAT = int(_re_const.MAXREPEAT)

_POSSESSIVE = getattr(_re_const, "POSSESSIVE_REPEAT", None)
_ATOMIC = getattr(_re_const, "ATOMIC_GROUP", None)

#: Every repeat opcode: greedy, lazy, and (3.11+) possessive.
_REPEAT_OPS = {_re_const.MAX_REPEAT, _re_const.MIN_REPEAT}
if _POSSESSIVE is not None:
    _REPEAT_OPS.add(_POSSESSIVE)


# --------------------------------------------------------------------------- #
# Rule catalogue (TH / EN)
# --------------------------------------------------------------------------- #
REDOS_DEFS: Dict[str, Dict[str, str]] = {
    "RD-001": {
        "id": "RD-001",
        "severity": "critical",
        "name": "Nested Quantifiers",
        "message": (
            "พบ Quantifier ซ้อนกัน (กลุ่มที่ซ้ำภายใต้กลุ่มที่ซ้ำ) "
            "→ เสี่ยง Backtracking แบบเลขชี้กำลัง"
        ),
        "fix": "ลดการซ้อน / ระบุขอบเขต {min,max} / ใช้ Atomic Group (?>...)",
    },
    "RD-002": {
        "id": "RD-002",
        "severity": "high",
        "name": "Overlapping Alternation",
        "message": (
            "ทางเลือกที่นำหน้าทับกันภายใต้กลุ่มที่ซ้ำ "
            "→ เพิ่มเวลาแยกทางเลือกแบบเลขชี้กำลัง"
        ),
        "fix": "เรียงทางเลือกจากยาวไปสั้น / ลบทางเลือกที่ซ้ำกัน",
    },
    "RD-003": {
        "id": "RD-003",
        "severity": "high",
        "name": "RegExp built from user input",
        "message": (
            "สร้างหรือใช้ RegEx กับข้อมูลผู้ใช้โดยตรง "
            "→ เสี่ยง ReDoS จาก pattern ที่ผู้ใช้ควบคุม"
        ),
        "fix": "ใช้ pattern คงที่ (whitelist) / จำกัดความยาว input ก่อนทดสอบ",
    },
    "RD-004": {
        "id": "RD-004",
        "severity": "medium",
        "name": "Large minimum with unbounded maximum",
        "message": (
            "Quantifier ไม่มีขอบบนและมีค่าน้อยสุดสูงผิดปกติ → อาจช้ามากเมื่อไม่ตรงรูปแบบ"
        ),
        "fix": "กำหนดขอบเขตบนเสมอ: {min,max}",
    },
    "RD-005": {
        "id": "RD-005",
        "severity": "high",
        "name": "Unbounded dot",
        "message": (
            "ใช้ . แบบไม่จำกัด (* หรือ +) → เสี่ยง ReDoS สูง "
            "โดยเฉพาะเมื่อซ้อนในกลุ่ม"
        ),
        "fix": r"ใช้ตัวอักษรเฉพาะเจาะจง เช่น [^\n] / [^a-z] หรือจำกัดขอบเขต",
    },
    "RD-006": {
        "id": "RD-006",
        "severity": "info",
        "name": "Atomic-group rewrite candidate",
        "message": (
            "กลุ่มที่ซ้ำนี้มี Quantifier อยู่ข้างใน — ลด backtracking ได้ด้วย "
            "Atomic Group (?>...) หรือ Possessive Quantifier (Python 3.11+)"
        ),
        "fix": r"แปลงเป็น (?>...) หรือใช้ *+ / ++ แทน * / +",
    },
    "RD-007": {
        "id": "RD-007",
        "severity": "high",
        "name": "Exponential quantifier depth",
        "message": (
            "พบ Quantifier ไม่จำกัดขอบซ้อนกัน ≥ 2 ชั้น → ความซับซ้อนเป็นเลขชี้กำลัง"
        ),
        "fix": "ลดความลึกของการซ้อน หรือเปลี่ยนไปใช้ parser ที่ไม่ใช้ backtracking",
    },
}


# --------------------------------------------------------------------------- #
# AST helpers — pure traversal of ``re._parser`` output
# --------------------------------------------------------------------------- #
_Op = Any
_Item = Tuple[_Op, Any]
_Items = Sequence[_Item]


def _is_unbounded(maximum: Any) -> bool:
    """True when a repeat has no upper bound (``MAXREPEAT`` sentinel)."""
    try:
        return int(maximum) >= _MAXREPEAT
    except (TypeError, ValueError):  # pragma: no cover - defensive
        return False


def _sub_items(op: _Op, av: Any) -> Optional[_Items]:
    """The child items of a container node, or ``None`` if it is not one."""
    if op in _REPEAT_OPS:
        return av[2]
    if op is _re_const.SUBPATTERN:
        return av[3]
    if _ATOMIC is not None and op is _ATOMIC:
        return av
    return None


def _walk(items: _Items) -> Iterator[_Item]:
    """Yield every (op, av) node in the tree, depth-first."""
    for op, av in items:
        yield op, av
        children = _sub_items(op, av)
        if children is not None:
            yield from _walk(children)
        elif op is _re_const.BRANCH:
            for alt in av[1]:
                yield from _walk(alt)


def _parse(pattern: str, flags: int = 0) -> Optional[_Items]:
    """Parse a pattern; return ``None`` when it is not valid Python regex."""
    try:
        return list(_re_parser.parse(pattern, flags))
    except (re.error, ValueError, TypeError):
        return None


# --------------------------------------------------------------------------- #
# Individual rules
# --------------------------------------------------------------------------- #
def _has_nested_quantifiers(items: _Items, inside_unbounded: bool = False) -> bool:
    """RD-001: an unbounded repeat wrapping another unbounded repeat."""
    for op, av in items:
        if op in _REPEAT_OPS:
            unbounded = _is_unbounded(av[1])
            if unbounded and inside_unbounded:
                return True
            if _has_nested_quantifiers(av[2], inside_unbounded or unbounded):
                return True
            continue
        children = _sub_items(op, av)
        if children is not None:
            if _has_nested_quantifiers(children, inside_unbounded):
                return True
        elif op is _re_const.BRANCH:
            for alt in av[1]:
                if _has_nested_quantifiers(alt, inside_unbounded):
                    return True
    return False


def _signature(items: _Items) -> Tuple[Any, ...]:
    """A comparable, order-preserving fingerprint of an alternative."""
    sig: List[Any] = []
    for op, av in items:
        if op is _re_const.LITERAL:
            sig.append(("LITERAL", av))
        elif op is _re_const.NOT_LITERAL:
            sig.append(("NOT_LITERAL", av))
        elif op in _REPEAT_OPS:
            sig.append(("REPEAT", int(av[0]), int(av[1])))
        elif op is _re_const.SUBPATTERN:
            sig.append(("SUBPATTERN", _signature(av[3])))
        elif op is _re_const.BRANCH:
            sig.append(("BRANCH",))
        elif op is _re_const.IN:
            sig.append(("IN",))
        elif op is _re_const.ANY:
            sig.append(("ANY",))
        elif op is _re_const.CATEGORY:
            sig.append(("CATEGORY", av))
        elif op is _re_const.AT:
            sig.append(("AT", av))
        elif _ATOMIC is not None and op is _ATOMIC:
            sig.append(("ATOMIC",))
        else:  # pragma: no cover - unknown opcodes stay opaque
            sig.append((str(op),))
    return tuple(sig)


def _is_prefix(a: Tuple[Any, ...], b: Tuple[Any, ...]) -> bool:
    return len(a) <= len(b) and b[: len(a)] == a


def _iter_branches(
    items: _Items, in_repeat: bool = False
) -> Iterator[Tuple[List[_Items], bool]]:
    """Yield ``(alternatives, inside_a_repeat)`` for every BRANCH node."""
    for op, av in items:
        if op is _re_const.BRANCH:
            yield av[1], in_repeat
            for alt in av[1]:
                yield from _iter_branches(alt, in_repeat)
            continue
        if op in _REPEAT_OPS:
            yield from _iter_branches(av[2], True)
            continue
        children = _sub_items(op, av)
        if children is not None:
            yield from _iter_branches(children, in_repeat)


def _has_overlapping_alternation(items: _Items) -> bool:
    """RD-002: prefix-overlapping branches inside a repeated group."""
    for alts, in_repeat in _iter_branches(items):
        if not in_repeat or len(alts) < 2:
            continue
        sigs = [_signature(alt) for alt in alts]
        for i, a in enumerate(sigs):
            for j, b in enumerate(sigs):
                if i == j:
                    continue
                # An empty alternative (Python factors a shared prefix out of
                # the first branch) is a prefix of every other alternative.
                if _is_prefix(a, b):
                    return True
    return False


def _has_large_min_unbounded(items: _Items) -> bool:
    """RD-004: unbounded upper bound with an unusually large minimum."""
    for op, av in _walk(items):
        if op in _REPEAT_OPS and _is_unbounded(av[1]) and int(av[0]) >= 10:
            return True
    return False


def _has_unbounded_dot(items: _Items) -> bool:
    """RD-005: an unbounded repeat applied directly to ``.``."""
    for op, av in _walk(items):
        if op not in _REPEAT_OPS or not _is_unbounded(av[1]):
            continue
        sub = av[2]
        if len(sub) == 1 and sub[0][0] is _re_const.ANY:
            return True
    return False


def _has_atomic_group_candidate(items: _Items) -> bool:
    """RD-006: a quantified group that itself contains a quantifier."""
    for op, av in _walk(items):
        if op not in _REPEAT_OPS:
            continue
        sub = av[2]
        if any(child_op in _REPEAT_OPS for child_op, _ in _walk(sub)):
            return True
    return False


def _quantifier_depth(items: _Items, current: int = 0) -> int:
    """Deepest chain of unbounded quantifiers."""
    best = 0
    for op, av in items:
        if op in _REPEAT_OPS:
            depth = current + (1 if _is_unbounded(av[1]) else 0)
            best = max(best, depth, _quantifier_depth(av[2], depth))
            continue
        children = _sub_items(op, av)
        if children is not None:
            best = max(best, _quantifier_depth(children, current))
        elif op is _re_const.BRANCH:
            for alt in av[1]:
                best = max(best, _quantifier_depth(alt, current))
    return best


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def analyze_multiplier(pattern: str, flags: int = 0) -> Dict[str, Any]:
    """Measure the nesting depth of unbounded quantifiers.

    ``"(a+)+"`` -> depth 2 (exponential) · ``"a+"`` -> depth 1 (unbounded)
    ``"\\\\w{1,20}"`` -> depth 0 (bounded)
    """
    items = _parse(pattern, flags)
    if items is None:
        return {"depth": 0, "label": "unparseable", "severity": "none"}

    depth = _quantifier_depth(items)
    if depth >= 2:
        return {"depth": depth, "label": "exponential (O(k^n))", "severity": "critical"}
    if depth == 1:
        return {"depth": depth, "label": "linear-unbounded", "severity": "medium"}
    return {"depth": 0, "label": "bounded", "severity": "none"}


def analyze(pattern: str, flags: int = 0) -> List[Dict[str, str]]:
    """Analyse a regex pattern and return its ReDoS findings.

    Findings are ``REDOS_DEFS`` entries. RD-003 is source-level and is reported
    by :func:`check_source` instead. Pure function: no side effects.
    """
    items = _parse(pattern, flags)
    if items is None:
        return []

    findings: List[Dict[str, str]] = []
    if _has_nested_quantifiers(items):
        findings.append(REDOS_DEFS["RD-001"])
    if _has_overlapping_alternation(items):
        findings.append(REDOS_DEFS["RD-002"])
    if _has_large_min_unbounded(items):
        findings.append(REDOS_DEFS["RD-004"])
    if _has_unbounded_dot(items):
        findings.append(REDOS_DEFS["RD-005"])
    if _has_atomic_group_candidate(items):
        findings.append(REDOS_DEFS["RD-006"])
    if analyze_multiplier(pattern, flags)["depth"] >= 2:
        findings.append(REDOS_DEFS["RD-007"])
    return findings


def report(findings: Iterable[Dict[str, str]]) -> str:
    """Render findings as one line each, for CLI / log output."""
    lines = []
    for f in findings:
        lines.append(
            f"[{f['id']}] {f['severity'].upper():8} {f['name']}: {f['message']}"
        )
        lines.append(f"          fix: {f['fix']}")
    return "\n".join(lines)


# --------------------------------------------------------------------------- #
# Source-level check (RD-003)
# --------------------------------------------------------------------------- #
_REGEX_FUNCS = {"compile", "match", "search", "fullmatch", "findall", "finditer", "split"}
_REGEX_METHODS = {"match", "search", "fullmatch", "findall", "finditer"}
_USER_INPUT_HINTS = ("request", "form", "query", "input", "body", "payload", "params")


def _is_dynamic(node: ast.AST) -> bool:
    """True when a regex argument is not a compile-time constant string."""
    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return False
    if isinstance(node, ast.JoinedStr):  # f-string
        return True
    if isinstance(node, (ast.Name, ast.Attribute, ast.Subscript)):
        return True
    return not isinstance(node, ast.Constant)


def _mentions_user_input(node: ast.AST) -> bool:
    for child in ast.walk(node):
        name = None
        if isinstance(child, ast.Name):
            name = child.id
        elif isinstance(child, ast.Attribute):
            name = child.attr
        if name and any(h in name.lower() for h in _USER_INPUT_HINTS):
            return True
    return False


def check_source(source: str) -> List[Dict[str, Any]]:
    """Find regex calls built from user input in Python source (RD-003).

    Each result is ``{"line": int, "col": int, "finding": <REDOS_DEFS entry>}``.
    """
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []

    results: List[Dict[str, Any]] = []

    def flag(node: ast.Call, dynamic: bool) -> None:
        if not dynamic:
            return
        results.append(
            {
                "line": getattr(node, "lineno", 0),
                "col": getattr(node, "col_offset", 0),
                "finding": REDOS_DEFS["RD-003"],
            }
        )

    for node in ast.walk(tree):
        if not isinstance(node, ast.Call) or not node.args:
            continue
        fn = node.func
        # re.<func>(...)  or  re.compile(...)
        if isinstance(fn, ast.Attribute) and fn.attr in _REGEX_FUNCS:
            base = fn.value
            if isinstance(base, ast.Name) and base.id == "re":
                flag(node, _is_dynamic(node.args[0]))
                continue
            # module-alias form: rx.compile(...) / compiled.match(...)
            if fn.attr in _REGEX_METHODS and _mentions_user_input(node):
                flag(node, _mentions_user_input(node))
                continue
        # pattern.search(request.body) — regex object method on user input
        if (
            isinstance(fn, ast.Attribute)
            and fn.attr in _REGEX_METHODS
            and node.args
            and _mentions_user_input(node.args[0])
        ):
            flag(node, True)

    return results
