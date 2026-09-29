# GitHub Actions and CI/CD Audit

Load only when relevant workflows/configuration exist.

## Inspect

- `.github/workflows/*.yml`
- reusable workflows
- composite actions
- deploy/release scripts
- Docker build/publish scripts
- artifact/cache configuration

## Priority checks

### Permissions

Check `permissions:` at workflow/job level.

Expected:
- CI: normally `contents: read`
- Release: only required write permissions
- Deploy: `contents: read`; `id-token: write` only when OIDC is used
- Avoid broad default write access

### Dangerous triggers

Inspect:
- `pull_request_target`
- `workflow_run`
- `issue_comment`
- `repository_dispatch`
- `workflow_dispatch`

For each, determine if untrusted:
- PR code
- branch/tag name
- issue/PR comment
- commit message
- workflow input
- artifact
- external payload

can reach a privileged command, checkout, action, secret, or deployment.

### Shell injection

Look for unsafe expansion in `run:`:
- `${{ github.event.* }}`
- `${{ inputs.* }}`
- branch/tag/ref/title/body values
- unquoted shell variables
- `eval`
- dynamic command construction
- `curl | bash`

### Supply chain

Check:
- third-party actions pinned to immutable commit SHA where security requires it
- mutable `@main`, `@master`, broad tags
- unverified binary downloads
- package install scripts
- dynamic action/version use

### Secrets, caches, artifacts

Check:
- secrets passed only where needed
- no secrets in `echo`, command args, debug output
- artifacts do not upload `.env`, logs with secrets, OCR outputs, browser state, credentials
- caches do not include credential directories or private data
- retention is justified

### Deploy/release

Check:
- CI separated from deploy/release
- production uses GitHub Environment
- required reviewers and branch/tag limits
- concurrency prevents concurrent production deploy
- OIDC considered where supported
- release permissions constrained

## Finding format

Use `CI-001`, `CI-002`, etc.
Provide file:line, risk, exploit path if confirmed, precise fix, and validation.
