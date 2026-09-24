# Security Policy

## Reporting a Vulnerability

**Do not open a public issue for a security problem.** This repository is public,
so anything filed in an issue is immediately visible to everyone.

Report privately through GitHub Security Advisories:

**https://github.com/ZyntroAI/new-crystalcastle/security/advisories/new**

Please include:

- What the issue is and where (file, workflow, endpoint, dependency)
- Steps to reproduce, or a proof-of-concept
- The impact you believe it has, and how you would rate its severity
- Any suggested fix, if you have one

**What to expect:** acknowledgement within 3 business days, an initial assessment
within 7. If the report is accepted we will agree a disclosure timeline with you
and credit you in the advisory unless you prefer otherwise. If it is declined we
will explain why.

Do not include live credentials in a report. If you believe a credential is
leaked, say *which one* and *where* — never paste the value. It will already be
in the repository history and pasting it again only widens the exposure.

## Supported Versions

This project is developed continuously off `main`; there are no maintained
release branches. Security fixes are applied to `main` only.

| Version | Supported |
| ------- | --------- |
| `main` (latest) | :white_check_mark: |
| Any tagged release | :x: — fork and pin if you need stability |
| Forks | :x: — maintained by their owners |

---

## Credential Rotation Checklist

> **Status: REQUIRED — outstanding action.**
> Opened 2026-09-24 after five `.env` files were found tracked in git. See
> "Incident record" at the bottom of this section.

### Why this is necessary

Five environment files were committed to this **public** repository and remain
reachable in its history on `main`:

| File | Rotatable credentials |
| ---- | --------------------- |
| `.env` | 16 |
| `.env.local` | 3 |
| `backend/CodeRabbit/.env` | 1 |
| `pdf-convert-ocr/.env` | 3 |
| `backend/.env` | 0 (holds example values only) |

23 credentials across 21 unique keys. Two further keys in `.env` —
`NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — are
**designed to be public** and are therefore not rotated; they are listed under
"Also check" below.

Removing a file from tracking (`git rm --cached`) stops **future** leaks. It does
not remove anything already written into history, and history is what an attacker
reads. **Every credential below must be assumed compromised and rotated.**

Rotate first, rewrite history second — a history rewrite without rotation changes
nothing about the exposure, only who can find it.

### Priority order — work top to bottom

#### P0 — Rotate now

- [ ] **`SLACK_WEBHOOK`** (`pdf-convert-ocr/.env`) — an incoming-webhook URL is a
      bearer credential in plain URL form: anyone holding it can post arbitrary
      messages into the workspace. Revoke the webhook in the Slack app config and
      create a new one.
- [ ] **`DATABASE_URL`** (`.env`) — carries an inline `user:password@` pair, so it
      is a second path to the same database credential as `DB_PASSWORD`. Treat
      both as one rotation.
- [ ] **`DB_PASSWORD`** / `DB_USER` / `DB_HOST` (`.env`) — rotate the database
      password, then update `DATABASE_URL` to match.
- [ ] **`GH_TOKEN`** (`.env`) — revoke the token at
      https://github.com/settings/tokens and confirm in the audit log that it was
      never used from an unrecognised IP.
- [ ] **`STORAGE_SECRET_ACCESS_KEY`** / `STORAGE_ACCESS_KEY_ID` (`.env`) — rotate
      the object-storage key pair. Delete the old key rather than disabling it.

#### P1 — Rotate this week

- [ ] **`JWT_SECRET`** (`.env`) — rotating this invalidates every issued access
      token, so schedule it deliberately. Deploy the new secret, accept the old
      one for one token-lifetime, then remove it.
- [ ] **`REFRESH_TOKEN_SECRET`** (`.env`) — same handling; invalidates refresh
      tokens. Rotating `JWT_SECRET` and this together forces a global re-login —
      decide whether that is acceptable before you do it.
- [ ] **`PASSWORD_RESET_SECRET`** (`.env.local`) — rotating invalidates
      outstanding reset links. Safe to do; users mid-reset must request a new link.
- [ ] **`EMAIL_VERIFICATION_SECRET`** (`.env.local`) — same; invalidates pending
      verification links.
- [ ] **`API_SECRET`** / **`API_KEY`** (`.env`)
- [ ] **`AI_API_KEY`** (`.env`) — check the provider dashboard for usage you do
      not recognise before rotating.
- [ ] **`RECAPTCHA_SECRET_KEY`** (`.env`) — note `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
      is *designed* to be public; the secret key is not.
- [ ] **`TELEGRAM_BOT_TOKEN`** (`.env`)

#### P2 — Rotate this month

- [ ] **`IMAP_PASS`** (`.env`, `pdf-convert-ocr/.env`) — two accounts, rotate both.
- [ ] **`SMTP_PASSWORD`** / **`SMTP_PASS`** (`.env`, `.env.local`,
      `pdf-convert-ocr/.env`) — same credential in three places; rotate once and
      update all three.
- [ ] **`OBSIDIAN_TOKEN`** (`.env`)
- [ ] **`DOLA_JWT_SECRET`** (`.env`)
- [ ] **`VITE_GITHUB_TOKEN`** (`backend/CodeRabbit/.env`) — **lowest urgency but
      note why:** `VITE_*` values are inlined into the browser bundle at build
      time, so this token was always public by construction. Replace it with a
      fine-grained, read-only, short-lived token scoped to a single repository.
- [ ] **`SENTRY_DSN`** (`.env`) — low direct risk (a DSN only permits event
      submission) but rotate if it permits project write access.

#### Also check — not credentials, still exposed

These are public in history and cannot be rotated; act only if they matter to you:

- [ ] **Personal data** — `SMTP_USER`, `IMAP_USER`, `SMTP_FROM`, `ALERT_EMAIL`,
      `EMAIL_FROM` contain real email addresses; `TELEGRAM_CHAT_ID` is an
      account identifier.
- [ ] **Internal topology** — `DB_HOST`, `REDIS_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
      `IMAP_HOST`, `SMTP_HOST`, `API_URL`, `APP_URL` reveal infrastructure layout.
- [ ] **`VITE_DEFAULT_REPO`** (`backend/CodeRabbit/.env`) — names the repository
      the integration points at.
- [ ] **Designed-public keys** — `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and
      `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env`) are meant to ship in client code,
      so their exposure is not itself a finding. They are listed here only so
      that nobody "rotates" a key the app depends on, and so you confirm the
      anon key's row-level-security policies are the thing actually guarding
      your data.

### After rotation

- [ ] Confirm old credentials are **revoked**, not merely replaced. A key that
      still authenticates is still a finding.
- [ ] Search the repository, issues and PR comments, and CI logs for any copy of
      the same values that was pasted outside the `.env` files.
- [ ] Add a secret-scanning rule to CI so a future commit of a credential-shaped
      string fails the build (this repository already has `.github/dependabot.yml`
      and a CodeQL workflow as starting points).
- [ ] Only then consider a history rewrite. It will rewrite commit SHAs and orphan
      every open PR and branch that descends from an existing commit — coordinate
      with anyone holding a fork.

### How to avoid repeating this

- Never commit a real `.env`. `.gitignore` covers `.env`, `.env.local`, and a
  `.env.*` catch-all with negations for templates — check that every new
  component's env file is matched before you create it.
- Start from the committed template (`<component>/.env.example`) and keep the
  template placeholder-only. It is the one env file that belongs in git.
- Run `git ls-files | grep -E '(^|/)\.env'` before opening a PR. It should return
  only `.env.example` files. Anything else is a leak.

### Incident record

- **Found:** 2026-09-24, during a documentation audit of the repository root.
- **What:** five `.env` files tracked in git on `main`, containing
  credential-shaped values — not placeholders — plus personal data and internal
  hostnames. The repository is public.
- **Remediation:** untracked via `git rm --cached` (files kept on local disk),
  missing `.env.example` templates added, `.gitignore` hardened with a `.env.*`
  catch-all plus template negations.
- **Outstanding:** rotation of the credentials listed above. **History has not
  been rewritten** — the values remain reachable on `main` until it is.
