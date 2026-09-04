Pull Request Template

ไฟล์: .github/pull_request_template.md

# Pull Request

## Summary

<!-- Describe what this PR changes and why. -->

## Related Issue

Closes #

## Branch

**Source:** `<source-branch>`

**Target:**
- [ ] `main`
- [ ] `develop`
- [ ] `release/*`

## Change Type

- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] CI/CD
- [ ] Security
- [ ] Dependency update
- [ ] Breaking change

## Repository

- Project: Vite + React + TypeScript
- Package manager: npm
- Default branch: `main`

## CI Validation

### Node / React

- [ ] `npm ci`
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Tests pass
- [ ] Production build passes

### Dependencies

- [ ] Dependency Review passes
- [ ] `npm audit` reviewed
- [ ] No unexpected dependency changes
- [ ] Peer dependencies checked

### React Compatibility

Required for React-related changes.

- [ ] React version checked
- [ ] ReactDOM version checked
- [ ] React peer dependencies checked
- [ ] Runtime compatibility verified

## Dependency Changes

| Package | Before | After | Type |
|---|---|---|---|
| | | | |

- [ ] Patch
- [ ] Minor
- [ ] Major

### Major Dependency Upgrade

- [ ] Breaking changes reviewed
- [ ] Migration notes included
- [ ] Backward compatibility verified
- [ ] Manual review completed

## Security

- [ ] No secrets or credentials added
- [ ] No tokens or private keys committed
- [ ] GitHub Actions use least-privilege permissions
- [ ] Security impact reviewed
- [ ] Security checks pass

## CodeRabbit

- [ ] CodeRabbit review completed
- [ ] Review comments addressed
- [ ] No unresolved blocking findings

## Required CI Gates

- [ ] Node / React CI
- [ ] Dependency Audit
- [ ] Dependency Review
- [ ] Security checks
- [ ] CodeRabbit
- [ ] `Required CI Gates`

## Slack CLI Auto Check

- [ ] Slack CI notification completed
- [ ] CI status reported
- [ ] Failed checks reported when applicable
- [ ] No Slack token exposed

### Slack Check

```text
PR:
CI:
Dependencies:
Security:
CodeRabbit:
Required Gates:
Merge Status:

Testing Evidence

<!-- Add relevant logs, screenshots, test results, or links. -->Paste evidence here.

Deployment / Rollback

<!-- Describe deployment impact and rollback steps. -->Reviewer Checklist

[ ] Scope is appropriate

[ ] Code quality reviewed

[ ] Tests are sufficient

[ ] CI gates are green

[ ] Dependency changes are justified

[ ] Breaking changes are reviewed

[ ] Security impact reviewed

[ ] Documentation updated when required


Merge Policy

Patch Dependency

[ ] Required CI Gates pass

[ ] Dependency Review passes


Auto-merge is allowed when repository policy permits it.

Minor Dependency

[ ] Required CI Gates pass

[ ] Dependency Review passes

[ ] Manual review completed


Major Dependency

[ ] Required CI Gates pass

[ ] Dependency Review passes

[ ] Compatibility review completed

[ ] Manual approval completed


Automation

This PR may trigger:

Issue Auto Grant
        ↓
GitHub Actions
        ↓
Node / React CI
        ↓
Dependency Review
        ↓
Security Audit
        ↓
CodeRabbit
        ↓
Required CI Gates
        ↓
Slack CLI Auto Check
        ↓
Merge / Block
        ↓
Closes #123

Final Merge Checklist

[ ] All required checks are green

[ ] Required CI Gates passed

[ ] Dependency Review passed

[ ] CodeRabbit completed

[ ] Slack CI status reported

[ ] Required approvals completed

[ ] No unresolved conversations

[ ] Branch is up to date

[ ] Safe to merge


### 🇬🇧 Governance model

```text
Issue
  ↓
Auto Grant
  ↓
Branch
  ↓
Pull Request
  ↓
CI + Security + CodeRabbit
  ↓
Required CI Gates
  ↓
Slack CLI Auto Check
  ↓
Review
  ↓
Merge
  ↓
Auto-close Issue

Commit message:

docs: add branch-aware pull request governance template

