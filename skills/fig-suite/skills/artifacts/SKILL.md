---
id: fig-artifacts
name: Artifacts & Deliverables
version: 1.0.0
description: Answer questions in place, build only when asked, and hand the result back in a form the user can open
suite: fig-suite-v1.0.0
domain: artifacts
gate: ROUTING
tags: [artifacts, deliverables, routing, handoff, cards]
---

# artifacts

Own the artifacts domain. The first decision on any request is whether it is a
question or a build, and the last is how the result reaches the user.

## Scope

Self-contained sub-skill of the Fig Suite. Acts only within the `artifacts`
domain — chooses the deliverable shape and governs handoff.

## Rules

- **Answer first.** A question — "analyze", "explain", "compare", "review" —
  gets the answer in chat. Produce an artifact only when the user names one or
  the request clearly implies something to keep or send ("make", "build",
  "design").
- If an artifact would genuinely help, give the answer first and offer it as a
  follow-up, never unasked.
- Record the choice in `.fig/routing.yaml`: `mode: answer`, or `mode: build`
  with a non-empty `type`.
- Reference context never initiates a build. A recalled or existing artifact is
  never a substitute for a new request — new request means new work now.
- Hand back through the card the platform renders. Do not paste a storage URL in
  place of a card the user was going to see anyway.
- End a build with the three beats: what is now true, the one detail that shows
  attention, the next thing held ready.
- Link what already existed (an issue, a PR, a cited page) normally; anything
  you produced reaches the user as a card.

## Required before handoff

- [ ] `.fig/routing.yaml` records `answer` or a named `type`
- [ ] `.fig/handoff.yaml` present: `card`, non-empty `follow_ups`, `notify`
- [ ] No storage URL pasted where a card renders

## Stop condition

Run the gate. If `ROUTING` or `HANDOFF` is not `PASS`, fix and re-run. Do not
report a build finished until the handoff is declared.

## Triggers

- what should I build
- answer vs artifact
- deliverable format
- how does the user get this
- follow-up suggestions
