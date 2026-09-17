"""Tests for the permission-aware workflow guardian."""
import json
import os
import sys
from pathlib import Path
from unittest import mock

_HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # scripts
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

import guardian  # noqa: E402


def test_gate_allows_non_workflow_with_contents_write():
    with mock.patch.dict(os.environ, {"WORKFLOW_GUARDIAN_SCOPES": "contents:write"}, clear=True):
        r = guardian.gate(["src/App.tsx", "package.json"])
    assert r["status"] == "OK"
    assert r["workflow_files"] == []


def test_gate_blocks_workflow_without_workflows_write():
    with mock.patch.dict(os.environ, {"WORKFLOW_GUARDIAN_SCOPES": "contents:write"}, clear=True):
        r = guardian.gate([".github/workflows/ci.yml"])
    assert r["status"] == "BLOCKED"
    assert r["scope"] == "workflows:write"


def test_gate_allows_workflow_with_workflows_write():
    with mock.patch.dict(os.environ, {"WORKFLOW_GUARDIAN_SCOPES": "contents:write,workflows:write"}, clear=True):
        r = guardian.gate([".github/workflows/ci.yml"])
    assert r["status"] == "OK"


def test_repair_pins_tag_to_sha(tmp_path):
    wf = tmp_path / "x.yml"
    wf.write_text("uses: actions/checkout@v4\nuses: unknown/action@v3\n")
    r = guardian.repair_sha([str(wf)])
    assert str(wf) in r["repaired"]
    out = wf.read_text()
    assert "actions/checkout@11bd71901bbe5b1630ceea73d275971dd864cf32" in out
    # unknown action not guessed
    assert "unknown/action@v3" in out


def test_repair_skips_missing(tmp_path):
    r = guardian.repair_sha([str(tmp_path / "nope.yml")])
    assert r["skipped"] == [str(tmp_path / "nope.yml")]


def test_validate_flags_unpinned(tmp_path):
    wf = tmp_path / "y.yml"
    wf.write_text("uses: actions/checkout@v4\n")
    assert guardian.validate_sha([str(wf)])["valid"] is False
    wf.write_text("uses: actions/checkout@11bd71901bbe5b1630ceea73d275971dd864cf32\n")
    assert guardian.validate_sha([str(wf)])["valid"] is True


def test_run_workflow_blocked_at_gate(tmp_path):
    with mock.patch.dict(os.environ, {"WORKFLOW_GUARDIAN_SCOPES": "contents:write"}, clear=True):
        r = guardian.run_workflow([".github/workflows/ci.yml"], "r", "main")
    assert r["status"] == "BLOCKED"
    assert r["stage"] == "gate"
    assert "handoff" in r and "escalate" in r


def test_run_workflow_noop_no_workflows():
    with mock.patch.dict(os.environ, {"WORKFLOW_GUARDIAN_SCOPES": "contents:write"}, clear=True):
        r = guardian.run_workflow(["src/App.tsx"], "r", "main")
    assert r["status"] == "NOOP"


def test_run_workflow_ready_after_repair(tmp_path, monkeypatch):
    # Build a fake repo root with a workflow under .github/workflows/
    wf = tmp_path / ".github" / "workflows" / "wf.yml"
    wf.parent.mkdir(parents=True)
    wf.write_text("uses: actions/checkout@v4\n")
    monkeypatch.chdir(tmp_path)
    with mock.patch.dict(os.environ, {"WORKFLOW_GUARDIAN_SCOPES": "contents:write,workflows:write"}, clear=True):
        r = guardian.run_workflow([".github/workflows/wf.yml"], "r", "main")
    assert r["status"] == "SUCCESS"
    assert r["stage"] == "ready"
    assert wf.read_text().count("@v") == 0


def test_save_handoff(tmp_path):
    p = str(tmp_path / "sub" / "wf.json")
    guardian.save_handoff({"a": 1}, handoff_path=p)
    assert Path(p).exists()
    assert json.loads(Path(p).read_text())["a"] == 1
