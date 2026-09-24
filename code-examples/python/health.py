#!/usr/bin/env python3
"""Check that the API is alive."""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "config"))

import httpx  # noqa: E402
from setup import BASE_URL, headers  # noqa: E402


def main() -> int:
    with httpx.Client(base_url=BASE_URL, headers=headers(), timeout=10) as client:
        r = client.get("/health")
        r.raise_for_status()
        print(f"API at {BASE_URL} ->", r.json())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
