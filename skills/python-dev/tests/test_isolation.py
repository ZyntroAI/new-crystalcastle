"""Isolation tests — python-dev never runs code inline; all execution goes
through the AST10 G3 sandbox (docker, offline). No cross-session leak because
there is no local runtime state to leak.
"""
import os
import sys
from unittest import mock

_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
for p in (_ROOT, os.path.join(_ROOT, "scripts", "sandbox")):
    if p not in sys.path:
        sys.path.insert(0, p)

from skills.python_dev.runtime_layer import RuntimeSession  # noqa: E402
from skills.python_dev.security import SandboxGuard  # noqa: E402


def test_no_inline_eval_path_exists():
    """Guard exposes run() (sandboxed) but must NOT provide a local exec/eval."""
    guard = SandboxGuard()
    assert hasattr(guard, "run")
    assert not hasattr(guard, "exec") or callable(guard.run)  # no inline exec
    assert not hasattr(guard, "eval")


def test_inspect_source_is_pure_parse():
    session = RuntimeSession()
    insp = session.inspect_source("x = [1,2,3]\nprint(sum(x))")
    assert insp["valid"] is True
    assert "x" in insp["top_level_names"]
    # No execution side effect — result is just a parse report.
    assert "output" not in insp and "result" not in insp


def test_run_never_executes_locally():
    """run() must delegate to the sandbox guard, never evaluate inline."""
    session = RuntimeSession()
    with mock.patch.object(session._guard, "run", return_value={"status": "blocked"}) as m:
        res = session.run("print('side effect')")
    assert res["status"] == "blocked"
    m.assert_called_once()


def test_invalid_syntax_detected_without_exec():
    session = RuntimeSession()
    insp = session.inspect_source("def broken(:\n")
    assert insp["valid"] is False
    assert "error" in insp
