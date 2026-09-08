# AST10 Security Gates (G2 + G3) — `scripts/sandbox/ast10/`

Static → Semantic → Isolated Runtime → Alert. Layered on top of the hardened
executor in `scripts/sandbox/sandbox.py`.

## Layout
```
scripts/sandbox/ast10/
├── g2.py               # G2 semantic intent verification (prompt + deterministic classifier)
├── g3.py               # G3 behavioral sandbox node (gatekeeping + runtime alert)
├── flow.py             # AST10 orchestration: G1 → G2 → G3
├── tests/test_ast10.py # 17 unit tests (docker mocked)
```

## Gates
| Gate | Purpose | Pass | Fail → |
|------|---------|------|--------|
| G1 static | scan for dangerous calls (subprocess/eval/etc.) | no critical hit | block + alert |
| G2 intent | semantic check — script on-task, no exfil/priv-esc/destructive | score ≥ 0.8 + in scope | block + alert |
| G3 runtime | isolated docker exec (network none, read-only, cap-drop) | exit 0 | alert + audit |

## Production notes
- **G2** ships a deterministic offline classifier AND a prompt template; pass
  `llm_invoke` (e.g. a Haiku caller) to `G2IntentVerifier` for the LLM path.
  Garbage LLM output falls back to the deterministic check.
- **G3** reuses `sandbox_execution_node` from `scripts/sandbox/sandbox.py` — the
  isolation guarantees stay in one place. `alert=` is injectable (default no-op)
  so tests / non-Slack deploys stay dependency-free; wire `send_slack_alert` in
  production.
- **G1** is a lightweight deterministic scan; swap `static_scan` for
  Bandit/Semgrep output in production.

## Run tests
```bash
python3 -m pytest scripts/sandbox/ast10/tests/ -q   # 17 passed
```

## Usage
```python
from ast10.flow import ast10_security_flow

out = ast10_security_flow({
    "script": "print('hello')",
    "task": {"name": "say hello", "desc": "print a greeting"},
    "permission_manifest": {"allow": []},
})
# {"status": "success", "stage": "G3", "g2": {...}, ...}
```
