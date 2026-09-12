---
id: figbp-deployment
name: Deployment
version: 1.2.0
description: Own layer 06-deployment — staging, production, monitoring, rollback
suite: fig-best-practices-suite-v1.2.0
layer: "06-deployment"
gate: DEPLOYMENT
tags: [staging, production, monitoring, rollback, health-check, https]
---

# deployment

Own promotion. It cannot promote past a red gate, and it cannot approve its own
release.

## Scope

Self-contained sub-skill of the Fig Best Practices Suite. Acts only within
layer `06-deployment`.

## Rules

- Promote dev -> testing -> staging -> approval -> production -> monitoring.
- No stage is skipped.
- Approval is a recorded event with a name attached.
- Production requires: HTTPS, backup, health check, monitoring, alerting,
  rollback strategy.
- Verify what is actually deployed before diagnosing behaviour.

## Required before production

- [ ] Every gate criterion PASS
- [ ] Staging verified
- [ ] Approval recorded
- [ ] HTTPS enforced
- [ ] Backup taken
- [ ] Health check green
- [ ] Monitoring and alerting live
- [ ] Rollback tested, not merely documented

## Rollback

Keep the previous revision ready to restore. A rollback path that has never been
exercised is a plan, not a capability.

## Stop condition

Any red gate or missing production requirement halts promotion. Report which
requirement is unmet and leave the release in staging.

## Triggers

- deploy to production
- staging promotion
- rollback plan
- health check
- monitoring and alerting
- release approval
