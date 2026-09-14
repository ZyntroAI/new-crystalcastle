"""Fig Suite — test suite.

Run from the suite root:  python -m pytest tests/ -q
Pure pytest, no fixtures beyond the suite's own loader.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

HERE = Path(__file__).resolve().parent
SUITE = HERE.parent
sys.path.insert(0, str(SUITE))

import loader  # noqa: E402  (path set above)

CLEAN = SUITE / "examples" / "clean-project"
BROKEN = SUITE / "examples" / "broken-project"


@pytest.fixture(scope="session", autouse=True)
def _examples_built():
    """Regenerate the examples so the tests never run against stale fixtures."""
    subprocess.run([sys.executable, str(SUITE / "examples" / "build_examples.py")],
                   check=True, capture_output=True)
    yield


# --------------------------------------------------------------- policy

def test_policy_loads():
    policy = loader.load_policy()
    assert policy["version"] == "1.0.0"
    assert len(policy["criteria"]) == 9


def test_manifest_matches_policy():
    manifest = loader.load_manifest()
    policy = loader.load_policy()
    assert set(manifest["gate_criteria"]) == {c["id"] for c in policy["criteria"]}
    assert manifest["policy_version"] == policy["version"]


def test_every_criterion_has_a_check():
    policy = loader.load_policy()
    for criterion in policy["criteria"]:
        assert criterion["check"] in loader.CHECKS, criterion["id"]


def test_domains_reference_real_criteria():
    policy = loader.load_policy()
    ids = {c["id"] for c in policy["criteria"]}
    for domain in policy["domains"]:
        for cid in domain["criteria"]:
            assert cid in ids


def test_unimplemented_check_fails_loudly():
    """A criterion with no registered check must fail, never silently pass."""
    policy = {
        "criteria": [{"id": "GHOST", "name": "Ghost", "check": "does_not_exist"}],
    }
    report = loader.run_gate(CLEAN, policy)
    assert report["passed"] is False
    assert "no check implemented" in report["results"]["GHOST"]["detail"]


# --------------------------------------------------------------- skills

def test_six_sub_skills_loaded():
    skills = loader.load_skills()
    assert len(skills) == 6
    assert {s["id"] for s in skills} == {
        "fig-platform", "fig-artifacts", "fig-connectors",
        "fig-research", "fig-automation", "fig-safety",
    }


def test_every_sub_skill_declares_its_domain():
    for skill in loader.load_skills():
        assert skill.get("domain"), skill["id"]
        assert skill.get("gate"), skill["id"]
        assert skill.get("body", "").strip(), skill["id"]


def test_metadata_index_matches_disk():
    index = json.loads((SUITE / "metadata" / "index.json").read_text(encoding="utf-8"))
    indexed = {e["id"] for e in index["skills"]}
    on_disk = {s["id"] for s in loader.load_skills()}
    assert indexed == on_disk


def test_verify_suite_is_clean():
    ok, problems = loader.verify_suite()
    assert ok, problems


# --------------------------------------------------------------- gate: clean

def test_clean_project_passes():
    report = loader.run_gate(CLEAN)
    assert report["passed"], report["findings"]
    assert all(r["passed"] for r in report["results"].values())


@pytest.mark.parametrize("criterion", [
    "CONTEXT", "ROUTING", "EVIDENCE", "SECRETS", "APPROVAL",
    "VERIFY", "NAMING", "SOURCES", "HANDOFF",
])
def test_clean_project_each_criterion(criterion):
    report = loader.run_gate(CLEAN)
    assert report["results"][criterion]["passed"], report["results"][criterion]["detail"]


# --------------------------------------------------------------- gate: broken

def test_broken_project_fails():
    report = loader.run_gate(BROKEN)
    assert not report["passed"]


def test_broken_project_fails_exactly_seven():
    report = loader.run_gate(BROKEN)
    failed = {cid for cid, r in report["results"].items() if not r["passed"]}
    assert failed == {"CONTEXT", "ROUTING", "EVIDENCE", "SECRETS",
                      "APPROVAL", "VERIFY", "NAMING"}


def test_broken_project_findings_carry_a_fix():
    report = loader.run_gate(BROKEN)
    assert report["findings"]
    for finding in report["findings"]:
        assert finding["fix"], finding["criterion"]


# --------------------------------------------------------------- checks

def test_missing_external_writes_passes(tmp_path):
    """Absent external-writes.yaml means no writes — that passes."""
    passed, detail = loader.check_approval(tmp_path, {})
    assert passed
    assert "no external writes" in detail


def test_secrets_ignores_example_env(tmp_path):
    (tmp_path / ".env.example").write_text('API_KEY="sk-not-a-real-secret-000"\n')
    passed, _ = loader.check_secrets(tmp_path, {})
    assert passed


def test_secrets_catches_private_key(tmp_path):
    (tmp_path / "deploy.py").write_text("-----BEGIN RSA PRIVATE KEY-----\n")
    passed, detail = loader.check_secrets(tmp_path, {})
    assert not passed
    assert "deploy.py" in detail


def test_naming_flags_counter_outputs(tmp_path):
    (tmp_path / "report.xlsx").write_text("x")
    passed, detail = loader.check_naming(tmp_path, {})
    assert not passed
    assert "report.xlsx" in detail


def test_naming_allows_entity_keyed_outputs(tmp_path):
    (tmp_path / "customer_acme_report.xlsx").write_text("x")
    passed, _ = loader.check_naming(tmp_path, {})
    assert passed


def test_routing_answer_mode_needs_no_type(tmp_path):
    fig = tmp_path / ".fig"
    fig.mkdir()
    (fig / "routing.yaml").write_text("mode: answer\n")
    passed, detail = loader.check_routing(tmp_path, {})
    assert passed
    assert "answer" in detail


def test_verify_requires_checks_to_have_run(tmp_path):
    fig = tmp_path / ".fig"
    fig.mkdir()
    (fig / "verify.json").write_text('{"verified": true, "checks": []}')
    passed, detail = loader.check_verify(tmp_path, {})
    assert not passed
    assert "no checks" in detail


def test_sources_only_polices_web_claims(tmp_path):
    fig = tmp_path / ".fig"
    fig.mkdir()
    (fig / "evidence.json").write_text(json.dumps({"claims": [
        {"claim": "file-backed", "source": "x.md", "kind": "file"},
    ]}))
    passed, _ = loader.check_sources(tmp_path, {})
    assert passed


def test_sources_flags_uncited_web_claim(tmp_path):
    fig = tmp_path / ".fig"
    fig.mkdir()
    (fig / "evidence.json").write_text(json.dumps({"claims": [
        {"claim": "from the web", "source": "search", "kind": "web", "url": ""},
    ]}))
    passed, detail = loader.check_sources(tmp_path, {})
    assert not passed
    assert "url" in detail


# --------------------------------------------------------------- cli

def test_cli_list_exits_zero():
    result = subprocess.run([sys.executable, str(SUITE / "loader.py"), "--list"],
                            capture_output=True, text=True)
    assert result.returncode == 0
    assert "fig-platform" in result.stdout


def test_cli_gate_exit_codes():
    clean = subprocess.run([sys.executable, str(SUITE / "loader.py"), "--gate", str(CLEAN)],
                           capture_output=True, text=True)
    broken = subprocess.run([sys.executable, str(SUITE / "loader.py"), "--gate", str(BROKEN)],
                            capture_output=True, text=True)
    assert clean.returncode == 0
    assert broken.returncode == 1


def test_cli_verify_exits_zero():
    result = subprocess.run([sys.executable, str(SUITE / "loader.py"), "--verify"],
                            capture_output=True, text=True)
    assert result.returncode == 0
    assert "PASS" in result.stdout


def test_cli_json_output_is_parseable():
    result = subprocess.run([sys.executable, str(SUITE / "loader.py"), "--gate", str(BROKEN), "--json"],
                            capture_output=True, text=True)
    payload = json.loads(result.stdout)
    assert payload["passed"] is False
    assert payload["findings"]
