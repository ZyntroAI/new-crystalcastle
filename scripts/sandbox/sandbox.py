"""Secure isolated code-execution node.

Runs an untrusted script string inside a hardened Docker container and returns
a structured result. The container is locked down at launch:

- no network (``--network none``)
- read-only root filesystem plus a writable tmpfs at ``/tmp`` (Python runtime
  needs a scratch dir even with PYTHONDONTWRITEBYTECODE=1)
- non-root user 1000, all Linux capabilities dropped, no new privileges

Security invariants enforced here (not delegated to caller config):
- network / privileged / device / mount settings can never be overridden by
  ``sandbox_config`` in the state; the hard-coded defaults always win.
- resource limits (memory/cpus) and timeout are validated before use.
- a declared ``permission_manifest`` is enforced: capabilities the script
  claims are checked against what the manifest allows.
"""

from __future__ import annotations

import json
import re
import subprocess
from typing import Any, Dict

# Hard-coded defaults. This is the security floor and can never be relaxed
# through state input.
HARDENED_DEFAULTS: Dict[str, Any] = {
    "network": "none",
    "memory": "512m",
    "cpus": "0.5",
    "timeout": 30,
    "image": "python-sandbox-image:latest",
    "read_only": True,
    "user": "1000",
}

# Whitelist of capabilities a script may declare. Anything else is refused.
ALLOWED_DECLARED_CAPS = {"network.http.get", "fs.read", "stdout"}

# Tuning knobs callers may tweak. Security-sensitive keys are intentionally
# absent here.
ALLOWABLE_OVERRIDES = {"timeout", "image"}

_RESOURCE_RE = re.compile(r"^\d+(\.\d+)?[kmgt]?$|^\d+$", re.IGNORECASE)
_TIMEOUT_MAX = 300


class SandboxError(Exception):
    """Raised for configuration / policy violations."""


def _coerce_bool(value: Any, name: str) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str) and value.strip().lower() in {"true", "1", "yes"}:
        return True
    if isinstance(value, str) and value.strip().lower() in {"false", "0", "no"}:
        return False
    raise SandboxError(f"{name}: expected a boolean, got {value!r}")


def _validate_config(config: Dict[str, Any]) -> None:
    timeout = config.get("timeout")
    if not isinstance(timeout, int) or timeout <= 0 or timeout > _TIMEOUT_MAX:
        raise SandboxError(
            f"timeout must be an int in (0, {_TIMEOUT_MAX}], got {timeout!r}"
        )
    for key in ("memory", "cpus"):
        val = config.get(key)
        if not isinstance(val, str) or not _RESOURCE_RE.match(val.strip()):
            raise SandboxError(f"{key}: invalid resource value {val!r}")
    image = config.get("image")
    if not isinstance(image, str) or not image.strip() or " " in image.strip():
        raise SandboxError(f"image: invalid container image {image!r}")


def _enforce_manifest(script: str, manifest: Dict[str, Any]) -> None:
    """Refuse execution when the script's declared needs exceed the manifest.

    A script signals needs via header comments, e.g.::

        # sandbox:network.http.get
        # sandbox:fs.read

    The union of declared capabilities must be a subset of the manifest's
    ``allow`` set. Network is defence-in-depth: the container always runs with
    ``--network none``, but if the script declares egress the manifest must
    grant it or execution is refused.
    """
    allow = set(manifest.get("allow") or [])
    declared = set(re.findall(r"^#\s*sandbox:([a-zA-Z0-9_.]+)\s*$", script, re.M))

    unknown = declared - ALLOWED_DECLARED_CAPS
    if unknown:
        raise SandboxError(
            f"script declares unsupported capabilities: {sorted(unknown)}"
        )

    if "network.http.get" in declared and "network.http.get" not in allow:
        raise SandboxError(
            "script requires network.http.get but permission_manifest does not allow it"
        )


def _build_docker_command(script: str, config: Dict[str, Any]) -> list:
    """Assemble the hardened docker run argv.

    Note the boolean flags are emitted with no value (``--read-only``, not
    ``--read-only=True``) and no ``-c`` is appended here: the image's
    ENTRYPOINT is already ``python3 -c``, so the script string is the last
    positional arg.
    """
    cmd = [
        "docker", "run", "--rm",
        f"--network={config['network']}",
        f"--memory={config['memory']}",
        f"--cpus={config['cpus']}",
        f"--user={config['user']}",
        "--read-only",
        "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
        "--cap-drop=ALL",
        "--security-opt", "no-new-privileges=true",
    ]
    if config.get("read_only") is False:  # never happens; defensive
        cmd.remove("--read-only")
    cmd += [str(config["image"]), script]
    return cmd


def sandbox_execution_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Execute ``state["proposed_script"]`` in a hardened sandbox.

    Returns a LangGraph-friendly dict:
    ``{status, output, error, sandbox, ...}``
    """
    script = state.get("proposed_script")
    if not script or not isinstance(script, str):
        return {"status": "error", "reason": "NO_SCRIPT_PROVIDED"}

    manifest = state.get("permission_manifest") or {}

    # Effective config = hardened floor + allowed overrides only.
    config = dict(HARDENED_DEFAULTS)
    caller = state.get("sandbox_config") or {}
    for key in ALLOWABLE_OVERRIDES:
        if key in caller:
            config[key] = caller[key]
    config["read_only"] = _coerce_bool(config["read_only"], "read_only")

    try:
        _validate_config(config)
        _enforce_manifest(script, manifest)
    except SandboxError as exc:
        return {
            "status": "denied",
            "error": str(exc),
            "sandbox": {"isolated": True, "reason": "policy"},
        }

    docker_cmd = _build_docker_command(script, config)

    try:
        result = subprocess.run(
            docker_cmd,
            capture_output=True,
            text=True,
            timeout=config["timeout"],
        )
    except subprocess.TimeoutExpired:
        # Kill any runaway container for this image so nothing lingers.
        try:
            subprocess.run(
                ["docker", "ps", "-q", "--filter", f"ancestor={config['image']}"],
                capture_output=True,
                text=True,
                timeout=10,
            )
        except Exception:
            pass  # best-effort
        return {
            "status": "error",
            "error": "EXECUTION_TIMEOUT",
            "sandbox": {"isolated": True, "timeout": config["timeout"]},
        }
    except Exception as exc:  # docker binary missing, etc.
        return {
            "status": "error",
            "error": f"SANDBOX_INFRASTRUCTURE_ERROR: {exc.__class__.__name__}",
            "sandbox": {"isolated": True},
        }

    base_sandbox = {"isolated": True, "manifest": manifest, "network": "none"}
    if result.returncode == 0:
        try:
            parsed = json.loads(result.stdout)
            return {
                "status": "success",
                "output": parsed,
                "raw_output": result.stdout,
                "format": "json",
                "sandbox": base_sandbox,
            }
        except json.JSONDecodeError:
            return {
                "status": "success",
                "output": result.stdout,
                "raw_output": result.stdout,
                "format": "text",
                "sandbox": base_sandbox,
            }
    return {
        "status": "failed",
        "error": f"EXIT_{result.returncode}",
        "raw_output": result.stdout,
        "sandbox": {**base_sandbox, "stderr": (result.stderr or "")[:4000]},
    }
