"""Tests for the Fig Best Practices Suite loader and gate.

Each test targets a rule the suite actually enforces — a checker that cannot
fail is not a gate.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))

from loader import (  # noqa: E402
    CHECKS,
    list_skills,
    load_policy,
    load_skill,
    load_suite,
    run_gate,
    verify_suite,
)

POLICY = load_policy()
CRITERIA = [c["id"] for c in POLICY["quality_gate"]["criteria"]]


# --------------------------------------------------------------- suite

def test_six_skills_on_disk():
    assert len(list_skills()) == 6


def test_manifest_counts_match_disk():
    manifest = json.loads((HERE / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["skill_count"] == len(list_skills())


def test_suite_verifies_clean():
    result = verify_suite()
    assert result["ok"], result["problems"]


def test_policy_declares_six_layers():
    assert [entry["id"] for entry in POLICY["layers"]] == [
        "01-structure", "02-design", "03-security",
        "04-performance", "05-team", "06-deployment",
    ]


def test_every_policy_criterion_has_an_implemented_check():
    missing = [c for c in CRITERIA if c not in CHECKS]
    assert missing == [], f"criteria with no checker: {missing}"


def test_every_layer_has_exactly_one_skill():
    covered = [load_skill(name)["meta"]["layer"] for name in list_skills()]
    assert len(covered) == len(set(covered)) == 6


def test_skill_frontmatter_is_complete():
    for name in list_skills():
        meta = load_skill(name)["meta"]
        for field in ("id", "name", "version", "layer", "gate"):
            assert meta.get(field), f"{name} missing {field}"


def test_unknown_skill_raises():
    with pytest.raises(FileNotFoundError):
        load_skill("does-not-exist")


def test_load_suite_shape():
    suite = load_suite()
    assert suite["manifest"]["skill_count"] == 6
    assert len(suite["skills"]) == 6
    assert suite["policy"]["version"] == POLICY["version"]


def test_security_skill_declares_veto():
    assert "veto" in load_skill("security")["body"].lower()


def test_reviewer_skill_documents_sha_pinning():
    body = load_skill("reviewer")["body"]
    assert "40-character commit SHA" in body


# --------------------------------------------------------------- fixtures

def _project(tmp_path: Path) -> Path:
    """A project that satisfies every criterion."""
    project = tmp_path / "proj"
    (project / "design").mkdir(parents=True)
    (project / ".fig").mkdir()
    (project / "tests").mkdir()
    (project / ".github" / "workflows").mkdir(parents=True)

    (project / "README.md").write_text("# p\n", encoding="utf-8")
    (project / "BEST-PRACTICES.md").write_text("# s\n", encoding="utf-8")
    (project / "design" / "design-tokens.json").write_text(
        json.dumps({
            "color": {"primary": "#2563eb", "text": "#0f172a", "background": "#ffffff", "surface": "#f8fafc"},
            "spacing": {"md": "16px"},
            "radius": {"md": "10px"},
            "typography": {"scale": {"base": "16px"}},
            "accessibility": {"minContrastRatio": 4.5},
        }),
        encoding="utf-8",
    )
    (project / "tests" / "test_ok.py").write_text("def test_ok():\n    assert True\n", encoding="utf-8")
    (project / ".fig" / "permissions.yaml").write_text(
        "roles:\n  admin: zyntro\nagents:\n  developer:\n    scope: \"01-structure\"\n", encoding="utf-8"
    )
    (project / ".fig" / "backup.json").write_text(
        json.dumps({"last_backup": "2026-09-12T00:00:00Z", "rollback_available": True}),
        encoding="utf-8",
    )
    (project / ".fig" / "deployment.yaml").write_text(
        "stage: production\napproval: zyntro\nproduction:\n"
        "  - https\n  - backup\n  - health_check\n  - monitoring\n  - alerting\n  - rollback_strategy\n",
        encoding="utf-8",
    )
    (project / ".github" / "workflows" / "ci.yml").write_text(
        "jobs:\n  build:\n    steps:\n"
        "      - uses: actions/checkout@08c6903cd8c0fde910a37f88322edcfb5dd907a8\n",
        encoding="utf-8",
    )
    (project / "requirements.txt").write_text("pyyaml>=6.0\n", encoding="utf-8")
    (project / "uv.lock").write_text("version = 1\n", encoding="utf-8")
    return project


# --------------------------------------------------------------- gate

def test_gate_passes_a_compliant_project(tmp_path):
    report = run_gate(_project(tmp_path))
    assert report["passed"], report["findings"]


def test_gate_reports_every_policy_criterion(tmp_path):
    report = run_gate(_project(tmp_path))
    assert list(report["results"]) == CRITERIA


def test_gate_fails_on_committed_secret(tmp_path):
    project = _project(tmp_path)
    (project / "leak.py").write_text('TOKEN = "ghp_' + "a" * 36 + '"\n', encoding="utf-8")
    report = run_gate(project)
    assert report["results"]["SECURITY"] == "FAIL"
    assert not report["passed"]


def test_gate_fails_on_fstring_sql(tmp_path):
    project = _project(tmp_path)
    # Assembled at runtime so this fixture does not itself trip the scanner.
    bad = "cursor.execute(" + 'f"SELECT * FROM users WHERE id = {user_id}"' + ")\n"
    (project / "db.py").write_text(bad, encoding="utf-8")
    report = run_gate(project)
    assert report["results"]["SQL_INJECTION"] == "FAIL"


def test_gate_passes_parameterised_sql(tmp_path):
    project = _project(tmp_path)
    (project / "db.py").write_text('cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))\n', encoding="utf-8")
    assert run_gate(project)["results"]["SQL_INJECTION"] == "PASS"


def test_gate_fails_on_unpinned_workflow_action(tmp_path):
    project = _project(tmp_path)
    (project / ".github" / "workflows" / "ci.yml").write_text(
        "jobs:\n  build:\n    steps:\n      - uses: actions/checkout@v4\n", encoding="utf-8"
    )
    report = run_gate(project)
    assert report["results"]["SHA_PINNING"] == "FAIL"
    assert any("40-char SHA" in f["detail"] for f in report["findings"])


def test_gate_fails_on_missing_lockfile(tmp_path):
    project = _project(tmp_path)
    (project / "uv.lock").unlink()
    assert run_gate(project)["results"]["DEPENDENCY_AUDIT"] == "FAIL"


def test_gate_fails_on_unpinned_package_json_range(tmp_path):
    project = _project(tmp_path)
    (project / "package.json").write_text(
        json.dumps({"dependencies": {"react": "^19.0.0"}}), encoding="utf-8"
    )
    assert run_gate(project)["results"]["DEPENDENCY_AUDIT"] == "FAIL"


def test_gate_fails_without_tokens(tmp_path):
    project = _project(tmp_path)
    (project / "design" / "design-tokens.json").unlink()
    assert run_gate(project)["results"]["DESIGN"] == "FAIL"


def test_gate_fails_on_low_contrast_pair(tmp_path):
    project = _project(tmp_path)
    (project / "design" / "design-tokens.json").write_text(
        json.dumps({
            "color": {"text": "#cccccc", "background": "#ffffff"},
            "spacing": {"md": "16px"}, "radius": {"md": "10px"},
            "typography": {"scale": {"base": "16px"}},
            "accessibility": {"minContrastRatio": 4.5},
        }),
        encoding="utf-8",
    )
    report = run_gate(project)
    assert report["results"]["DESIGN"] == "FAIL"
    assert any("contrast" in f["detail"] for f in report["findings"])


def test_gate_fails_on_hardcoded_colour(tmp_path):
    project = _project(tmp_path)
    (project / "src").mkdir()
    (project / "src" / "Card.tsx").write_text('export const C = "#ff00aa";\n', encoding="utf-8")
    report = run_gate(project)
    assert report["results"]["DESIGN"] == "FAIL"
    assert any("hard-coded colour" in f["detail"] for f in report["findings"])


def test_gate_fails_without_tests(tmp_path):
    project = _project(tmp_path)
    (project / "tests" / "test_ok.py").unlink()
    assert run_gate(project)["results"]["TESTING"] == "FAIL"


def test_gate_fails_on_undeclared_role(tmp_path):
    project = _project(tmp_path)
    (project / ".fig" / "permissions.yaml").write_text("roles:\n  superuser: x\n", encoding="utf-8")
    assert run_gate(project)["results"]["PERMISSIONS"] == "FAIL"


def test_gate_fails_on_unscoped_agent(tmp_path):
    project = _project(tmp_path)
    (project / ".fig" / "permissions.yaml").write_text("agents:\n  developer:\n    note: nope\n", encoding="utf-8")
    assert run_gate(project)["results"]["PERMISSIONS"] == "FAIL"


def test_gate_fails_without_backup(tmp_path):
    project = _project(tmp_path)
    (project / ".fig" / "backup.json").unlink()
    assert run_gate(project)["results"]["BACKUP"] == "FAIL"


def test_gate_fails_on_incomplete_production_requirements(tmp_path):
    project = _project(tmp_path)
    (project / ".fig" / "deployment.yaml").write_text(
        "stage: production\napproval: zyntro\nproduction:\n  - https\n", encoding="utf-8"
    )
    report = run_gate(project)
    assert report["results"]["DEPLOYMENT"] == "FAIL"
    assert "rollback_strategy" in " ".join(f["detail"] for f in report["findings"])


def test_gate_handles_missing_directory(tmp_path):
    report = run_gate(tmp_path / "nope")
    assert not report["passed"]
    assert all(status == "FAIL" for status in report["results"].values())


def test_gate_json_roundtrip(tmp_path):
    report = run_gate(_project(tmp_path))
    payload = json.loads(json.dumps(report))
    assert payload["passed"] is True
    assert payload["results"]["STRUCTURE"] == "PASS"
