"""Tests for the Slack alert notifier + its wiring into the G3 sandbox node."""
import os
import sys
from unittest import mock

_AST10 = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../ast10
_SANDBOX = os.path.dirname(_AST10)  # .../scripts/sandbox
for _p in (_AST10, _SANDBOX):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from slack_alert import _color, make_alert, send_slack_alert  # noqa: E402


def test_make_alert_noop_when_unconfigured():
    with mock.patch.dict(os.environ, {}, clear=True):
        alert = make_alert()
        assert alert("WARNING", {"event": "x"}) is None


def test_make_alert_noop_when_explicitly_disabled():
    with mock.patch.dict(os.environ, {"SLACK_ALERTS_DISABLED": "1", "SLACK_WEBHOOK_URL": "https://x"}):
        assert make_alert("https://x")("WARNING", {"event": "x"}) is None


def test_make_alert_sends_payload():
    with mock.patch.dict(os.environ, {"SLACK_WEBHOOK_URL": "https://hooks.slack.com/abc"}, clear=True):
        with mock.patch("slack_alert._post", return_value={"ok": True}) as post:
            res = make_alert()("CRITICAL", {"event": "G3 Runtime Failure", "msg": "boom"})
    assert res == {"ok": True}
    post.assert_called_once()
    payload = post.call_args[0][1]
    assert "attachments" in payload
    assert payload["attachments"][0]["color"] == "danger"


def test_alert_never_raises_on_network_error():
    with mock.patch.dict(os.environ, {"SLACK_WEBHOOK_URL": "https://hooks.slack.com/abc"}, clear=True):
        with mock.patch("slack_alert._post", side_effect=OSError("no net")):
            assert make_alert()("ERROR", {"event": "x"}) is None


def test_color_mapping():
    assert _color("SUCCESS") == "good"
    assert _color("WARNING") == "warning"
    assert _color("CRITICAL") == "danger"
    assert _color("ERROR") == "danger"
    assert _color("bogus") == "warning"


def test_send_slack_alert_convenience():
    with mock.patch.dict(os.environ, {"SLACK_WEBHOOK_URL": "https://hooks.slack.com/abc"}, clear=True):
        with mock.patch("slack_alert._post", return_value={"ok": True}):
            assert send_slack_alert("SUCCESS", {"event": "done"}) == {"ok": True}


def test_g3_imports_cleanly():
    # g3.py now imports slack_alert.make_alert; ensure the import chain works.
    import importlib
    importlib.import_module("ast10.g3")


def test_g3_default_alert_noop_when_unconfigured():
    import ast10.g3
    with mock.patch.dict(os.environ, {}, clear=True):
        # Default resolved at import time with no env -> safe no-op.
        assert ast10.g3._DEFAULT_ALERT("WARNING", {"event": "x"}) is None
