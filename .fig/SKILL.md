---
name: pdf-ocr-security-review
description: >
  Security-first, evidence-based review for PDF/image conversion and OCR components.
  Use when reviewing PDF OCR pipelines, API keys, secrets, GitHub Actions, CI/CD,
  untrusted file processing, OCR privacy, dependency risks, test coverage, or when
  creating a review_results.md and documentation-only pull request.
---

# PDF OCR Security Review

## Purpose

Perform a security-first review of a PDF/OCR component and produce a single
evidence-based Markdown report. The review may create a documentation-only PR
when the caller explicitly requests it.

## Token discipline

1. Read this file first.
2. Do not read every reference file at startup.
3. Read only the reference needed for the current phase.
4. Do not repeat checklists verbatim in chat output.
5. Record detailed findings directly in `review_results.md`.
6. Prefer exact paths, line numbers, command summaries, and short evidence.
7. If a check is unavailable, record one concise blocker and continue.
8. Never invent files, results, secret values, credentials, commits, pushes, or PRs.
9. Do not load repository files unrelated to the review scope unless they directly
   affect runtime, security, build, CI, release, or deployment of the target.
10. Summarize completed phases in 3–8 bullets before moving to the next phase.

## Inputs

Required:
- `repository`: repository URL or local repository path
- `target_path`: path to the PDF/OCR component

Optional:
- `base_branch`: defaults to `main`
- `report_path`: defaults to `<target_path>/review_results.md`
- `create_pr`: defaults to `false`
- `branch_name`: defaults to `fig/review-pdf-convert-ocr`
- `pr_title`: defaults to `docs(security): add PDF convert OCR review results`

## Safety rules

- Never reveal a raw secret, token, password, key, private key, cookie, connection
  string, or credential-like value.
- Do not test a suspected credential against any live service.
- Do not transmit source documents, repository data, or secrets to external services.
- Treat realistic credentials as compromised until verified by an authorized owner.
- Do not modify source code, dependencies, CI, workflow files, or settings unless the
  caller explicitly changes the task from review to remediation.
- If `create_pr` is enabled, commit only the review report.
- Never overwrite, reset, stash, discard, or commit pre-existing user changes.
- Do not claim a remote push or PR exists unless verified.

## Phase routing

### Phase A — Repository setup

Inspect:
- Repository instructions (`AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`)
- Git status, current branch, remotes, current SHA
- Existence of target path
- Available validation tools

Read `references/delivery-pr.md` only if `create_pr=true`.

### Phase B — Secrets and security review

Read `references/security-audit.md`.

Inspect only files relevant to:
- Credentials and configuration
- `.env*`, `.gitignore`, logs, docs, fixtures, archives, patches
- Workflow/deployment scripts
- Git history when safe and available

If a possible secret is found:
- Redact it.
- Record location, type, confidence, exposure channel, and remediation.
- Flag rotation/revocation recommendation without performing it.

### Phase C — CI/CD and GitHub Actions

Read `references/github-actions-audit.md` only if relevant workflows/configuration exist.

### Phase D — PDF/OCR threat model

Read `references/pdf-ocr-threat-model.md`.

### Phase E — Dependencies and safe validation

Read `references/dependency-audit.md` only if manifests, lockfiles, Dockerfiles,
install scripts, or binary downloads exist.

Read `references/validation-checklist.md` before running tests or validation commands.

### Phase F — Create report

Read `references/report-template.md`.

Write or replace `<target_path>/review_results.md`.

Include:
- Scope and evidence
- Security findings
- Secret/API-key audit
- CI/CD assessment
- PDF/OCR threat model
- Dependency review
- OCR/reliability/privacy/performance observations
- Positive controls
- Limits/blockers
- Prioritized remediation plan
- Final verdict
- Delivery status

### Phase G — Documentation-only delivery

Only when `create_pr=true`:
1. Read `references/delivery-pr.md`.
2. Create the requested branch from the current accessible base branch.
3. Stage only `review_results.md`.
4. Commit only the report.
5. Push and create PR only if credentials and permission exist.
6. If any delivery step fails, write concise redacted failure evidence and next step
   in the report, then commit locally if possible.

## Review order

Use this order unless the repository structure requires a different order:

1. Instructions, git state, scope confirmation
2. Entrypoints, configuration, secrets exposure
3. PDF/OCR execution path and subprocess boundaries
4. GitHub Actions/deploy/release configuration
5. Dependencies and container/build chain
6. Tests, fixtures, logs, artifacts, docs
7. Safe validation
8. Report
9. Optional commit/push/PR

## Output discipline

Final chat response must include only:
- Final verdict
- Findings count by severity
- Whether potential secrets were found, never values
- Report path
- Local commit SHA if created
- Branch name
- Push status
- PR number/URL only if verified
- Blocker and safe next step, if any
