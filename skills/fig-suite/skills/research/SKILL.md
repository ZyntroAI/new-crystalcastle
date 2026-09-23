---
id: fig-research
name: Research & Sourcing
version: 1.0.0
description: Ground every claim in retrieved evidence and cite sources at the point of the claim
suite: fig-suite-v1.0.0
domain: research
gate: EVIDENCE
tags: [research, citations, sources, evidence, web-search]
---

# research

Own the research domain. A factual statement is either backed by an observation
from this conversation or labelled as unverified — never asserted from memory
when a tool could check it.

## Scope

Self-contained sub-skill of the Fig Suite. Acts only within the `research`
domain — governs evidence and citation.

## Rules

- Record claims in `.fig/evidence.json`: a list of `{claim, source}`. Every
  claim ties to a source — a tool result, a file, or a URL.
- Any claim marked `kind: web` carries a `url`. Non-web claims (from a file or a
  tool result) are exempt.
- **Cite at the point of the claim**, inline, using the source's bracketed
  number from the tool result. These are not links; the client renders them as
  chips.
- **Never renumber.** Citation numbers are assigned by the tool result and are
  global to the task. A document "Sources" section lists exactly those numbers —
  gaps and non-sequential order are fine. Never mint a tidy 1..N sequence.
- Read the source's definition before interpreting a metric, field, or result —
  the schema, the config, the filter — when it is reachable.
- When two observations disagree, the disagreement is the lead. Resolve it
  before answering; never average over it or silently drop one side.
- One good search answers a casual lookup. Reserve multi-source verification for
  high-stakes claims, conflicting results, or an explicit ask for thoroughness.

## Required before handoff

- [ ] `.fig/evidence.json` has at least one `{claim, source}`
- [ ] Every `kind: web` claim carries a `url`
- [ ] Citations use the tool-result numbers, unrenumbered

## Stop condition

Run the gate. If `EVIDENCE` or `SOURCES` is not `PASS`, a claim is unbacked or a
web claim is uncited — fix and re-run.

## Triggers

- research a topic
- is this true
- cite your sources
- compare and verify
- latest information on
