"""Unit tests for scripts/sandbox/sandbox.py (docker mocked — no daemon needed)."""
import os
import subprocess
import sys
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sandbox import (  # noqa: E402
    HARDENED_DEFAULTS,
    SandboxError,
    _build_docker_command,
    _coerce_bool,
    _enforce_manifest,
    _validate_config,
    sandbox_execution_node,
)


def test_build_command_read_only_flag_and_tmpfs():
    cmd = _build_docker_command("print(1)", HARDENED_DEFAULTS)
    assert "--read-only" in cmd
    assert "--read-only=True" not in cmd          # point 1: no value
    assert "--tmpfs" in cmd
    assert "/tmp:rw" in cmd[cmd.index("--tmpfs") + 1]
    assert cmd[-1] == "print(1)"                  # script is last positional
    assert cmd.count("-c") == 0                   # ENTRYPOINT is python3 -c
    assert "--network=none" in cmd                # hard-locked none
    assert "--cap-drop=ALL" in cmd
    assert "--security-opt" in cmd
    assert "no-new-privileges=true" in cmd


def test_coerce_bool_rejects_invalid():
    try:
        _coerce_bool("maybe", "x")
        assert False, "should raise"
    except SandboxError:
        pass
    assert _coerce_bool("True", "x") is True
    assert _coerce_bool("0", "x") is False


def test_validate_config_limits():
    _validate_config({"timeout": 30, "memory": "512m", "cpus": "0.5", "image": "img:1"})
    for bad in (
        {"timeout": 301, "memory": "1g", "cpus": "1", "image": "i"},
        {"timeout": 0, "memory": "1g", "cpus": "1", "image": "i"},
        {"timeout": "30", "memory": "1g", "cpus": "1", "image": "i"},
    ):
        try:
            _validate_config(bad)
            assert False, f"should reject {bad}"
        except SandboxError:
            pass
    try:
        _validate_config({"timeout": 30, "memory": "lots", "cpus": "1", "image": "i"})
        assert False
    except SandboxError:
        pass


def test_enforce_manifest_denies_undeclared_network():
    script = "# sandbox:network.http.get\nimport requests"
    try:
        _enforce_manifest(script, {"allow": ["fs.read"]})
        assert False, "should deny"
    except SandboxError:
        pass
    _enforce_manifest(script, {"allow": ["network.http.get"]})
    try:
        _enforce_manifest("# sandbox:rm_rf_everything\nx", {"allow": []})
        assert False
    except SandboxError:
        pass


def test_no_script():
    assert sandbox_execution_node({})["status"] == "error"


def test_denied_when_network_declared_not_allowed():
    state = {
        "proposed_script": "# sandbox:network.http.get\nimport requests",
        "permission_manifest": {"allow": ["fs.read"]},
    }
    assert sandbox_execution_node(state)["status"] == "denied"


def test_success_json_output():
    state = {"proposed_script": "import json; print(json.dumps({'a':1}))"}
    with mock.patch("sandbox.subprocess.run") as m:
        m.return_value = mock.Mock(returncode=0, stdout='{"a": 1}\n', stderr="")
        out = sandbox_execution_node(state)
    assert out["status"] == "success"
    assert out["output"] == {"a": 1}
    assert out["format"] == "json"
    assert out["sandbox"]["network"] == "none"
    argv = m.call_args.args[0]
    assert "--read-only" in argv
    assert "--network=none" in argv


def test_success_text_output():
    state = {"proposed_script": "print('hi')"}
    with mock.patch("sandbox.subprocess.run") as m:
        m.return_value = mock.Mock(returncode=0, stdout="hi\n", stderr="")
        out = sandbox_execution_node(state)
    assert out["status"] == "success"
    assert out["format"] == "text"
    assert out["output"] == "hi\n"


def test_failed_exit_code():
    state = {"proposed_script": "raise Exception('boom')"}
    with mock.patch("sandbox.subprocess.run") as m:
        m.return_value = mock.Mock(returncode=1, stdout="", stderr="Traceback...")
        out = sandbox_execution_node(state)
    assert out["status"] == "failed"
    assert out["error"] == "EXIT_1"
    assert "Traceback" in out["sandbox"]["stderr"]


def test_timeout_expired():
    state = {"proposed_script": "while True: pass"}
    with mock.patch(
        "sandbox.subprocess.run", side_effect=subprocess.TimeoutExpired(["docker"], 30)
    ):
        out = sandbox_execution_node(state)
    assert out["status"] == "error"
    assert out["error"] == "EXECUTION_TIMEOUT"


def test_override_network_is_ignored():
    """point 3: caller cannot relax network/memory/cpus — defaults always win."""
    state = {
        "proposed_script": "print(1)",
        "sandbox_config": {
            "network": "host", "memory": "100g", "cpus": "8", "privileged": True,
        },
    }
    with mock.patch("sandbox.subprocess.run") as m:
        m.return_value = mock.Mock(returncode=0, stdout="1\n", stderr="")
        out = sandbox_execution_node(state)
    argv = m.call_args.args[0]
    assert "--network=none" in argv      # not host
    assert "--memory=512m" in argv       # not 100g
    assert "--cpus=0.5" in argv          # not 8
    assert "--privileged" not in argv
    assert out["status"] == "success"
