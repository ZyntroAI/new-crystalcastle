#!/usr/bin/env python3
"""
Stale Data Maintenance — ZyntroAI/new-crystalcastle
Routine: detect → archive → log → purge
"""
import json
import logging
import shutil
from datetime import datetime, timedelta
from pathlib import Path

# Config
RETENTION_DAYS = {
    "temp_files": 7,
    "checkpoints": 30,
    "stale_records": 365,
}

ARCHIVE_ROOT = Path("archive")
LOG_DIR = Path("logs")
Path(ARCHIVE_ROOT).mkdir(exist_ok=True)
Path(LOG_DIR).mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / f"maintenance_{datetime.now():%Y%m%d}.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


def get_cutoff(days: int) -> datetime:
    return datetime.now() - timedelta(days=days)


def archive_stale_checkpoints() -> None:
    cutoff = get_cutoff(RETENTION_DAYS["checkpoints"])
    moved = []

    for cp in Path(".").glob("*checkpoint*.json"):
        mtime = datetime.fromtimestamp(cp.stat().st_mtime)
        if mtime < cutoff:
            quarter = f"{mtime.year}-Q{(mtime.month-1)//3+1}"
            dest = ARCHIVE_ROOT / quarter / cp.name
            dest.parent.mkdir(exist_ok=True)
            shutil.move(cp, dest)
            moved.append(str(cp))
            logger.info(f"Archived: {cp} → {dest}")

    if moved:
        logger.info(f"Archived {len(moved)} checkpoint(s)")
    else:
        logger.info("No stale checkpoints found")


def purge_temp_files() -> None:
    cutoff = get_cutoff(RETENTION_DAYS["temp_files"])
    deleted = []

    for pattern in ("*.tmp", "*~", ".DS_Store"):
        for f in Path(".").rglob(pattern):
            if f.is_file():
                mtime = datetime.fromtimestamp(f.stat().st_mtime)
                if mtime < cutoff:
                    f.unlink()
                    deleted.append(str(f))
                    logger.info(f"Deleted: {f}")

    logger.info(f"Purged {len(deleted)} temp file(s)")


def summarize_storage() -> None:
    total = sum(f.stat().st_size for f in Path(".").rglob("*") if f.is_file())
    logger.info(f"Total working storage: {total / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    logger.info("=== Starting Maintenance Run ===")
    archive_stale_checkpoints()
    purge_temp_files()
    summarize_storage()
    logger.info("=== Run Complete ===")
