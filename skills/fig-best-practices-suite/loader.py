#!/usr/bin/env python3
"""Fig Best Practices Suite — loader, policy reader, and quality gate.

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
SOURCE_SUFFIXES = {".py", ".js", ".ts", ".jsx", ".tsx", ".rb", ".go", ".java", ".php", ".sql"}


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


def _layer(policy: dict, layer_id: str) -> dict:
    return next((entry for entry in policy["layers"] if entry["id"] == layer_id), {})


# --------------------------------------------------------------- skills

def _parse_frontmatter(text: str) -> dict:
    """Minimal YAML frontmatter parser (scalars, lists, quoted strings)."""
    match = _FRONTMATTER.match(text)
    if not match:
        return {}
    meta: dict = {}
    for raw in match.group(1).splitlines():
        line = raw.rstrip()
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip()
        if value.startswith("[") and value.endswith("]"):
            items = [item.strip().strip("'\"") for item in value[1:-1].split(",")]
            meta[key] = [item for item in items if item]
        else:
            meta[key] = value.strip("'\"")
    return meta


def load_skill(name: str) -> dict:
    path = SKILLS_DIR / name / "SKILL.md"
    if not path.is_file():
        raise FileNotFoundError(f"unknown skill: {name}")
    text = path.read_text(encoding="utf-8")
    meta = _parse_frontmatter(text)
    return {
        "id": meta.get("id", name),
        "name": name,
        "path": str(path.relative_to(HERE)),
        "meta": meta,
        "body": _FRONTMATTER.sub("", text).strip(),
    }


def list_skills() -> list[str]:
    if not SKILLS_DIR.is_dir():
        return []
    return sorted(
        entry.name for entry in SKILLS_DIR.iterdir()
        if entry.is_dir() and (entry / "SKILL.md").is_file()
    )


def load_suite() -> dict:
    manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    return {
        "manifest": manifest,
        "skills": [load_skill(name) for name in list_skills()],
        "policy": load_policy(),
    }


def verify_suite() -> dict:
    """Check the suite is internally consistent: manifest vs disk vs policy."""
    problems: list[str] = []
    manifest = json.loads(MANIFEST_FILE.read_text(encoding="utf-8"))
    policy = load_policy()

    on_disk = list_skills()
    if len(on_disk) != manifest["skill_count"]:
        problems.append(f"manifest declares {manifest['skill_count']} skills, found {len(on_disk)} on disk")

    if manifest.get("policy_version") != policy["version"]:
        problems.append(f"manifest policy_version {manifest.get('policy_version')!r} != policy {policy['version']!r}")

    policy_layers = {entry["id"] for entry in policy["layers"]}
    if set(manifest.get("layers", [])) != policy_layers:
        problems.append(f"manifest layers != policy layers ({sorted(policy_layers)})")

    policy_gates = {c["id"] for c in policy["quality_gate"]["criteria"]}
    if set(manifest.get("gate_criteria", [])) != policy_gates:
        problems.append(f"manifest gate_criteria != policy criteria ({sorted(policy_gates)})")

    covered: set[str] = set()
    for name in on_disk:
        skill = load_skill(name)
        layer_id = skill["meta"].get("layer")
        if layer_id not in policy_layers:
            problems.append(f"{name}: layer {layer_id!r} not in policy")
        elif layer_id in covered:
            problems.append(f"{name}: layer {layer_id} already covered")
        else:
            covered.add(layer_id)
        for field in ("id", "name", "version", "layer", "gate"):
            if not skill["meta"].get(field):
                problems.append(f"{name}: missing frontmatter field {field}")

    missing = policy_layers - covered
    if missing:
        problems.append(f"policy layers with no skill: {sorted(missing)}")

    return {"ok": not problems, "problems": problems}


# --------------------------------------------------------------- checks

def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return ""


def _iter_source_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.suffix.lower() in BINARY_SUFFIXES:
            continue
        yield path


def _check_structure(root: Path, policy: dict) -> list[str]:
    problems = [
        f"missing required file: {name}"
        for name in _layer(policy, "01-structure").get("required_paths", [])
        if not (root / name).is_file()
    ]
    agent_dir = root / "agents"
    if agent_dir.is_dir():
        required = {"README.md", "developer.md", "designer.md", "security.md",
                    "performance.md", "reviewer.md", "deployment.md"}
        absent = sorted(n for n in required if not (agent_dir / n).is_file())
        if absent:
            problems.append(f"agents/ incomplete: missing {', '.join(absent)}")
    return problems


def _check_design(root: Path, policy: dict) -> list[str]:
    problems: list[str] = []
    token_file = root / "design" / "design-tokens.json"
    if not token_file.is_file():
        return ["missing design/design-tokens.json — tokens must be centralized"]

    try:
        tokens = json.loads(token_file.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"design-tokens.json is not valid JSON: {exc}"]

    for group in ("color", "spacing", "radius", "typography"):
        if group not in tokens:
            problems.append(f"missing token group: {group}")

    floor = tokens.get("accessibility", {}).get("minContrastRatio")
    if floor is None:
        problems.append("accessibility.minContrastRatio is required")

    colors = tokens.get("color", {})
    hex_only = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
    for name, value in colors.items():
        if not isinstance(value, str) or not hex_only.match(value):
            problems.append(f"color.{name} is not a hex value: {value!r}")

    if floor is not None:
        for fg, bg in (("text", "background"), ("text", "surface")):
            if fg in colors and bg in colors:
                try:
                    ratio = _contrast_ratio(colors[fg], colors[bg])
                except ValueError as exc:
                    problems.append(str(exc))
                    continue
                if ratio < float(floor):
                    problems.append(f"contrast {fg} on {bg} is {ratio:.2f}:1, below the {floor}:1 floor")

    if (root / "src").is_dir():
        declared = {v.lower() for v in colors.values() if isinstance(v, str)}
        for path in _iter_source_files(root / "src"):
            if path.suffix.lower() not in {".ts", ".tsx", ".js", ".jsx", ".css", ".html"}:
                continue
            stray = {m.lower() for m in re.findall(r"#[0-9a-fA-F]{6}\b", _read(path))}
            unlisted = stray - declared
            if unlisted:
                problems.append(
                    f"hard-coded colour(s) {', '.join(sorted(unlisted))} in {path.relative_to(root)}"
                )
    return problems


def _check_security(root: Path, policy: dict) -> list[str]:
    problems: list[str] = []
    patterns = _layer(policy, "03-security").get("forbidden_patterns", [])
    compiled = [(re.compile(entry["pattern"]), entry) for entry in patterns]

    for path in _iter_source_files(root):
        if path.name in SAFE_ENV_NAMES:
            continue
        text = _read(path)
        for number, line in enumerate(text.splitlines(), start=1):
            for regex, entry in compiled:
                if regex.search(line):
                    problems.append(
                        f"{path.relative_to(root)}:{number} — {entry.get('reason', 'forbidden pattern')}"
                    )
    if (root / ".env").is_file():
        problems.append(".env is present in the project tree and may be committed")
    return problems


def _check_sql_injection(root: Path, policy: dict) -> list[str]:
    """A query assembled by interpolation is injectable however trusted the source."""
    problems: list[str] = []
    entries = _layer(policy, "03-security").get("injection_patterns", [])
    if not entries:
        return ["no injection_patterns declared in the policy — nothing to check"]

    compiled = [(re.compile(entry["pattern"]), entry) for entry in entries]
    for path in _iter_source_files(root):
        if path.suffix.lower() not in SOURCE_SUFFIXES:
            continue
        for number, line in enumerate(_read(path).splitlines(), start=1):
            for regex, entry in compiled:
                if regex.search(line):
                    problems.append(
                        f"{path.relative_to(root)}:{number} — {entry.get('reason', entry['name'])}"
                    )
    return problems


def _check_dependency_audit(root: Path, policy: dict) -> list[str]:
    problems: list[str] = []
    spec = _layer(policy, "03-security").get("dependency_policy", {})
    manifests = [root / name for name in spec.get("manifest_files", []) if (root / name).is_file()]
    locks = [root / name for name in spec.get("lock_files", []) if (root / name).is_file()]

    if not manifests:
        return []

    if spec.get("require_lockfile") and not locks:
        problems.append(
            f"no lockfile present (expected one of: {', '.join(spec.get('lock_files', []))})"
        )

    if spec.get("require_pinned") and not spec.get("allow_ranges"):
        # A range specifier (^, ~, >=, *) makes every build a different build.
        rangey = re.compile(r"[:=@]\s*[\"']?[\^~><*]")
        for manifest in manifests:
            if manifest.name in {"requirements.txt"}:
                continue
            for number, line in enumerate(_read(manifest).splitlines(), start=1):
                if rangey.search(line):
                    problems.append(
                        f"{manifest.relative_to(root)}:{number} — unpinned dependency range"
                    )
            break
    return problems


def _check_performance(root: Path, policy: dict) -> list[str]:
    problems: list[str] = []
    budget = _layer(policy, "04-performance").get("budgets", {})
    modern = {f".{fmt}" for fmt in budget.get("image_formats", [])}
    max_kb = budget.get("max_uncompressed_image_kb")

    for path in root.rglob("*"):
        if not path.is_file() or any(part in SKIP_DIRS for part in path.parts):
            continue
        suffix = path.suffix.lower()
        if suffix not in {".png", ".jpg", ".jpeg", ".gif"}:
            continue
        rel = path.relative_to(root)
        if max_kb:
            size_kb = path.stat().st_size / 1024
            if size_kb > max_kb:
                problems.append(f"{rel} is {size_kb:.0f}KB, over the {max_kb}KB budget")
        if modern:
            problems.append(f"{rel} should be served as {', '.join(sorted(budget.get('image_formats', [])))}")
    return problems


def _check_testing(root: Path) -> list[str]:
    candidates = [p for p in root.rglob("test_*.py") if ".git" not in p.parts]
    candidates += [p for p in root.rglob("*_test.py") if ".git" not in p.parts]
    candidates += [p for p in root.rglob("*.test.ts*") if ".git" not in p.parts]
    candidates += [p for p in root.rglob("*.spec.ts*") if ".git" not in p.parts]
    return [] if candidates else ["no tests found (test_*.py, *_test.py, or *.test.ts[x])"]


def _check_permissions(root: Path, policy: dict) -> list[str]:
    problems: list[str] = []
    declared = {role["id"] for role in _layer(policy, "05-team").get("roles", [])}
    perms = root / ".fig" / "permissions.yaml"
    if not perms.is_file():
        return ["no role record (.fig/permissions.yaml) — roles must be assigned explicitly"]

    data = _load_yaml(perms) if perms.suffix in {".yaml", ".yml"} else {}
    for role in (data.get("roles") or {}):
        if role not in declared:
            problems.append(f"undeclared role: {role}")
    for name, scope in (data.get("agents") or {}).items():
        if not isinstance(scope, dict) or "scope" not in scope:
            problems.append(f"agent {name} has no declared scope — automation must be scoped")
    return problems


def _check_sha_pinning(root: Path, policy: dict) -> list[str]:
    """Org policy: every CI action ref must be a full 40-character commit SHA."""
    problems: list[str] = []
    spec = _layer(policy, "05-team").get("pinning_policy", {})
    if not spec.get("require_full_sha"):
        return []

    sha_length = spec.get("sha_length", 40)
    uses = re.compile(r"^\s*-?\s*uses:\s*([^\s#]+)")
    for pattern in spec.get("workflow_globs", []):
        for path in root.glob(pattern):
            for number, line in enumerate(_read(path).splitlines(), start=1):
                match = uses.match(line)
                if not match:
                    continue
                ref = match.group(1)
                if ref.startswith("./") or ref.startswith("docker://"):
                    continue
                _, _, version = ref.partition("@")
                if not version:
                    problems.append(f"{path.relative_to(root)}:{number} — {ref} has no ref")
                elif not re.fullmatch(rf"[0-9a-f]{{{sha_length}}}", version):
                    problems.append(
                        f"{path.relative_to(root)}:{number} — {ref} is not pinned to a {sha_length}-char SHA"
                    )
    return problems


def _check_backup(root: Path) -> list[str]:
    evidence = root / ".fig" / "backup.json"
    if not evidence.is_file():
        return ["no backup record (.fig/backup.json)"]
    problems: list[str] = []
    data = json.loads(_read(evidence)) if _read(evidence).strip() else {}
    if not data.get("last_backup"):
        problems.append("backup record has no last_backup timestamp")
    if not data.get("rollback_available"):
        problems.append("no rollback path recorded")
    return problems


def _check_deployment(root: Path, policy: dict) -> list[str]:
    evidence = root / ".fig" / "deployment.yaml"
    if not evidence.is_file():
        return ["no deployment record (.fig/deployment.yaml)"]

    required = _layer(policy, "06-deployment").get("production_requirements", [])
    data = _load_yaml(evidence)
    problems: list[str] = []
    declared = set(data.get("production") or [])
    missing = [item for item in required if item not in declared]
    if missing:
        problems.append(f"production requirements unmet: {', '.join(missing)}")
    if data.get("stage") not in (None, "monitoring", "production"):
        problems.append(f"project is at stage {data.get('stage')!r}, not production")
    if not data.get("approval"):
        problems.append("no approval recorded for this release")
    return problems


# Criterion id -> checker. A criterion in the policy with no entry here fails
# loudly instead of passing silently.
CHECKS = {
    "STRUCTURE": lambda root, policy: _check_structure(root, policy),
    "DESIGN": lambda root, policy: _check_design(root, policy),
    "SECURITY": lambda root, policy: _check_security(root, policy),
    "SQL_INJECTION": lambda root, policy: _check_sql_injection(root, policy),
    "DEPENDENCY_AUDIT": lambda root, policy: _check_dependency_audit(root, policy),
    "PERFORMANCE": lambda root, policy: _check_performance(root, policy),
    "TESTING": lambda root, policy: _check_testing(root),
    "PERMISSIONS": lambda root, policy: _check_permissions(root, policy),
    "SHA_PINNING": lambda root, policy: _check_sha_pinning(root, policy),
    "BACKUP": lambda root, policy: _check_backup(root),
    "DEPLOYMENT": lambda root, policy: _check_deployment(root, policy),
}


# --------------------------------------------------------------- gate

def run_gate(root: str | Path, policy_path: Path | None = None) -> dict:
    """Evaluate a project directory against every criterion in the policy."""
    root = Path(root).resolve()
    policy = load_policy(policy_path)
    criteria = [entry["id"] for entry in policy["quality_gate"]["criteria"]]

    results: dict[str, str] = {}
    findings: list[dict] = []

    def mark(criterion: str, problems: list[str], severity: str = "HIGH") -> None:
        results[criterion] = "FAIL" if problems else "PASS"
        for problem in problems:
            findings.append({"criterion": criterion, "detail": problem, "severity": severity})

    if not root.is_dir():
        for criterion in criteria:
            results[criterion] = "FAIL"
        findings.append(
            {"criterion": "STRUCTURE", "detail": f"not a directory: {root}", "severity": "CRITICAL"}
        )
        return {"root": str(root), "passed": False, "results": results, "findings": findings}

    for criterion in criteria:
        checker = CHECKS.get(criterion)
        if checker is None:
            mark(criterion, [f"no check implemented for criterion {criterion}"], severity="CRITICAL")
            continue
        problems = checker(root, policy)
        severity = "CRITICAL" if criterion in {"SECURITY", "SQL_INJECTION"} and problems else "HIGH"
        mark(criterion, problems, severity=severity)

    return {
        "root": str(root),
        "passed": all(status == "PASS" for status in results.values()),
        "results": results,
        "findings": findings,
    }


def _contrast_ratio(foreground: str, background: str) -> float:
    def luminance(value: str) -> float:
        body = value.lstrip("#")
        if len(body) == 3:
            body = "".join(ch * 2 for ch in body)
        channels = [int(body[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

    a, b = luminance(foreground), luminance(background)
    lighter, darker = max(a, b), min(a, b)
    return (lighter + 0.05) / (darker + 0.05)


def render(report: dict) -> str:
    lines = [f"Fig Best Practices gate — {report['root']}", ""]
    width = max((len(name) for name in report["results"]), default=8)
    for name, status in report["results"].items():
        lines.append(f"  {name.ljust(width)} = {status}")
    if report["findings"]:
        lines.append("")
        lines.append("Findings:")
        for item in report["findings"]:
            lines.append(f"  - [{item['severity']}] {item['criterion']}: {item['detail']}")
    lines.append("")
    lines.append("RESULT: PASS — ready to deploy" if report["passed"] else "RESULT: FAIL — route to auto-fix")
    return "\n".join(lines)


# --------------------------------------------------------------- cli

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="loader", description="Fig Best Practices Suite")
    parser.add_argument("--list", action="store_true", help="list the sub-skills")
    parser.add_argument("--policy", action="store_true", help="print the gate criteria")
    parser.add_argument("--verify", action="store_true", help="check the suite is self-consistent")
    parser.add_argument("--gate", metavar="ROOT", help="run the gate on a project directory")
    parser.add_argument("--json", action="store_true", help="emit JSON")
    args = parser.parse_args(argv)

    if args.list:
        rows = [
            {"id": s["id"], "name": s["name"], "layer": s["meta"].get("layer"), "gate": s["meta"].get("gate")}
            for s in load_suite()["skills"]
        ]
        if args.json:
            print(json.dumps(rows, indent=2))
        else:
            for row in rows:
                print(f"{row['name'].ljust(12)} {str(row['layer']).ljust(15)} {row['gate']}")
        return 0

    if args.policy:
        for criterion in load_policy()["quality_gate"]["criteria"]:
            implemented = "check" if criterion["id"] in CHECKS else "MISSING"
            print(f"{criterion['id'].ljust(18)} <- {criterion['layer']:<15} [{implemented}]")
        return 0

    if args.verify:
        result = verify_suite()
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print("suite OK" if result["ok"] else "\n".join(result["problems"]))
        return 0 if result["ok"] else 1

    if args.gate:
        report = run_gate(args.gate)
        print(json.dumps(report, indent=2) if args.json else render(report))
        return 0 if report["passed"] else 1

    parser.print_help()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
