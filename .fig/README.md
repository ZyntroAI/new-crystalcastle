เขียนskills เพิ่ม FIG ตัดปัญหา limit token

ได้ครับ วิธีลดปัญหา token limit ของ FIG ไม่ใช่ย่อ prompt ก้อนเดียวให้สั้นที่สุด แต่คือแยกงานเป็น **Agent Skills แบบ progressive disclosure**: ให้ `SKILL.md` เก็บแค่กติกา, workflow, และ routing ที่จำเป็น ส่วน checklist, report template, secret patterns, CI checks และ PR procedure แยกเป็นไฟล์ reference ที่อ่านเฉพาะเมื่อถึงขั้นตอนนั้น

แนวทางนี้ทำให้ agent โหลด metadata ก่อน, โหลด core skill เฉพาะเมื่องานตรงกัน, และโหลด reference เฉพาะส่วนที่จำเป็น จึงลด context ที่ถูกใช้ล่วงหน้าได้มากกว่าใส่ prompt ตรวจทุกอย่างไว้ก้อนเดียว[1][2][3][4]

## โครงสร้าง Skill ที่แนะนำ

สร้าง skill ใกล้กับโฟลเดอร์ agent skills ของ FIG (ตำแหน่งจริงขึ้นกับ FIG runtime) ด้วยโครงสร้างนี้:

```text
pdf-ocr-security-review/
├── SKILL.md
├── references/
│   ├── security-audit.md
│   ├── github-actions-audit.md
│   ├── pdf-ocr-threat-model.md
│   ├── dependency-audit.md
│   ├── validation-checklist.md
│   ├── report-template.md
│   └── delivery-pr.md
└── templates/
    ├── review_results.md
    └── pr-body.md
```

- `SKILL.md` เป็น router และคำสั่งหลัก: ควรสั้นกว่า 500 บรรทัด
- `references/` เก็บรายละเอียดเฉพาะด้าน
- `templates/` เก็บ template ที่ให้ agent copy ไปใช้ แทนการโหลด/พิมพ์ซ้ำทุกครั้ง
- ให้ load reference **ทีละไฟล์**, ไม่อ่านทุกไฟล์พร้อมกัน เว้นแต่จำเป็นจริง[2][5][6]

## 1. `SKILL.md`

```md
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
```

## 2. `references/security-audit.md`

```md
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
```

## 3. `references/github-actions-audit.md`

```md
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
```

## 4. `references/pdf-ocr-threat-model.md`

```md
# PDF/OCR Threat Model

Load only during Phase D.

## Trust boundaries

Map:
- Input PDF/image
- User-provided filename/path/options
- Preprocessing
- Converter subprocesses
- OCR engine/service
- Temporary files
- Output PDF/text
- Logs/artifacts
- External API/storage/network
- CI/deployment environment

## Required threat checks

### Command execution

Check for:
- Unquoted variable expansion
- `eval`
- shell interpolation
- command substitution
- unsafe `xargs`, `find -exec`, globbing
- filenames passed into shell commands
- user controlled language/page/range/options
- PDF metadata/OCR text reused as commands

### File-system safety

Check:
- path traversal
- arbitrary write
- symlink/hard-link attacks
- predictable temporary files
- overly broad temp permissions
- unsafe output filename/path
- failure cleanup
- shared multi-user directories

### PDF/image abuse

Check controls for:
- corrupt/encrypted PDFs
- malformed PDF objects
- decompression/image bombs
- huge page sizes/page count
- high DPI conversion
- massive output volume
- recursive/retry loops
- CPU/memory/disk exhaustion
- subprocess concurrency

### External services and privacy

Check:
- OCR API uploads
- storage buckets
- URL ingestion/SSRF
- network egress
- retention
- telemetry/analytics
- logs/errors/artifacts exposing document content

### Toolchain

Review:
- Ghostscript
- ImageMagick
- Poppler
- Tesseract
- OCRmyPDF
- PDF libraries
- container sandbox/resource controls
- version pinning/update policy

## Threat finding IDs

Use `OCR-001`, `OCR-002`, etc.

For each:
- Threat
- Affected boundary
- Evidence
- Impact
- Existing control
- Missing control
- Remediation
- Safe test
```

## 5. `references/dependency-audit.md`

```md
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
```

## 6. `references/validation-checklist.md`

```md
# Safe Validation Checklist

Read immediately before executing commands.

## Safe first

Prefer:
- Static inspection
- Existing unit tests
- Lint/build commands documented by repository
- Non-destructive validation
- Controlled local fixture only

Do not:
- Use real credentials
- Upload files to external services
- Process private documents
- Run downloaded scripts as root
- Run unknown destructive commands
- Print environment variables
- Add debug output that may reveal secrets

## Record each command

For every executed command record:
- Purpose
- Command (redact sensitive values)
- Result: passed / failed / skipped
- Concise error outcome
- What was not verified

## OCR validation targets

If safe fixtures and local dependencies exist:
- Scanned PDF
- Text PDF
- Multi-page PDF
- Rotated page
- Thai/English or available language combination
- Output existence
- Searchability/selectability if testable
- Page count/order
- No uncontrolled temp artifacts

If fixtures/tools are unavailable:
- Record a blocker.
- Do not claim OCR behavior was validated.

## Git safety

Before branch/commit:
- Check status
- Preserve user changes
- Stage only report file
- Review staged diff
- Verify commit SHA
- Verify remote result before claiming success
```

## 7. `references/report-template.md`

```md
# Report Template

Copy this structure to `<target_path>/review_results.md`.
Keep entries evidence-based and concise. Do not paste entire source files or raw logs.

# Security-First Review: PDF Convert OCR

**Repository:** `<owner/repo>`  
**Branch reviewed:** `<branch>`  
**Review path:** `<path>`  
**Review date:** `<date>`  
**Review type:** Static review and safe local validation  
**Reviewer:** FIG Agent  

## 1. Executive Summary

- **Production readiness:** Ready / Ready with minor hardening / Ready with required security changes / Not ready for production
- **Overall security posture:**
- **Overall functional/OCR posture:**
- **Findings count:** Critical / High / Medium / Low / Informational
- **Potential secrets detected:** Yes / No / Not verifiable
- **Immediate credential rotation recommended:** Yes / No / Needs verification
- **Scope limitations and confidence level:**

## 2. Review Scope and Evidence

- Reviewed commit:
- Files/directories inspected:
- Tools available:
- Commands run:
- Validation summary:
- Checks skipped:
- Access/tooling limitations:

## 3. Immediate Actions

| Priority | Action | Why | Owner role | Evidence / affected location |
|---|---|---|---|---|

## 4. Secret and API Key Audit

| ID | Classification | Confidence | Location | Exposure channel | Risk | Rotation/revocation | Required remediation |
|---|---|---|---|---|---|---|---|

## 5. Architecture and Data Flow

```text
Input PDF/image
→ validation
→ preprocessing
→ conversion
→ OCR
→ output PDF/text
→ logs / temp files / artifacts
```

## 6. GitHub Actions and CI/CD Security

| ID | Severity | Workflow/File:Line | Finding | Evidence | Impact | Recommended fix |
|---|---|---|---|---|---|---|

## 7. PDF/OCR Threat Model

| Threat | Attack surface | Current control | Gap | Recommended mitigation | Validation |
|---|---|---|---|---|---|

## 8. Detailed Findings

| ID | Severity | Status | File:Line | Finding | Impact | Recommended fix | Validation test |
|---|---|---|---|---|---|---|---|

## 9. Dependency and Supply-Chain Review

## 10. OCR, Reliability, Privacy, and Performance Review

## 11. Positive Security Controls

## 12. Recommended Automated Controls

## 13. Implementation Plan

### Immediate containment (0–24 hours)

| Priority | Action | Owner role | Complexity | Acceptance criteria |
|---|---|---|---|---|

### Before production

| Priority | Action | Owner role | Complexity | Acceptance criteria |
|---|---|---|---|---|

### Near-term hardening

| Priority | Action | Owner role | Complexity | Acceptance criteria |
|---|---|---|---|---|

### Long-term improvements

| Priority | Action | Owner role | Complexity | Acceptance criteria |
|---|---|---|---|---|

## 14. Suggested Commit Plan

## 15. Final Verdict

### Top 5 Recommended Actions

1. 
2. 
3. 
4. 
5. 

### What Not To Do

- Do not commit credentials or sensitive OCR documents.
- Do not expose secrets/document content in logs, caches, artifacts, or PR text.
- Do not run untrusted PR code in privileged workflows.
- Do not use broad long-lived deployment credentials when OIDC is viable.

### Delivery Status

- Review file created:
- Local branch created:
- Commit created:
- Commit SHA:
- Push completed:
- PR created:
- PR URL/number:
- Blockers and safe next step:
```

## 8. `references/delivery-pr.md`

```md
# Documentation-Only PR Delivery

Read only when `create_pr=true`.

## Defaults

- Base branch: `main`
- Review branch: `fig/review-pdf-convert-ocr`
- Report path: `<target_path>/review_results.md`
- Commit message: `docs(security): add PDF convert OCR review results`
- PR title: `docs(security): add PDF convert OCR review results`

## Required procedure

1. Inspect:
   - `git status --short`
   - current branch
   - remotes
   - current HEAD SHA
   - repository instructions

2. Preserve pre-existing user modifications:
   - Never reset, clean, checkout-over, stash, or commit user files.
   - If safe branch creation is impossible, record the blocker in the report.

3. Create/update only the review report.

4. Before commit:
   - Confirm report is valid Markdown.
   - Confirm no raw secret is present.
   - Confirm staged files contain only `review_results.md`.
   - Review `git diff --cached`.

5. Commit locally.

6. Attempt push exactly once after authentication/status checks.

7. If push succeeds, create PR with the approved title/body.

8. Verify:
   - remote branch exists
   - PR number and URL exist
   - target branch is correct
   - changed file scope is documentation-only

## Failure handling

If push/PR fails:
- Do not fabricate success.
- Add a concise entry to `review_results.md`:
  - operation attempted
  - redacted error summary
  - impact
  - safe exact next step
- Amend/recommit the report if needed.
- Report local commit SHA and branch name.

## PR body template

## Summary
Adds a security-first technical review for `pdf-convert-ocr`.

## Review coverage
- Secrets and API key exposure
- GitHub Actions and CI/CD security
- PDF/OCR attack surface
- Dependency and supply-chain risks
- OCR correctness, reliability, privacy, performance, tests, and documentation

## Notes
This PR adds review documentation only. It does not modify the PDF/OCR implementation, credentials, workflows, dependencies, or repository settings.
```

## Prompt สั้นสำหรับเรียก Skill

หลังติดตั้ง files ด้านบนแล้ว คุณไม่ต้อง paste prompt ใหญ่ทุกครั้ง ใช้เพียงนี้:

```text
Use the `pdf-ocr-security-review` skill.

Repository: https://github.com/ZyntroAI/new-crystalcastle
Base branch: main
Target path: pdf-convert-ocr
Report path: pdf-convert-ocr/review_results.md

Perform the complete security-first review, including secrets/API-key audit,
GitHub Actions security, PDF/OCR threat model, dependency review, safe validation,
OCR reliability, test/documentation review, and an evidence-based remediation plan.

Create a documentation-only branch:
fig/review-pdf-convert-ocr

Commit only the report using:
docs(security): add PDF convert OCR review results

Push and open a PR into main with the skill’s prescribed title/body.
Continue through all available steps without pausing. If any step is blocked, record
the redacted blocker and exact safe next step in `pdf-convert-ocr/review_results.md`,
then complete all remaining work possible.
```

## วิธีลด Token เพิ่มเติม

1. **แยก skill ตามงานจริง**  
   ถ้า FIG ยังติด limit ให้ split เป็น 3 skills แทน:
   - `pdf-ocr-security-audit`
   - `pdf-ocr-quality-review`
   - `review-report-delivery`

   แล้วใช้ orchestrator แค่ 50–80 บรรทัดเพื่อเรียกทีละ skill

2. **ใช้ phase markers ใน report**  
   ให้ agent เขียนสรุปลง `review_results.md` หลังจบแต่ละ phase แล้วล้าง context งานที่จบไปในรอบถัดไป เช่น:
   ```text
   Completed: Phase A, B
   Next: Phase C
   ```
   รอบใหม่จะอ่านเฉพาะ report summary + reference ที่ต้องใช้ต่อ

3. **อย่าใส่ list secret patterns ยาว ๆ ใน `SKILL.md`**  
   ย้ายไป `security-audit.md` เพราะใช้เฉพาะตอน security audit

4. **เก็บ command templates เป็นไฟล์ script**  
   เช่น `scripts/scan-safe.sh`, `scripts/check-workflow.sh` ให้ agent execute แทนการโหลดคำสั่ง/logic ยาว ๆ เข้า context

5. **หลีกเลี่ยงอ่านไฟล์ขนาดใหญ่เต็มไฟล์**  
   ใช้ search ก่อน แล้วอ่านเฉพาะ surrounding lines ของ match; ถ้า lockfile ใหญ่ ให้ดูเฉพาะ package ที่เกี่ยวกับ OCR/PDF หรือ known risky install hooks

6. **ให้ report เป็น source of truth ระหว่าง phases**  
   ทำให้ agentไม่ต้องถือ finding ทั้งหมดไว้ใน conversation context: อ่าน/อัปเดต `review_results.md` เฉพาะส่วนที่จำเป็นต่อ phase ถัดไป

Progressive disclosure คือหลักสำคัญ: metadata สั้นโหลดตลอด, body ของ `SKILL.md` โหลดเมื่อถูกเรียก, และ reference/scripts โหลดเฉพาะตามความจำเป็น โดยแนวทางทั่วไปคือเก็บ `SKILL.md` ให้ต่ำกว่า 500 บรรทัดและแยกรายละเอียดออกเป็น files อื่นครับ[1][2][3][4][5][6]

การอ้างอิง:
[1] Equipping agents for the real world with Agent Skills https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
[2] Skill authoring best practices - Claude Platform Docs https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
[3] Developer's Guide to Building ADK Agents with Skills https://developers.googleblog.com/developers-guide-to-building-adk-agents-with-skills/
[4] Progressive Disclosure Model | supabase/agent-skills | DeepWiki https://deepwiki.com/supabase/agent-skills/2.1-progressive-disclosure-model
[5] Configuration and multi-file skills - Claude Academy https://academy.claude.com/courses/introduction-to-agent-skills/configuration-and-multi-file-skills
[6] What Are Agent Skills and How To Use Them - Strapi https://strapi.io/blog/what-are-agent-skills-and-how-to-use-them
[7] Agent Skills for Large Language Models:Architecture, ... https://arxiv.org/html/2602.12430v3
[8] Is Progressive Disclosure All You Need for Long-Context Agents? https://arxiv.org/html/2607.17598v1
[9] SkillReducer: Optimizing LLM Agent Skills for Token ... https://arxiv.org/html/2603.29919v1
[10] Agent Skills Explained: SKILL.md Format and Adoption (2026) https://atlan.com/know/ai-agent/ai-agent-skills/what-are-agent-skills/
[11] agents/docs/agent-skills.md at main · wshobson/agents https://github.com/wshobson/agents/blob/main/docs/agent-skills.md
[12] Building Skills for AI Agents: Lessons & Best Practices https://anthonytd.com/blog/building-skills-for-ai-agents/
[13] Skill Authoring Guide — Best practices for writing high ... - GitHub Gist https://gist.github.com/lipex360x/3a1a662525e88a3e856b7fda02ab8ce3
[14] Progressive Disclosure | lfenghx/skill_agent | DeepWiki https://deepwiki.com/lfenghx/skill_agent/3.1-progressive-disclosure
[15] skill-creator skill by hoangnguyen0403/agent-skills-standard https://playbooks.com/skills/hoangnguyen0403/agent-skills-standard/skill-creator
