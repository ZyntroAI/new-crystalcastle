#!/usr/bin/env python3
"""Read execution logs and surface non-success entries."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "config"))

import httpx  # noqa: E402
from setup import BASE_URL, headers  # noqa: E402

LIMIT = int(os.environ.get("ZYNTRO_LOG_LIMIT", "10"))
OK = {"success", "completed"}


def main() -> int:
    with httpx.Client(base_url=BASE_URL, headers=headers(), timeout=30) as client:
        logs = client.get("/api/execution/logs", params={"limit": LIMIT}).json()

    print(f"{len(logs)} log entries:")
    for row in logs:
        print(f"  #{row.get('id')}  job={row.get('job_id', '-')}  status={row.get('status', '-')}")

    failed = [r for r in logs if r.get("status") and r["status"] not in OK]
    if failed:
        print(f"\n{len(failed)} non-success entries:")
        for row in failed:
            print(f"  {row['status']}: {row.get('message', '')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
