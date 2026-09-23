#!/usr/bin/env python3
"""Fig Suite — loader, policy reader, and quality gate.

Pure standard library. PyYAML is used when present; a JSON fallback covers the
policy file otherwise, so the loader never hard-fails on a bare interpreter.

The gate evaluates every criterion declared in kernel/policy.yaml — it reads
that list, it does not hard-code it. Adding a criterion to the policy without
adding a check here surfaces as an explicit "no check implemented" failure
rather than a silent pass.

Usage:
    python loader.py --list
    python loader.py --policy
    python loader.py --verify
    python loader.py --gate /path/to/project [--json]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILLS_DIR = HERE / "skills"
POLICY_FILE = HERE / "kernel" / "policy.yaml"
MANIFEST_FILE = HERE / "manifest.json"

_FRONTMATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)
SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", ".pytest_cache", "dist", "build"}
BINARY_SUFFIXES = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".pdf", ".zip", ".gz", ".woff", ".woff2", ".ttf"}
SAFE_ENV_NAMES = {".env.example", ".env.sample", ".env.template"}
SOURCE_SUFFIXES = {".py", ".js", ".ts", ".jsx", ".tsx", ".rb", ".go", ".java", ".php", ".sql", ".sh", ".yaml", ".yml", ".json", ".toml", ".md"}
GENERIC_NAMES = {"output", "result", "file", "data", "doc", "document", "report", "chart", "temp", "tmp", "analysis", "test", "final", "new"}


# --------------------------------------------------------------- policy

def _load_yaml(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    try:
        import yaml  # type: ignore

        data = yaml.safe_load(text)
    except ImportError:  # pragma: no cover - fallback path
        data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError(f"{path.name} did not parse to a mapping")
    return data


def load_policy(path: Path | None = None) -> dict:
    """Read the canonical policy — the single source of truth for the suite."""
    return _load_yaml(path or POLICY_FILE)


def load_manifest(path: Path | None = None) -> dict:
    return json.loads((path or MANIFEST_FILE).read_text(encoding="utf-8"))


def _domain(policy: dict, domain_id: str) -> dict:
    return next((entry for entry in policy["domains"] if entry["id"] == domain_id), {})


def _criterion(policy: dict, criterion_id: str) -> dict:
    return next((entry for entry in policy["criteria"] if entry["id"] == criterion_id), {})


# --------------------------------------------------------------- skills

def _parse_frontmatter(text: str) -> dict:
    """Minimal YAML frontmatter parser (scalars, inline lists)."""
    match = _FRONTMATTER.match(text)
    if not match:
        return {}
    meta: dict = {}
    for line in match.group(1).splitlines():
        line = line.rstrip()
        if not line or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip()
        if value.startswith("[") and value.endswith("]"):
            items = [item.strip().strip("'\"") for item in value[1:-1].split(",")]
            meta[key] = [item for item in items if item]
        else:
            meta[key] = value.strip("'\"")
    return meta


def load_skills() -> list[dict]:
    """Load every sub-skill: frontmatter plus the SKILL.md body."""
    skills: list[dict] = []
    if not SKILLS_DIR.is_dir():
        return skills
    for entry in sorted(SKILLS_DIR.iterdir()):
        skill_file = entry / "SKILL.md"
        if not skill_file.is_file():
            continue
        text = skill_file.read_text(encoding="utf-8")
        meta = _parse_frontmatter(text)
        body = _FRONTMATTER.sub("", text, count=1).strip()
        meta.setdefault("id", entry.name)
        meta["path"] = f"skills/{entry.name}"
        meta["body"] = body
        skills.append(meta)
    return skills


def load_suite() -> dict:
    """Everything a consumer needs: manifest, policy, and the sub-skills."""
    return {"manifest": load_manifest(), "policy": load_policy(), "skills": load_skills()}


# --------------------------------------------------------------- checks

def _read_yaml_if_exists(path: Path) -> dict | None:
    if not path.is_file():
        return None
    try:
        return _load_yaml(path)
    except Exception:
        return {}


def _iter_text_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix.lower() in BINARY_SUFFIXES:
            continue
        yield path


def check_context(project: Path, policy: dict) -> tuple[bool, str]:
    data = _read_yaml_if_exists(project / ".fig" / "context.yaml")
    if data is None:
        return False, "no .fig/context.yaml — mission not declared"
    mission = str(data.get("mission", "")).strip()
    if not mission:
        return False, "mission is empty"
    return True, f"mission declared ({len(mission)} chars)"


def check_routing(project: Path, policy: dict) -> tuple[bool, str]:
    data = _read_yaml_if_exists(project / ".fig" / "routing.yaml")
    if data is None:
        return False, "no .fig/routing.yaml — deliverable shape not chosen"
    mode = str(data.get("mode", "")).strip().lower()
    if mode == "answer":
        return True, "mode=answer (question, not a build)"
    if not mode:
        return False, "mode is empty"
    if not str(data.get("type", "")).strip():
        return False, f"mode={mode} but no type given"
    return True, f"mode={mode}, type={data.get('type')}"


def check_evidence(project: Path, policy: dict) -> tuple[bool, str]:
    path = project / ".fig" / "evidence.json"
    if not path.is_file():
        return False, "no .fig/evidence.json — claims unbacked"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return False, f"evidence.json unreadable: {exc}"
    claims = data.get("claims", data if isinstance(data, list) else [])
    if not isinstance(claims, list) or not claims:
        return False, "no claims recorded"
    missing = [c for c in claims if not str(c.get("source", "")).strip()]
    if missing:
        return False, f"{len(missing)} claim(s) without a source"
    return True, f"{len(claims)} claim(s) tied to a source"


def check_secrets(project: Path, policy: dict) -> tuple[bool, str]:
    patterns = [
        re.compile(r"AKIA[0-9A-Z]{16}"),                              # AWS access key
        re.compile(r"sk-[A-Za-z0-9]{20,}"),                           # provider secret key
        re.compile(r"ghp_[A-Za-z0-9]{20,}"),                          # GitHub PAT
        re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
        re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
        re.compile(r"(?i)\b(?:api[_-]?key|secret|password|passwd|token)\b\s*[:=]\s*['\"][^'\"]{12,}['\"]"),
    ]
    hits: list[str] = []
    for path in _iter_text_files(project):
        if path.name in SAFE_ENV_NAMES:
            continue
        if path.suffix.lower() not in SOURCE_SUFFIXES and path.suffix:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for pattern in patterns:
            if pattern.search(text):
                hits.append(str(path.relative_to(project)))
                break
    if hits:
        return False, f"possible credential in: {', '.join(sorted(set(hits)))}"
    return True, "no credential patterns found"


def check_approval(project: Path, policy: dict) -> tuple[bool, str]:
    data = _read_yaml_if_exists(project / ".fig" / "external-writes.yaml")
    if data is None:
        return True, "no external writes declared"
    writes = data.get("writes", [])
    if not isinstance(writes, list):
        return False, "writes must be a list"
    unapproved = [w for w in writes if not bool(w.get("approved"))]
    if unapproved:
        targets = ", ".join(str(w.get("target", "?")) for w in unapproved)
        return False, f"{len(unapproved)} unapproved write(s): {targets}"
    return True, f"{len(writes)} external write(s), all approved"


def check_verify(project: Path, policy: dict) -> tuple[bool, str]:
    path = project / ".fig" / "verify.json"
    if not path.is_file():
        return False, "no .fig/verify.json — output unverified"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return False, f"verify.json unreadable: {exc}"
    if not data.get("verified"):
        return False, "verified is not true"
    checks = data.get("checks", [])
    if not isinstance(checks, list) or not checks:
        return False, "no checks recorded (verification must actually run)"
    return True, f"{len(checks)} check(s) ran"


def check_naming(project: Path, policy: dict) -> tuple[bool, str]:
    offenders: list[str] = []
    for path in project.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name.startswith((".", "_")):
            continue
        if path.stem.lower() in GENERIC_NAMES:
            offenders.append(str(path.relative_to(project)))
    if offenders:
        return False, f"generic filename(s): {', '.join(sorted(offenders))}"
    return True, "all filenames semantic"


def check_sources(project: Path, policy: dict) -> tuple[bool, str]:
    path = project / ".fig" / "evidence.json"
    if not path.is_file():
        return False, "no .fig/evidence.json — no claim table to cite"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        return False, f"evidence.json unreadable: {exc}"
    claims = data.get("claims", data if isinstance(data, list) else [])
    if not isinstance(claims, list):
        return False, "claims must be a list"
    web = [c for c in claims if str(c.get("kind", "")).strip().lower() == "web"]
    missing = [c for c in web if not str(c.get("url", "")).strip()]
    if missing:
        return False, f"{len(missing)} web claim(s) without a url"
    return True, f"{len(web)} web claim(s) cited"


def check_handoff(project: Path, policy: dict) -> tuple[bool, str]:
    data = _read_yaml_if_exists(project / ".fig" / "handoff.yaml")
    if data is None:
        return False, "no .fig/handoff.yaml — handoff not declared"
    problems = []
    if not data.get("card"):
        problems.append("no rendered card")
    follow_ups = data.get("follow_ups", [])
    if not isinstance(follow_ups, list) or not follow_ups:
        problems.append("no follow-up suggestions")
    if not data.get("notify"):
        problems.append("no completion notification")
    if problems:
        return False, "; ".join(problems)
    return True, "card, follow-ups, and notification all present"


CHECKS = {
    "context": check_context,
    "routing": check_routing,
    "evidence": check_evidence,
    "secrets": check_secrets,
    "approval": check_approval,
    "verify": check_verify,
    "naming": check_naming,
    "sources": check_sources,
    "handoff": check_handoff,
}


# --------------------------------------------------------------- gate

def run_gate(project: str | Path, policy: dict | None = None) -> dict:
    """Evaluate every criterion in the policy against a project directory.

    Returns {"passed": bool, "results": {criterion: {passed, detail}}, "findings": [...]}.
    """
    project = Path(project).resolve()
    policy = policy or load_policy()
    results: dict[str, dict] = {}
    findings: list[dict] = []

    for criterion in policy["criteria"]:
        cid = criterion["id"]
        fn = CHECKS.get(criterion.get("check", ""))
        if fn is None:
            results[cid] = {"passed": False, "detail": f"no check implemented for {cid}"}
        else:
            passed, detail = fn(project, policy)
            results[cid] = {"passed": passed, "detail": detail}
        if not results[cid]["passed"]:
            findings.append({
                "criterion": cid,
                "name": criterion["name"],
                "domain": criterion.get("domain"),
                "detail": results[cid]["detail"],
                "fix": criterion.get("fail"),
            })

    passed = not findings
    return {"passed": passed, "results": results, "findings": findings}


# --------------------------------------------------------------- verify

def verify_suite() -> tuple[bool, list[str]]:
    """Suite is self-consistent: manifest agrees with policy and the files on disk."""
    problems: list[str] = []
    manifest = load_manifest()
    policy = load_policy()

    manifest_criteria = set(manifest.get("gate_criteria", []))
    policy_criteria = {c["id"] for c in policy["criteria"]}
    if manifest_criteria != policy_criteria:
        problems.append(
            f"manifest gate_criteria != policy criteria "
            f"(only in manifest: {sorted(manifest_criteria - policy_criteria)}; "
            f"only in policy: {sorted(policy_criteria - manifest_criteria)})"
        )

    if manifest.get("policy_version") != policy.get("version"):
        problems.append("manifest.policy_version != policy.version")

    for criterion in policy["criteria"]:
        if criterion.get("check") not in CHECKS:
            problems.append(f"criterion {criterion['id']} has no check registered")

    for domain in policy["domains"]:
        for cid in domain.get("criteria", []):
            if cid not in policy_criteria:
                problems.append(f"domain {domain['id']} references unknown criterion {cid}")

    skills = load_skills()
    if len(skills) != manifest.get("skill_count"):
        problems.append(f"skill_count={manifest.get('skill_count')} but {len(skills)} SKILL.md found")

    index_file = HERE / "metadata" / "index.json"
    index = json.loads(index_file.read_text(encoding="utf-8"))
    indexed = {entry["id"] for entry in index.get("skills", [])}
    on_disk = {s["id"] for s in skills}
    if indexed != on_disk:
        problems.append(f"metadata/index.json != skills on disk (missing: {sorted(on_disk - indexed)}; stale: {sorted(indexed - on_disk)})")

    declared = {d["id"] for d in policy["domains"]}
    if not declared.issubset({s.get("domain") for s in skills} | set()):
        missing = declared - {s.get("domain") for s in skills}
        problems.append(f"no sub-skill owns domain(s): {sorted(missing)}")

    return (not problems), problems


# --------------------------------------------------------------- cli

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Fig Suite loader and quality gate")
    parser.add_argument("--list", action="store_true", help="list the sub-skills")
    parser.add_argument("--policy", action="store_true", help="print the criteria table")
    parser.add_argument("--verify", action="store_true", help="check the suite is self-consistent")
    parser.add_argument("--gate", metavar="PROJECT", help="run the gate against a project")
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    args = parser.parse_args(argv)

    if args.list:
        skills = load_skills()
        if args.json:
            print(json.dumps([{k: v for k, v in s.items() if k != "body"} for s in skills], indent=2))
        else:
            for s in skills:
                print(f"{s['id']:<18} {s.get('name', ''):<28} {s.get('gate', '')}")
        return 0

    if args.policy:
        policy = load_policy()
        if args.json:
            print(json.dumps(policy, indent=2))
        else:
            print(f"policy v{policy['version']} — {len(policy['criteria'])} criteria")
            for c in policy["criteria"]:
                mark = "check" if c.get("check") in CHECKS else "MISSING"
                print(f"  {c['id']:<12} {c['name']:<32} [{mark}]")
        return 0

    if args.verify:
        ok, problems = verify_suite()
        if args.json:
            print(json.dumps({"passed": ok, "problems": problems}, indent=2))
        else:
            print("PASS — suite is self-consistent" if ok else "FAIL")
            for p in problems:
                print(f"  - {p}")
        return 0 if ok else 1

    if args.gate:
        policy = load_policy()
        report = run_gate(args.gate, policy)
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            for cid, result in report["results"].items():
                print(f"  {'PASS' if result['passed'] else 'FAIL'}  {cid:<12} {result['detail']}")
            print()
            print("PASS (deploy)" if report["passed"] else f"FAIL — {len(report['findings'])} finding(s), fix and re-run")
        return 0 if report["passed"] else 1

    parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
