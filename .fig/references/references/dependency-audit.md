# Dependency and Supply-Chain Audit

Load only when dependency/build/container files exist.

## Inspect

- `package.json`, lockfiles
- `pyproject.toml`, `requirements*.txt`, lockfiles
- `go.mod`, `go.sum`
- `Cargo.toml`, `Cargo.lock`
- Maven/Gradle files
- Dockerfiles, compose files
- OS package installs
- install/build scripts
- downloaded executable logic

## Review checks

- Lockfile present and consistent
- Exact/ranged/unbounded dependency versions
- Deprecated components
- Install hooks and arbitrary script execution
- Download checksum/signature/provenance verification
- Container base image pinning
- Root vs non-root containers
- Build artifacts/data leakage
- Dependabot/Renovate
- SBOM and vulnerability/container scanning recommendations

## Finding IDs

Use `DEP-001`, `DEP-002`, etc.
