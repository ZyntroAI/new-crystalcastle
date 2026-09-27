"""Block migrations that drop/alter data in production"""
import os
import re
from pathlib import Path

BLOCK_PATTERNS = [
    r"drop\s+(table|column)",
    r"alter\s+table.*drop",
    r"truncate",
    r"delete\s+from"
]

def check_migration_security():
    if os.getenv("ENVIRONMENT") != "production":
        return  # Dev/staging is unrestricted

    versions = Path("alembic/versions").glob("*.py")
    latest = max(versions, key=lambda p: p.stat().st_mtime).read_text().lower()

    for pattern in BLOCK_PATTERNS:
        if re.search(pattern, latest):
            print(f"⛔ BLOCKED: Dangerous pattern detected — {pattern}")
            print("Review migration manually and override if safe.")
            exit(1)

if __name__ == "__main__":
    check_migration_security()
