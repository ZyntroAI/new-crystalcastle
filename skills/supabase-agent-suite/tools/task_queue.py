"""Concurrency-safe task queue helpers for the Supabase Agent Skill Suite.

Pure functions — no database connection required. They generate the SQL and the
keys that make concurrent workers safe: atomic claiming via
``FOR UPDATE SKIP LOCKED``, a lease timeout for crashed workers, and idempotency
keys so retries cannot duplicate work.

Import from the suite root:

    import sys; sys.path.insert(0, "<suite>/tools")
    from task_queue import claim_sql, idempotency_key, lease_expired
"""
from __future__ import annotations

import datetime as _dt
import hashlib

DEFAULT_LEASE_SECONDS = 600
MIN_LIMIT = 1
MAX_LIMIT = 1000

#: Claims up to ``limit`` rows atomically. Rows are taken in ``created_at`` order;
#: ``for update skip locked`` lets concurrent workers take *different* rows instead
#: of blocking on the same ones. Stale ``processing`` rows (past the lease) are
#: re-claimable, which is what recovers work from a crashed worker.
CLAIM_TEMPLATE = """\
with next_tasks as (
  select id
  from task_queue
  where status = 'pending'
     or (
       status = 'processing'
       and locked_at < now() - interval '{lease_seconds} seconds'
     )
  order by created_at
  for update skip locked
  limit {limit}
)
update task_queue t
set status     = 'processing',
    locked_by  = $1,
    locked_at  = now(),
    attempts   = attempts + 1
from next_tasks n
where t.id = n.id
returning t.*;
"""


def claim_sql(limit: int = 10, lease_seconds: int = DEFAULT_LEASE_SECONDS) -> str:
    """Return the atomic claim statement.

    Args:
        limit: max rows to claim in one call (1..MAX_LIMIT).
        lease_seconds: how long a claim is valid before it can be re-claimed.

    The caller binds ``$1`` to its worker id — never interpolate an id into SQL.
    """
    if not isinstance(limit, int) or isinstance(limit, bool):
        raise TypeError("limit must be an int")
    if not MIN_LIMIT <= limit <= MAX_LIMIT:
        raise ValueError(f"limit must be between {MIN_LIMIT} and {MAX_LIMIT}")
    if not isinstance(lease_seconds, int) or isinstance(lease_seconds, bool):
        raise TypeError("lease_seconds must be an int")
    if lease_seconds < 1:
        raise ValueError("lease_seconds must be >= 1")
    return CLAIM_TEMPLATE.format(lease_seconds=lease_seconds, limit=limit)


#: Marks a claimed row finished.
COMPLETE_SQL = """\
update task_queue
set status = 'done', locked_by = null, locked_at = null
where id = $1 and locked_by = $2;
"""

#: Returns a row to 'pending' for retry; increments attempts is done at claim time.
RELEASE_SQL = """\
update task_queue
set status = 'pending', locked_by = null, locked_at = null
where id = $1 and locked_by = $2;
"""

#: Insert guarded by the idempotency key — a retry is a no-op, not a duplicate.
ENQUEUE_SQL = """\
insert into task_queue (task_type, payload, idem_key)
values ($1, $2::jsonb, $3)
on conflict (idem_key) do nothing
returning id;
"""


def complete_sql() -> str:
    """Statement to mark a row done. Bind ``(task_id, worker_id)``."""
    return COMPLETE_SQL


def release_sql() -> str:
    """Statement to return a row to 'pending'. Bind ``(task_id, worker_id)``."""
    return RELEASE_SQL


def enqueue_sql() -> str:
    """Statement to enqueue work idempotently. Bind ``(task_type, payload, idem_key)``."""
    return ENQUEUE_SQL


def idempotency_key(task_type: str, natural_key: object, length: int = 32) -> str:
    """Derive a deterministic key so a retried task cannot create a duplicate.

    The key is a truncated SHA-256 of ``"<task_type>:<natural_key>"`` — the same
    logical work always yields the same key, on any worker.

    Args:
        task_type: e.g. ``"sync_order"``.
        natural_key: the stable identity of the work (order id, email, date...).
        length: hex chars to keep (8..64). 32 is ~128 bits.

    Raises:
        ValueError: if ``task_type`` is empty, ``natural_key`` is None, or the
            length is out of range.
    """
    if not task_type or not isinstance(task_type, str):
        raise ValueError("task_type must be a non-empty string")
    if natural_key is None:
        raise ValueError("natural_key must not be None")
    if not isinstance(length, int) or isinstance(length, bool):
        raise TypeError("length must be an int")
    if not 8 <= length <= 64:
        raise ValueError("length must be between 8 and 64")
    return hashlib.sha256(f"{task_type}:{natural_key}".encode("utf-8")).hexdigest()[:length]


def utcnow() -> _dt.datetime:
    """Timezone-aware now (UTC), so comparisons never hit naive/aware errors."""
    return _dt.datetime.now(_dt.timezone.utc)


def lease_expired(locked_at, now=None, lease_seconds: int = DEFAULT_LEASE_SECONDS) -> bool:
    """True if a claim is stale and may be re-claimed.

    A row that was never locked (``locked_at is None``) is treated as claimable.
    Naive timestamps are assumed to be UTC.
    """
    if locked_at is None:
        return True
    if now is None:
        now = utcnow()
    if locked_at.tzinfo is None:
        locked_at = locked_at.replace(tzinfo=_dt.timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=_dt.timezone.utc)
    return (now - locked_at) > _dt.timedelta(seconds=lease_seconds)


def plan_workers(worker_count: int, max_db_connections: int, connections_per_worker: int = 2) -> int:
    """Cap worker concurrency to what the connection pool can actually serve.

    Returns the number of workers to start, never more than requested and never
    more than the pool allows. Prevents the classic runaway where each worker
    opens several connections and exhausts Postgres.
    """
    if worker_count < 1:
        raise ValueError("worker_count must be >= 1")
    if max_db_connections < 1:
        raise ValueError("max_db_connections must be >= 1")
    if connections_per_worker < 1:
        raise ValueError("connections_per_worker must be >= 1")
    return max(1, min(worker_count, max_db_connections // connections_per_worker))
