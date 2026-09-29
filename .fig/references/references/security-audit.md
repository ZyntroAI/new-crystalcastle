# Security and Secret Audit

Load this file only during Phase B.

## Goal

Identify secrets, API key exposure, unsafe credential handling, and privacy leaks.
Do not reveal credential values.

## High-value locations

Inspect, if present:
- `.env`, `.env.*`, `.env.example`, `*.pem`, `*.key`, `*.p12`, `*.crt`
- `config/`, `secrets/`, `credentials/`, `deploy/`, `scripts/`
- `README*`, `docs/`, examples, sample config, shell scripts
- logs, backups, patch files, archives, generated artifacts
- tests, fixtures, snapshots, mock files
- GitHub workflow files
- `.gitignore`, `.dockerignore`, package ignore files

## Classify every credential-like value

Use exactly one:
- Confirmed secret
- High-confidence suspected secret
- Placeholder/test value
- Sensitive configuration
- No secret found
- Not verifiable

## Required evidence per finding

- ID: `SEC-001`, `SEC-002`, etc.
- Classification
- Confidence: High / Medium / Low
- Location: relative path and line number
- Exposure channel: source, docs, history, log, artifact, cache, fixture, workflow
- Redacted identifier only if safe
- Risk explanation
- Rotation/revocation: Yes / No / Needs verification
- Required remediation
- Prevention control

## Check for

- API keys and tokens
- GitHub PATs, GitHub App keys, OAuth client secrets
- AWS/Azure/GCP credentials and service account JSON
- OCR/PDF provider keys
- Database URLs and passwords
- SMTP, Slack, Discord, Telegram, Sentry, analytics, payment credentials
- JWT signing secrets and encryption keys
- SSH private keys, TLS private material, signing keys
- Webhook secrets
- Secrets masked poorly, concatenated, Base64/hex encoded, URL encoded, or in comments

## Git history rules

When history is available:
- Check for sensitive filenames and credential-like additions/removals.
- Record commit SHA and file path only.
- Never print historic secret values.
- If a secret exists only in history, recommend rotation before history rewrite.
- Never claim history is clean unless checks were actually performed.

## Remediation order

1. Revoke/rotate potentially real secret.
2. Remove it from active files and generated output.
3. Move configuration to a secure secret store/environment secret.
4. Update examples to non-live placeholders.
5. Add ignore rules.
6. Clean history if required after rotation.
7. Enable prevention controls.

## Positive controls

Record verified controls such as:
- `.env` properly ignored
- Placeholder-only `.env.example`
- Environment-scoped secrets
- OIDC instead of static cloud keys
- Secret scanning and push protection
- Secret-safe logging
- Artifact exclusions
