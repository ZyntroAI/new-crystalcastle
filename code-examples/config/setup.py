"""Shared configuration for the Python examples."""

import os

BASE_URL = os.environ.get("ZYNTRO_API_URL", "http://localhost:8000")


def headers(extra: dict | None = None) -> dict:
    """Default headers, adding a bearer token when one is configured."""
    h = {"Content-Type": "application/json"}
    if extra:
        h.update(extra)
    key = os.environ.get("ZYNTRO_API_KEY")
    if key:
        h["Authorization"] = f"Bearer {key}"
    return h
