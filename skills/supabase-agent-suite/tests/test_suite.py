"""Tests for the Supabase Agent Skill Suite.

Covers the loader (registry/manifest consistency) and the two tools'
pure logic — the parts that decide whether concurrent agents are safe.
No database or third-party dependency required.

Run:  python -m pytest tests/ -q
"""
from __future__ import annotations

import datetime as dt
import os
import sys

import pytest

SUITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, SUITE)
sys.path.insert(0, os.path.join(SUITE, "tools"))

import loader  # noqa: E402
import task_queue as tq  # noqa: E402
import schema_inventory as si  # noqa: E402


# ── loader ────────────────────────────────────────────────────────────────

def test_suite_loads():
    suite = loader.load_suite()
    assert suite["manifest"]["id"] == "supabase-agent-suite-v1.0.0"
    assert len(suite["skills"]) == suite["manifest"]["skill_count"] == 6


def test_expected_subskills_present():
    ids = set(loader.list_skill_ids())
    assert ids == {
        "connect", "schema-inventory", "migrations",
        "concurrency", "security", "postgres-best-practices",
    }


def test_every_subskill_has_front_matter_and_body():
    for s in loader.load_suite()["skills"]:
        assert s["meta"].get("id", "").startswith("supabase-agent-")
        assert s["meta"].get("suite") == "supabase-agent-suite-v1.0.0"
        assert len(s["body"]) > 200


def test_load_skill_by_id():
    body = loader.load_skill("concurrency")
    assert "for update skip locked" in body.lower()


def test_unknown_skill_raises():
    with pytest.raises(loader.SuiteError):
        loader.load_skill("does-not-exist")


def test_loader_detects_missing_manifest(tmp_path):
    with pytest.raises(loader.SuiteError, match="manifest.json"):
        loader.load_suite(str(tmp_path))


def test_loader_detects_skill_count_mismatch(tmp_path):
    # manifest claims 2 skills, registry declares 1 -> must fail loudly
    (tmp_path / "skills" / "a").mkdir(parents=True)
    (tmp_path / "skills" / "a" / "SKILL.md").write_text("---\nid: x\n---\nbody\n")
    (tmp_path / "metadata").mkdir()
    (tmp_path / "metadata" / "index.json").write_text(
        '{"skills": [{"id": "a", "path": "skills/a"}]}'
    )
    (tmp_path / "manifest.json").write_text(
        '{"id": "x", "name": "x", "version": "1", "skill_count": 2, "format": "skill-md-v1"}'
    )
    with pytest.raises(loader.SuiteError, match="skill_count"):
        loader.load_suite(str(tmp_path))


def test_loader_detects_undeclared_directory(tmp_path):
    (tmp_path / "skills" / "a").mkdir(parents=True)
    (tmp_path / "skills" / "a" / "SKILL.md").write_text("---\nid: a\n---\nbody\n")
    (tmp_path / "skills" / "orphan").mkdir()
    (tmp_path / "metadata").mkdir()
    (tmp_path / "metadata" / "index.json").write_text(
        '{"skills": [{"id": "a", "path": "skills/a"}]}'
    )
    (tmp_path / "manifest.json").write_text(
        '{"id": "x", "name": "x", "version": "1", "skill_count": 1, "format": "skill-md-v1"}'
    )
    with pytest.raises(loader.SuiteError, match="not declared"):
        loader.load_suite(str(tmp_path))


# ── task_queue: atomic claiming ───────────────────────────────────────────

def test_claim_sql_is_atomic_and_skips_locked_rows():
    sql = tq.claim_sql(limit=5, lease_seconds=300)
    low = sql.lower()
    assert "for update skip locked" in low          # never block on a claimed row
    assert "limit 5" in low
    assert "interval '300 seconds'" in low          # lease makes crashed work re-claimable
    assert "status = 'processing'" in low
    assert "$1" in sql                              # worker id is bound, never interpolated


def test_claim_sql_rejects_bad_input():
    with pytest.raises(ValueError):
        tq.claim_sql(limit=0)
    with pytest.raises(ValueError):
        tq.claim_sql(limit=10_000)
    with pytest.raises(TypeError):
        tq.claim_sql(limit="5")  # type: ignore[arg-type]
    with pytest.raises(ValueError):
        tq.claim_sql(lease_seconds=0)


def test_worker_id_is_never_interpolated():
    # A worker id must not be able to reach the SQL text.
    sql = tq.claim_sql(limit=1)
    assert "worker" not in sql.lower().replace("'processing'", "")


def test_complete_and_release_guard_on_owner():
    # Both statements scope by locked_by so one worker cannot touch another's row.
    assert "locked_by = $2" in tq.complete_sql()
    assert "locked_by = $2" in tq.release_sql()
    assert "status = 'done'" in tq.complete_sql()


def test_enqueue_is_idempotent():
    sql = tq.enqueue_sql()
    assert "on conflict (idem_key) do nothing" in sql.lower()


# ── task_queue: idempotency keys ──────────────────────────────────────────

def test_idempotency_key_is_deterministic():
    a = tq.idempotency_key("sync_order", 12345)
    b = tq.idempotency_key("sync_order", 12345)
    assert a == b, "same work must yield the same key on any worker"


def test_idempotency_key_differs_by_input():
    assert tq.idempotency_key("sync_order", 1) != tq.idempotency_key("sync_order", 2)
    assert tq.idempotency_key("sync_order", 1) != tq.idempotency_key("sync_user", 1)


def test_idempotency_key_length_and_alphabet():
    k = tq.idempotency_key("t", "x", length=16)
    assert len(k) == 16
    assert all(c in "0123456789abcdef" for c in k)


def test_idempotency_key_rejects_bad_input():
    with pytest.raises(ValueError):
        tq.idempotency_key("", 1)
    with pytest.raises(ValueError):
        tq.idempotency_key("t", None)
    with pytest.raises(ValueError):
        tq.idempotency_key("t", 1, length=4)


# ── task_queue: leases and worker planning ────────────────────────────────

def test_lease_expired_basic():
    now = dt.datetime(2026, 9, 10, 12, 0, 0, tzinfo=dt.timezone.utc)
    fresh = now - dt.timedelta(seconds=10)
    stale = now - dt.timedelta(seconds=3600)
    assert tq.lease_expired(fresh, now=now, lease_seconds=600) is False
    assert tq.lease_expired(stale, now=now, lease_seconds=600) is True
    assert tq.lease_expired(None, now=now) is True, "never-locked row is claimable"


def test_lease_expired_handles_naive_timestamps():
    now = dt.datetime(2026, 9, 10, 12, 0, 0, tzinfo=dt.timezone.utc)
    naive_stale = dt.datetime(2026, 9, 10, 10, 0, 0)  # assumed UTC
    assert tq.lease_expired(naive_stale, now=now, lease_seconds=600) is True


def test_plan_workers_caps_to_pool():
    assert tq.plan_workers(16, 10, connections_per_worker=2) == 5
    assert tq.plan_workers(3, 100, connections_per_worker=2) == 3
    assert tq.plan_workers(64, 2, connections_per_worker=2) == 1  # never zero


def test_plan_workers_rejects_bad_input():
    with pytest.raises(ValueError):
        tq.plan_workers(0, 10)
    with pytest.raises(ValueError):
        tq.plan_workers(1, 0)
    with pytest.raises(ValueError):
        tq.plan_workers(1, 10, connections_per_worker=0)


# ── schema_inventory: query builders ──────────────────────────────────────

def test_query_builders_are_parameterised():
    for builder in (si.tables_sql, si.columns_sql, si.indexes_sql,
                    si.foreign_keys_sql, si.rls_sql, si.policies_sql):
        sql, params = builder(("public",))
        assert "%s" in sql, f"{builder.__name__} must parameterise schema names"
        assert params == [["public"]]


def test_table_exists_sql_targets_public():
    sql, _ = si.table_exists_sql()
    assert "table_schema = 'public'" in sql


# ── schema_inventory: inventory + diff ────────────────────────────────────

def _inv(**kw):
    inv = dict(si.EMPTY_INVENTORY)
    inv.update(kw)
    return inv


def test_objects_present_and_missing():
    inv = _inv(tables=[("public", "orders"), ("public", "users"),
                       ("analytics", "events")])
    present = si.objects_present(inv)
    assert present == {"orders", "users", "analytics.events"}
    assert si.missing_objects(["orders", "invoices"], inv) == ["invoices"]
    assert si.already_exists(["orders", "invoices"], inv) == ["orders"]


def test_never_recreate_existing_table():
    # This is the guard for the suite's core rule.
    inv = _inv(tables=[("public", "orders")])
    assert si.already_exists(["orders"], inv) == ["orders"]
    assert "orders" not in si.missing_objects(["orders"], inv)


def test_rls_without_policies_flags_deny_all_tables():
    inv = _inv(
        rls=[("public", "orders", True), ("public", "users", True), ("public", "logs", False)],
        policies=[("public", "orders", "orders_select", "{authenticated}", "SELECT")],
    )
    # users has RLS on and no policy -> deny-all -> flagged
    assert si.rls_without_policies(inv) == ["users"]


def test_rls_without_policies_empty_when_all_policied():
    inv = _inv(rls=[("public", "orders", True)],
               policies=[("public", "orders", "p", "{a}", "SELECT")])
    assert si.rls_without_policies(inv) == []


def test_report_mentions_existing_and_missing():
    inv = _inv(tables=[("public", "orders")],
               rls=[("public", "orders", True)])
    text = si.report(inv, expected=["orders", "invoices"])
    assert "already exists" in text.lower()
    assert "invoices" in text
    assert "WARNING" in text  # rls on, no policy


def test_fetch_inventory_uses_cursor_for_every_section():
    class FakeCursor:
        def __init__(self):
            self.executed = []
        def __enter__(self):
            return self
        def __exit__(self, *a):
            return False
        def execute(self, sql, params):
            self.executed.append((sql, params))
        def fetchall(self):
            return []

    class FakeConn:
        def __init__(self):
            self.cur = FakeCursor()
        def cursor(self):
            return self.cur

    conn = FakeConn()
    inv = si.fetch_inventory(conn)
    # all six sections queried, and results normalised to lists
    assert len(conn.cur.executed) == 6
    assert set(inv) == {"tables", "columns", "indexes", "foreign_keys", "rls", "policies"}
    for v in inv.values():
        assert isinstance(v, list)
