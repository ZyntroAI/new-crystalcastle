#!/usr/bin/env python3
"""The same examples using `requests` instead of httpx.

Useful where httpx is not available. Behaviour is identical.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "config"))

import requests  # noqa: E402

BASE_URL = os.environ.get("ZYNTRO_API_URL", "http://localhost:8000")


def main() -> int:
    health = requests.get(f"{BASE_URL}/health", timeout=10)
    health.raise_for_status()
    print("health:", health.json())

    workflows = requests.get(f"{BASE_URL}/api/workflows/", timeout=30).json()
    print(f"workflows: {len(workflows)}")

    logs = requests.get(
        f"{BASE_URL}/api/execution/logs", params={"limit": 5}, timeout=30
    ).json()
    print(f"logs: {len(logs)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
