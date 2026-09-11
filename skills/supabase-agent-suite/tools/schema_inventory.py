"""Live Supabase schema inventory for the Supabase Agent Skill Suite.

Answers the question every agent must answer first: **which tables already exist?**
Runs the information_schema / pg_catalog queries from the `schema-inventory`
sub-skill and diffs the live database against an expected object list, so
concurrent agents converge instead of colliding.

The query builders are pure and unit-tested without a database. Only
``fetch_inventory`` needs a driver (psycopg, optional import).
"""
from __future__ import annotations

from typing import Any, Iterable

# ---- pure query builders -------------------------------------------------

TABLES_SQL = """\
select table_schema, table_name
from information_schema.tables
where table_schema = any(%s)
  and table_type = 'BASE TABLE'
order by table_schema, table_name;
"""

COLUMNS_SQL = """\
select table_schema, table_name, ordinal_position,
       column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = any(%s)
order by table_schema, table_name, ordinal_position;
"""

INDEXES_SQL = """\
select schemaname as table_schema, tablename as table_name,
       indexname as index_name, indexdef as definition
from pg_indexes
where schemaname = any(%s)
order by tablename, indexname;
"""

FOREIGN_KEYS_SQL = """\
select tc.table_schema, tc.table_name, tc.constraint_name,
       kcu.column_name,
       ccu.table_schema as foreign_table_schema,
       ccu.table_name   as foreign_table_name,
       ccu.column_name  as foreign_column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on kcu.constraint_name = tc.constraint_name
 and kcu.table_schema = tc.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = any(%s)
order by tc.table_name, tc.constraint_name;
"""

RLS_SQL = """\
select n.nspname as table_schema, c.relname as table_name,
       c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = any(%s) and c.relkind = 'r'
order by c.relname;
"""

POLICIES_SQL = """\
select schemaname as table_schema, tablename as table_name,
       policyname, roles, cmd
from pg_policies
where schemaname = any(%s)
order by tablename, policyname;
"""


def tables_sql(schemas: Iterable[str] = ("public",)) -> tuple[str, list]:
    """Parameterised table-list query. Returns ``(sql, params)``."""
    return TABLES_SQL, [list(schemas)]


def columns_sql(schemas: Iterable[str] = ("public",)) -> tuple[str, list]:
    return COLUMNS_SQL, [list(schemas)]


def indexes_sql(schemas: Iterable[str] = ("public",)) -> tuple[str, list]:
    return INDEXES_SQL, [list(schemas)]


def foreign_keys_sql(schemas: Iterable[str] = ("public",)) -> tuple[str, list]:
    return FOREIGN_KEYS_SQL, [list(schemas)]


def rls_sql(schemas: Iterable[str] = ("public",)) -> tuple[str, list]:
    return RLS_SQL, [list(schemas)]


def policies_sql(schemas: Iterable[str] = ("public",)) -> tuple[str, list]:
    return POLICIES_SQL, [list(schemas)]


def table_exists_sql() -> tuple[str, str]:
    """SQL to check one table, plus the single ``%s`` placeholder for its name."""
    return (
        "select exists (select 1 from information_schema.tables "
        "where table_schema = 'public' and table_name = %s) as table_exists;",
        "%s",
    )


def qualified(table_schema: str, table_name: str) -> str:
    """``public.orders`` — quoted so odd identifiers are safe in output."""
    return f'{table_schema}.{table_name}'


# ---- inventory + diff ---------------------------------------------------

EMPTY_INVENTORY: dict[str, Any] = {
    "tables": [],
    "columns": [],
    "indexes": [],
    "foreign_keys": [],
    "rls": [],
    "policies": [],
}


def _rows(cur) -> list[tuple]:
    return [tuple(r) for r in (cur.fetchall() or [])]


def fetch_inventory(conn, schemas: Iterable[str] = ("public",)) -> dict[str, Any]:
    """Read the live schema. ``conn`` is any DBAPI connection with a cursor.

    Returns a dict shaped like :data:`EMPTY_INVENTORY`. Keys are normalised to
    lowercase so callers do not depend on driver casing.
    """
    schemas = list(schemas)
    out: dict[str, Any] = {
        "tables": [], "columns": [], "indexes": [],
        "foreign_keys": [], "rls": [], "policies": [],
    }
    with conn.cursor() as cur:
        for key, builder in (
            ("tables", tables_sql),
            ("columns", columns_sql),
            ("indexes", indexes_sql),
            ("foreign_keys", foreign_keys_sql),
            ("rls", rls_sql),
            ("policies", policies_sql),
        ):
            sql, params = builder(schemas)
            cur.execute(sql, params)
            out[key] = _rows(cur)
    return out


def objects_present(inventory: dict[str, Any]) -> set[str]:
    """The set of table names present, as ``schema.table`` when schema != public."""
    present = set()
    for row in inventory.get("tables", []):
        schema, name = row[0], row[1]
        present.add(name if schema == "public" else qualified(schema, name))
    return present


def missing_objects(expected: Iterable[str], inventory: dict[str, Any]) -> list[str]:
    """Objects the task expects that do **not** exist yet — safe to create."""
    return sorted(set(expected) - objects_present(inventory))


def already_exists(expected: Iterable[str], inventory: dict[str, Any]) -> list[str]:
    """Objects that already exist — **must not** be recreated; reuse them.

    This is the guard behind the suite's non-negotiable rule: never recreate an
    existing table.
    """
    return sorted(set(expected) & objects_present(inventory))


def rls_without_policies(inventory: dict[str, Any]) -> list[str]:
    """Tables with RLS enabled but zero policies — deny-all, usually a bug.

    A table with RLS on and no policy rejects every row for non-owner roles, so
    this is surfaced rather than silently ignored.
    """
    enabled = set()
    for row in inventory.get("rls", []):
        # (table_schema, table_name, rls_enabled)
        if len(row) >= 3 and row[2]:
            enabled.add(row[1])
    policied = set()
    for row in inventory.get("policies", []):
        policied.add(row[1])
    return sorted(enabled - policied)


def report(inventory: dict[str, Any], expected: Iterable[str] = ()) -> str:
    """Human-readable summary, in the order the sub-skill requires."""
    lines = ["Schema inventory"]
    lines.append(f"  tables: {len(inventory.get('tables', []))}")
    for row in inventory.get("tables", []):
        schema, name = row[0], row[1]
        lines.append(f"    - {name if schema == 'public' else qualified(schema, name)}")
    lines.append(f"  columns: {len(inventory.get('columns', []))}")
    lines.append(f"  indexes: {len(inventory.get('indexes', []))}")
    lines.append(f"  foreign keys: {len(inventory.get('foreign_keys', []))}")
    lines.append(f"  policies: {len(inventory.get('policies', []))}")

    unsafe = rls_without_policies(inventory)
    if unsafe:
        lines.append(f"  WARNING rls enabled with no policies (deny-all): {unsafe}")

    expected = list(expected)
    if expected:
        exists = already_exists(expected, inventory)
        missing = missing_objects(expected, inventory)
        lines.append(f"  already exists (reuse, do not recreate): {exists or 'none'}")
        lines.append(f"  missing (may create): {missing or 'none'}")
    return "\n".join(lines)


if __name__ == "__main__":  # pragma: no cover - needs a live database
    import os
    import sys

    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        print("Set DATABASE_URL to run the live inventory.", file=sys.stderr)
        raise SystemExit(2)
    try:
        import psycopg  # type: ignore
    except ImportError:
        print("psycopg not installed: pip install 'psycopg[binary]'", file=sys.stderr)
        raise SystemExit(2)
    with psycopg.connect(dsn) as conn:
        print(report(fetch_inventory(conn), expected=sys.argv[1:]))
