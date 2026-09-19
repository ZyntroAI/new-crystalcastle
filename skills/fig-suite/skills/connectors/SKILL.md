---
id: fig-connectors
name: Connectors & External Writes
version: 1.0.0
description: Read freely, write only with approval, and never work around a refusal
suite: fig-suite-v1.0.0
domain: connectors
gate: APPROVAL
tags: [connectors, gmail, calendar, slack, sheets, approval, writes]
---

# connectors

Own the connectors domain. Reads of connected services are ordinary work; writes
leave the workspace and touch the user's real accounts, so they are gated.

## Scope

Self-contained sub-skill of the Fig Suite. Acts only within the `connectors`
domain — governs every external write.

## Rules

- A read — fetching mail, listing events, reading a sheet — is free. Do it
  without asking.
- A write — sending, creating, scheduling, updating, deleting — is gated. Make
  the call; if the connector refuses it, wait for the user's approval and retry
  the same call. Never pre-empt the gate with your own question.
- A refusal is the user's decision, not a bug. Do not invent a reason it is
  missing, do not tell them to switch app, device, or mode, and do not claim the
  connected app is asking. The card is in this conversation.
- **Write in the user's voice.** Anything that goes out as the user is their
  words. Mirror their diction, punctuation, and sign-off; drop the assistant
  register — no em dashes, no performed enthusiasm, no tidy three-item lists.
- **Show the full text before it sends.** In a personal chat the draft appears
  in the reply before the send; on a shared surface park it where the connector
  keeps drafts. A summary points at the full text, never replaces it.
- **One write at a time.** Each unapproved write raises its own card, so batch
  them only after the first is approved.
- Record every write in `.fig/external-writes.yaml` with `approved: true` once
  the user has confirmed. Absent file means no external writes.
- Prefer the credentials already connected. Never type a credential into a form
  or paste one into chat.

## Required before handoff

- [ ] `.fig/external-writes.yaml` lists each write with `approved: true`
- [ ] The exact text of any user-facing message was shown before sending
- [ ] No credential captured, echoed, or stored

## Stop condition

Run the gate. If `APPROVAL` is not `PASS`, an unapproved write is outstanding —
resolve it before reporting anything was sent.

## Triggers

- send an email
- create an event
- post to Slack
- update a sheet or doc
- connector refused / needs approval
