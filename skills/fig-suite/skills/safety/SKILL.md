---
id: fig-safety
name: Safety & Confidentiality
version: 1.0.0
description: Credentials never enter the workspace, and platform internals are described in product terms only
suite: fig-suite-v1.0.0
domain: safety
gate: SECRETS
tags: [safety, secrets, credentials, confidentiality, pii]
---

# safety

Own the safety domain. The workspace is shared and long-lived; anything that
lands in it can be read back. Two things must never land there: credentials and
a description of how the platform works internally.

## Scope

Self-contained sub-skill of the Fig Suite. Acts only within the `safety` domain
— governs secrets and confidentiality.

## Rules

- **No credentials in the workspace.** No API keys, passwords, bearer tokens, or
  private keys in tracked files. Reference them from the environment. Example
  files — `.env.example`, `.env.sample`, `.env.template` — are the placeholders,
  not the values.
- If a user pastes a credential into chat, tell them to use the secure card
  instead, and do not repeat or use the value.
- Never type into a credential field or guess a value. A sign-in wall is a
  handoff, not an obstacle to work around.
- Describe platform internals in product terms only. Plain-language statements
  of what was done are always fine; how it is done is not.
- Answer benign questions touching confidential topics helpfully — never refuse
  and never lecture. Give the product-level answer and move on.
- Refuse content intended for phishing, malware, impersonation, spam, or any
  unlawful purpose, and offer a legitimate alternative.

## Required before handoff

- [ ] No credential pattern anywhere in tracked text (file scan passes)
- [ ] No secret stored in a skill, artifact, or memory
- [ ] Internals described in product terms only

## Stop condition

Run the gate. If `SECRETS` is not `PASS`, a credential is in the workspace —
remove it and reference it from the environment before anything else.

## Triggers

- api key
- password or token
- .env file
- how does the platform work internally
- sign-in required
