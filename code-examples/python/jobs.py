#!/usr/bin/env python3
"""Execute and toggle a cron job."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "config"))

import httpx  # noqa: E402
from setup import BASE_URL, headers  # noqa: E402

JOB_ID = int(os.environ.get("ZYNTRO_JOB_ID", "1"))


def main() -> int:
    with httpx.Client(base_url=BASE_URL, headers=headers(), timeout=30) as client:
        try:
            result = client.post(f"/api/jobs/{JOB_ID}/execute")
            result.raise_for_status()
            print(f"Executed job #{JOB_ID}:", result.json())

            toggled = client.post(f"/api/jobs/{JOB_ID}/toggle")
            toggled.raise_for_status()
            print(f"Toggled job #{JOB_ID}:", toggled.json())
        except httpx.HTTPStatusError as exc:
            print(f"Request failed: {exc.response.status_code} {exc.response.text}")
            print("(A 404 means the job ID does not exist in your database.)")
            return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
