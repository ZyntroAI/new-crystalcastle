"""Static analysis layer — Pyflakes (fast, secure, no import, no side effects)."""
from __future__ import annotations

from typing import Any

import pyflakes.api
import pyflakes.reporter


class _Collector(pyflakes.reporter.Reporter):
    def __init__(self) -> None:
        super().__init__(None, None)
        self.messages: list[dict[str, Any]] = []

    def unexpectedError(self, filename: str, msg: str) -> None:
        self.messages.append({"type": "error", "file": filename, "message": msg})

    def syntaxError(self, filename: str, msg: str, lineno: int, column: int, text: str) -> None:
        self.messages.append(
            {"type": "syntax", "file": filename, "message": msg, "line": lineno, "column": column}
        )

    def flake(self, message: Any) -> None:
        self.messages.append(
            {
                "type": "flake",
                "file": message.filename,
                "line": message.lineno,
                "column": getattr(message, "col", None),
                "message": str(message),
            }
        )


class StaticAnalyzer:
    """Runs Pyflakes over a file or code string without importing anything."""

    def check(self, path: str = None, source: str = None) -> dict[str, Any]:
        if path is None and source is None:
            return {"status": "error", "error": "NO_INPUT"}

        reporter = _Collector()
        try:
            if path is not None:
                pyflakes.api.checkPath(path, reporter=reporter)
            else:
                pyflakes.api.check(source, "inline", reporter=reporter)
        except Exception as e:  # pragma: no cover - defensive
            return {"status": "error", "error": str(e)}

        errors = [m for m in reporter.messages if m["type"] in ("error", "syntax")]
        warnings = [m for m in reporter.messages if m["type"] == "flake"]
        return {
            "status": "error" if errors else ("warn" if warnings else "clean"),
            "diagnostics": reporter.messages,
            "errors": errors,
            "warnings": warnings,
        }
