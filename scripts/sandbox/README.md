# Secure Python Sandbox (`scripts/sandbox/`)

Self-contained hardened Docker sandbox for running untrusted Python snippets.
Placed under `scripts/` so it does not couple to the Node/React app tree.

## Layout
```
scripts/sandbox/
├── sandbox.py                     # hardened exec node (stdlib-only)
├── tests/test_sandbox.py          # unit tests (docker mocked)
└── docker/sandbox/Dockerfile      # secure base image
```

## What it enforces
- **No network** — container always runs `--network none` (cannot be overridden).
- **Read-only root FS + writable tmpfs** at `/tmp:rw,noexec,nosuid` (Python needs
  a scratch dir; root FS stays locked).
- **Non-root + no capabilities** — `--user 1000`, `--cap-drop=ALL`,
  `--security-opt no-new-privileges=true`.
- **Manifest-locked** — a script declares needs via `# sandbox:<cap>` headers;
  the union must be a subset of `permission_manifest["allow"]`. Declaring
  network without a grant is refused outright.
- **Hard-locked config** — callers may only override `timeout` and `image`;
  `network`/`memory`/`cpus`/`user` always come from the hardened defaults.
- **Validated resources** — timeout ∈ (0, 300], memory/cpus format checked.
- **Timeout cleanup** — runaway containers are killed (best effort).

## Usage
```python
from sandbox import sandbox_execution_node

result = sandbox_execution_node({
    "proposed_script": "print('hello')",
    "permission_manifest": {"allow": []},   # least privilege by default
})
# => {"status": "success", "output": "hello\n", ...}
```

## Verify
```bash
python3 -m pytest scripts/sandbox/tests/ -q   # 11 passed
```

## Build & integration test (needs Docker on the runner)
```bash
docker build -t python-sandbox-image:latest scripts/sandbox/docker/sandbox
docker run --rm python-sandbox-image:latest "print(1+1)"   # -> 2
# isolation should fail (no network):
docker run --rm --network none python-sandbox-image:latest "import requests; requests.get('https://google.com')"
```
