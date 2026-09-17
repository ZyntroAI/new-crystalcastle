"""Slack alert notifier for AST10 G3 (and reusable elsewhere).

Reads a webhook URL from ``SLACK_WEBHOOK_URL``. If unset (or when
``SLACK_ALERTS_DISABLED=1``) it returns a no-op notifier so the security stack
works in CI / tests / local without Slack, and never blocks execution on a
network error.

Uses only the stdlib (``urllib``) — no extra dependency.

``make_alert()`` returns ``Callable[[severity, payload], dict | None]``:
    - ``None``      -> could not send (disabled / no URL / network error)
    - ``dict``      -> Slack API response (``{"ok": True, ...}``)

Severities map to Slack attachment colors:
    SUCCESS -> good(green) ; WARNING -> warning(amber) ; CRITICAL/ERROR -> danger(red).
"""
from __future__ import annotations

import json
import os
import time
import urllib.request
from typing import Any, Callable, Dict, Optional

_SEVERITY_COLOR = {
    "SUCCESS": "good",
    "WARNING": "warning",
    "CRITICAL": "danger",
    "ERROR": "danger",
}


def _enabled() -> bool:
    if os.getenv("SLACK_ALERTS_DISABLED", "").strip() in ("1", "true", "yes"):
        return False
    return bool(os.getenv("SLACK_WEBHOOK_URL", "").strip())


def _color(severity: str) -> str:
    return _SEVERITY_COLOR.get(str(severity).upper(), "warning")


def _post(webhook_url: str, payload: Dict[str, Any], timeout: float = 5.0) -> Optional[dict]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        webhook_url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return {"ok": True, "status": resp.status, "body": resp.read().decode("utf-8", "replace")}


def _send(webhook_url: str, severity: str, payload: Dict[str, Any]) -> Optional[dict]:
    msg = payload.get("msg") or payload.get("reason") or payload.get("event") or "AST10 alert"
    text = f"[{severity}] {payload.get('event', 'event')}: {msg}"
    slack_payload = {
        "text": f"AST10 · {severity}",
        "attachments": [
            {
                "color": _color(severity),
                "text": text,
                "fields": [{"title": k, "value": str(v), "short": len(str(v)) < 40} for k, v in payload.items() if k not in ("msg",)],
                "ts": str(int(time.time())),
            }
        ],
    }
    return _post(webhook_url, slack_payload)


def make_alert(webhook_url: Optional[str] = None) -> Callable[[str, Dict[str, Any]], Optional[dict]]:
    """Return a ``(severity, payload) -> response`` notifier.

    Falls back to a no-op when Slack is not configured.
    """
    url = (webhook_url or os.getenv("SLACK_WEBHOOK_URL", "")).strip()
    if not url or not _enabled():
        return lambda severity, payload: None

    def _alert(severity: str, payload: Dict[str, Any]) -> Optional[dict]:
        try:
            return _send(url, severity, payload)
        except Exception:
            # Alerting must never break the security gate.
            return None

    return _alert


def send_slack_alert(severity: str, payload: Dict[str, Any]) -> Optional[dict]:
    """Module-level convenience: notifies Slack using the environment webhook."""
    return make_alert()(severity, payload)
