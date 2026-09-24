# CI Workflow Repairs (v4)

This bundle resolves fabricated action SHAs (HTTP 404s) that were breaking CI, and provides a modernized `Python-CI.yml`.

## Changes
- **FastAPI_CI.yaml**: Replaced fabricated `actions/checkout` and `actions/setup-python` SHAs with valid v4.2.0 and v5.6.0 SHAs.
- **codeql.yml**: Replaced fabricated `github/codeql-action/*` SHAs with valid v3 SHAs, and `actions/checkout`.
- **Python-CI.yml**: Standardized YAML structure, updated checkout to v4 and setup-python to v5.

## Installation
Because the Fig GitHub App lacks `workflows` scope, these files cannot be pushed directly to `.github/workflows/` by the agent. 

To apply them:
```bash
cd ci/repaired-workflows-v4
./install.sh
```
