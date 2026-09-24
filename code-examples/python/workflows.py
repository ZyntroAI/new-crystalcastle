#!/usr/bin/env python3
"""List, execute and toggle workflows."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "config"))

import httpx  # noqa: E402
from setup import BASE_URL, headers  # noqa: E402


def main() -> int:
    with httpx.Client(base_url=BASE_URL, headers=headers(), timeout=30) as client:
        workflows = client.get("/api/workflows/").json()
        print(f"Found {len(workflows)} workflow(s)")
        for wf in workflows:
            print(f"  #{wf['id']}  {wf.get('name', '')}")

        if not workflows:
            print("No workflows to execute.")
            return 0

        wf_id = workflows[0]["id"]
        result = client.post(f"/api/workflows/{wf_id}/execute").json()
        print(f"Executed workflow #{wf_id}:", result)

        toggled = client.post(f"/api/workflows/{wf_id}/toggle").json()
        print(f"Toggled workflow #{wf_id}:", toggled)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
