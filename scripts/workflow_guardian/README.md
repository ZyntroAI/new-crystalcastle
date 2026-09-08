# Permission-aware Workflow Guardian

Self-contained Python port of the `workflow_security_guardian` concept:
pre-check token scopes → SHA-pin repair → validate → safe push → handoff /
admin escalation. Complies with the repo's strict "pin every action to a full
commit SHA" policy.

## Why
The GitHub App token (`fig-ai-agent`) lacks `workflows` permission, so any
change to `.github/workflows/` is refused. This tool makes that gate explicit
and turns a hard failure into a clean, resumable handoff instead of guessing.

## Flow
```
gate (scopes check .github/workflows/*)
  ├─ OK     -> repair (@vN -> full SHA) -> validate (YAML + no @vN) -> ready/push
  └─ BLOCKED-> save handoff (.fig/handoff/workflow.json) -> escalate request
```

## Usage (CLI)
```bash
export WORKFLOW_GUARDIAN_SCOPES="contents:write"   # what the token actually holds
python3 scripts/workflow_guardian/guardian.py \
  --files ".github/workflows/ci.yml" \
  --repo ZyntroAI/new-crystalcastle --branch main
# => status BLOCKED + handoff + escalate (token can't write workflows)

# after admin grants workflows:write
export WORKFLOW_GUARDIAN_SCOPES="contents:write,workflows:write"
python3 scripts/workflow_guardian/guardian.py --files ".github/workflows/ci.yml" --push
# => repair + validate + (dry-run push by default; add --push to actually push)
```

## Library API
```python
import guardian
guardian.gate([".github/workflows/x.yml"])          # {"status": "OK"|"BLOCKED", ...}
guardian.repair_sha([".github/workflows/x.yml"])    # pins @vN -> SHA
guardian.validate_sha([".github/workflows/x.yml"])  # {"valid": bool, "errors": []}
guardian.save_handoff(snapshot)                     # writes .fig/handoff/workflow.json
guardian.escalate(scope, repo, branch)              # admin request artifact
guardian.run_workflow(files, repo, branch)          # end-to-end
```

## Safety
- Never guesses a SHA for an action it doesn't have a mapping for (leaves it).
- Full-SHA refs (40 hex) are never mistaken for tags.
- Push defaults to `dry_run=True`; pass `--push` explicitly.
- Scopes are injected via env (`WORKFLOW_GUARDIAN_SCOPES`), never hardcoded.

## Tests
```bash
python3 -m pytest scripts/workflow_guardian/tests/ -q   # 10 passed
```
