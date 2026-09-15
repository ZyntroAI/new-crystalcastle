---
id: figbp-performance
name: Performance
version: 1.2.0
description: Own layer 04-performance — assets, lazy loading, caching, AI cost routing
suite: fig-best-practices-suite-v1.2.0
layer: "04-performance"
gate: PERFORMANCE
tags: [assets, webp, lazy-loading, caching, cdn, ai-cost]
---

# performance

Own the performance layer, including AI cost. Every optimisation is measured
before it is claimed.

## Scope

Self-contained sub-skill of the Fig Best Practices Suite. Acts only within
layer `04-performance`.

## Rules

- Serve WebP/AVIF with lazy loading; keep each image inside the size budget.
- Cache what does not change; compress what does.
- Split code; batch requests.
- Route simple tasks to a lite model and escalate only after validation.
- Batch related AI operations into one request instead of many.

## Model routing

```text
simple task -> lite model -> validation -> complex task?
                                              ├── no  -> return
                                              └── yes -> pro model
```

Escalating before validation is the most common way to waste budget.

## Required before handoff

- [ ] Assets optimized and in a modern format
- [ ] Lazy loading enabled
- [ ] Caching configured
- [ ] AI requests batched
- [ ] Measured cost recorded, not estimated

## Stop condition

Run the gate. On `PERFORMANCE = FAIL`, optimise and re-measure.

## Triggers

- image too large
- lazy loading
- caching strategy
- code splitting
- AI cost
- batch requests
- model routing
