"""Permission tests — execute gated, shell/network/write blocked."""
import os
import sys
from unittest import mock

_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
for p in (_ROOT, os.path.join(_ROOT, "scripts", "sandbox")):
    if p not in sys.path:
        sys.path.insert(0, p)

import pytest  # noqa: E402

from skills.python_dev.orchestrator import PythonDevOrchestrator  # noqa: E402
from skills.python_dev.security import PERMS, SandboxGuard  # noqa: E402


def test_shell_network_write_blocked_by_policy():
    assert PERMS["shell"]["block"] is True
    assert PERMS["network"]["block"] is True
    assert PERMS["filesystem_write"]["block"] is True


def test_execute_requires_sandbox():
    assert PERMS["execute"]["sandbox"] is True


def test_guard_run_requires_can_execute():
    guard = SandboxGuard()
    assert guard.can_execute() is True
    # if execute were turned off, run must refuse
    with mock.patch.dict(PERMS, {"execute": {"level": "APPROVAL", "sandbox": False}}):
        from skills.python_dev.security import require_permission  # re-bound
        with pytest.raises(PermissionError):
            guard.run("print(1)", "t")


def test_guard_run_delegates_to_ast10_sandbox():
    guard = SandboxGuard()
    with mock.patch("skills.python_dev.security._ast10", return_value=lambda s, **kw: {"status": "blocked", "stage": "G3"}) as m:
        res = guard.run("import requests; requests.get('https://x')", "fetch")
    assert res["status"] == "blocked"
    m.assert_called_once()


def test_execute_requires_permission_decorator():
    dev = PythonDevOrchestrator()
    # execute is not 'block' in PERMS, so decorator passes; sandbox handles gating
    with mock.patch.object(dev.runtime, "run", return_value={"status": "success"}):
        assert dev.execute("print(1)") == {"status": "success"}
