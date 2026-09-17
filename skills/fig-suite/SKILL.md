---
id: fig-suite-v1.0.0
name: Fig Suite
version: 1.0.0
description: Operating standard for working inside the Fig platform — answer vs build, deliverable routing, gated external writes, cited research, and verified handoff
format: skill-md-v1
entrypoint: loader.py
policy: kernel/policy.yaml
tags: [fig, platform, workflow, connectors, deliverables, verification, safety, citations]
---

# Fig Suite

An operating standard for working inside the Fig platform, enforced by a gate
that actually runs. Six domains are defined once in `kernel/policy.yaml`; the
prose standard and the executable gate both read that file, so they cannot
drift apart.

## Layout

```text
fig-suite/
├── SKILL.md                 suite manifest + criterion table
├── manifest.json            machine-readable index (format: skill-md-v1)
├── loader.py                loader, policy reader, and the gate
├── kernel/
│   └── policy.yaml          SINGLE SOURCE OF TRUTH (v1.0.0)
├── metadata/
│   ├── index.json           sub-skill list
│   └── dependencies.txt
├── skills/                  six sub-skills, one per domain
│   ├── platform/            SKILL.md
│   ├── artifacts/
│   ├── connectors/
│   ├── research/
│   ├── automation/
│   └── safety/
├── examples/
│   ├── build_examples.py    regenerates both example projects
│   ├── clean-project/       passes all 9 criteria
│   └── broken-project/      fails 7 on purpose
└── tests/                   test suite
```

## Usage

```bash
python loader.py --list                     # the six sub-skills
python loader.py --policy                   # 9 criteria + whether a check exists
python loader.py --verify                   # suite is self-consistent
python loader.py --gate examples/clean-project
python loader.py --gate examples/broken-project --json
```

Exit code `0` = PASS (hand off) · `1` = FAIL (fix → re-run).

```python
from loader import load_suite, run_gate

suite = load_suite()                           # manifest + policy + sub-skills
report = run_gate("/path/to/project")          # {"passed": bool, "results": {...}, "findings": [...]}
```

## The nine criteria

| # | Criterion | Domain | Evidence file | Passes when |
|---|-----------|--------|---------------|-------------|
| 1 | `CONTEXT` | platform | `.fig/context.yaml` | `mission` is non-empty |
| 2 | `ROUTING` | artifacts | `.fig/routing.yaml` | `mode: answer`, or a build with a `type` |
| 3 | `EVIDENCE` | research | `.fig/evidence.json` | every claim has a source |
| 4 | `SECRETS` | safety | file scan | no credential pattern in tracked text |
| 5 | `APPROVAL` | connectors | `.fig/external-writes.yaml` | every write is `approved: true` |
| 6 | `VERIFY` | automation | `.fig/verify.json` | `verified: true` with checks that ran |
| 7 | `NAMING` | platform | file scan | no generic filenames |
| 8 | `SOURCES` | research | `.fig/evidence.json` | every `kind: web` claim has a `url` |
| 9 | `HANDOFF` | artifacts | `.fig/handoff.yaml` | card + follow-ups + notification |

`SECRETS` and `NAMING` run against the filesystem; the rest read the `.fig/`
files the work writes. A criterion declared in the policy with no registered
check is reported as an explicit failure, never a silent pass.

## Scope discipline

Each sub-skill acts only inside its own domain. A domain that finds a problem
outside its scope reports it and stops — it does not reach across and fix it.

## Sub-skills

| Sub-skill | Domain | Owns |
|-----------|--------|------|
| `fig-platform` | platform | mission declaration, file naming |
| `fig-artifacts` | artifacts | answer vs build, deliverable shape, handoff |
| `fig-connectors` | connectors | reads freely, writes with approval, voice |
| `fig-research` | research | evidence, inline citation, no renumbering |
| `fig-automation` | automation | verification before reporting success |
| `fig-safety` | safety | no credentials, confidentiality, refusals |
