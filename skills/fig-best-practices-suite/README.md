# Fig Best Practices Suite

Six-layer production standard for Fig / hellofig.ai projects, enforced by a
quality gate that actually runs. The layers are defined once in
`kernel/policy.yaml`; the prose standard and the executable gate both derive
from that file, so they cannot drift apart.

## Layout

```text
figbp-suite/
├── SKILL.md                 suite manifest + criterion table
├── manifest.json            machine-readable index (format: skill-md-v1)
├── loader.py                loader, policy reader, and the gate
├── kernel/
│   └── policy.yaml          SINGLE SOURCE OF TRUTH (v1.2.0)
├── skills/                  six sub-skills, one per layer
│   ├── developer/           SKILL.md
│   ├── designer/
│   ├── security/
│   ├── performance/
│   ├── reviewer/
│   └── deployment/
├── examples/
│   ├── build_examples.py    regenerates both example projects
│   ├── clean-project/       passes all 11 criteria
│   └── broken-project/      fails 7 on purpose
└── tests/                   29 tests
```

## Usage

```bash
python loader.py --list                     # the six sub-skills
python loader.py --policy                   # 11 criteria + whether a check exists
python loader.py --verify                   # suite is self-consistent
python loader.py --gate examples/clean-project
python loader.py --gate examples/broken-project --json
```

Exit code `0` = PASS (deploy) · `1` = FAIL (auto-fix → test → review).

```python
from loader import load_suite, run_gate

suite = load_suite()                          # manifest + skills + policy
report = run_gate("/path/to/project")         # {"passed": bool, "results": {...}, "findings": [...]}
```

## The eleven criteria

| Criterion | Layer | Fails when |
|-----------|-------|-----------|
| STRUCTURE | 01 | a required file is missing, `agents/` incomplete |
| DESIGN | 02 | no token file, invalid hex, contrast below floor, hard-coded colour in `src/` |
| SECURITY | 03 | AWS key / `sk-` / `ghp_` / private key / credential assignment; `.env` committed |
| SQL_INJECTION | 03 | SQL built by f-string, `.format()`, `%`, or concatenation |
| DEPENDENCY_AUDIT | 03 | no lockfile, or unpinned ranges in a manifest |
| PERFORMANCE | 04 | raster images over budget or in a non-modern format |
| TESTING | 05 | no test files |
| PERMISSIONS | 05 | undeclared role, or an agent with no scope |
| SHA_PINNING | 05 | a workflow `uses:` ref that is not a full 40-char SHA |
| BACKUP | 06 | no backup record or no rollback path |
| DEPLOYMENT | 06 | production requirements unmet, no approval recorded |

The gate reads this list from the policy, not from hard-coded code. Add a
criterion to the policy without implementing a check and it fails loudly as
`no check implemented` rather than passing silently.

## Verified

```text
tests                          29 passed
examples/clean-project         11/11 PASS   (exit 0)
examples/broken-project         7 FAIL      (exit 1)
```

The broken project fails DESIGN, SECURITY, SQL_INJECTION, DEPENDENCY_AUDIT,
TESTING, SHA_PINNING, and BACKUP — each finding names the file and line.

## Design notes

**One source of truth.** `kernel/policy.yaml` drives both the documentation and
the checker. The `--verify` command asserts the manifest, the on-disk skills,
and the policy agree on the layer list, the criterion list, and the version.

**Fail-closed, not fail-silent.** An unimplemented criterion is a CRITICAL
failure. A gate that passes what it cannot check is worse than no gate.

**Read-only.** `--gate` inspects; it never modifies the target. No credential is
read, printed, or stored — the scanner reports a location, never a value.

**No network, no dependencies.** Pure standard library; PyYAML is optional with
a JSON fallback.

## Requirements

Python 3.10+. `pyyaml>=6.0` is recommended; without it the loader falls back to
JSON parsing of the policy file.
