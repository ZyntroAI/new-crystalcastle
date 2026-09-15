"""Flow tests for python-dev orchestrator (scan -> decide -> sandbox run)."""
import os
import sys
from unittest import mock

_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))  # repo root
for p in (_ROOT, os.path.join(_ROOT, "scripts", "sandbox")):
    if p not in sys.path:
        sys.path.insert(0, p)

from skills.python_dev.orchestrator import PythonDevOrchestrator  # noqa: E402
from skills.python_dev.workflow import decide, route  # noqa: E402


def _orchestrator():
    dev = PythonDevOrchestrator()
    # Execution routes through AST10 which calls docker; in unit tests we mock
    # the guard.run to avoid needing a daemon.
    return dev


def test_analyze_clean_source():
    dev = _orchestrator()
    res = dev.analyze(source="x = 1\nprint(x)\n")
    assert res["status"] == "clean"
    assert res["errors"] == []


def test_analyze_flags_unused_import():
    dev = _orchestrator()
    res = dev.analyze(source="import os\nx = 1\n")
    assert res["status"] in ("warn", "error")
    msgs = " ".join(m["message"] for m in res["diagnostics"]).lower()
    assert "os" in msgs  # unused import warning


def test_analyze_syntax_error():
    dev = _orchestrator()
    res = dev.analyze(source="def broken(:\n")
    assert res["status"] == "error"
    assert res["errors"]


def test_inspect_static_only_no_exec():
    dev = _orchestrator()
    res = dev.inspect(source="x=1", need_runtime=True)
    assert "static" in res
    assert res["inspect"]["valid"] is True


def test_workflow_clean_returns_report():
    dev = _orchestrator()
    res = dev.workflow(source="print('hi')\n")
    assert res["status"] == "clean"


def test_route_decision_table():
    assert decide({"status": "clean"}) == "report"
    assert decide({"status": "warn"}) == "advice"
    assert decide({"status": "error"}) == "reproduce"


def test_route_error_invokes_reproduce():
    calls = []
    out = route({"status": "error"}, lambda: (calls.append(1), {"ok": True})[1])
    assert out["step"] == "reproduce"
    assert calls == [1]


def test_execute_routes_to_sandbox():
    dev = _orchestrator()
    with mock.patch.object(dev.guard, "run", return_value={"status": "success", "stage": "G3"}) as m:
        res = dev.execute("print(1)")
    assert res == {"status": "success", "stage": "G3"}
    m.assert_called_once()
