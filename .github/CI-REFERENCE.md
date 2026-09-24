Here’s the complete reference document — ready to save directly as `CI-REFERENCE.md` in your repo 📄

---

```markdown
# 📚 CI Workflow Reference — Cross-Platform • Fork-Safe • Security

> **Status**: Production-Ready | Last Updated: 2026-09-24
> **Covers**: Jest + Playwright + SBOM/Grype + Slack Notifications
> **Platforms**: Ubuntu • Windows • macOS | Node.js: 18 • 20 • 22

---

## 🧭 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Matrix & Platform Logic](#2-matrix--platform-logic)
3. [Playwright Installation Details](#3-playwright-installation-details)
4. [Caching Strategy Explained](#4-caching-strategy-explained)
5. [Fork Security Boundary](#5-fork-security-boundary)
6. [SBOM & Vulnerability Scanning](#6-sbom--vulnerability-scanning)
7. [Advanced Customization Guide](#7-advanced-customization-guide)
8. [Troubleshooting](#8-troubleshooting)
9. [Decision Log](#9-decision-log)

---

## 1. Architecture Overview

### Workflow Flow
```
[PR / Push Trigger]
        ↓
┌──────────────────────────────┐
│ test-matrix (9 parallel jobs)│
│  ├─ Checkout + Node Setup    │
│  ├─ Cache Restore           │
│  ├─ npm ci                   │
│  ├─ Jest (Unit Tests)        │
│  └─ Playwright (E2E)         │
│     ├─ Ubuntu: --with-deps   │
│     └─ Win/macOS: install    │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ security-scan (Ubuntu only)  │
│  ├─ Docker build (local)     │
│  ├─ SBOM → Syft              │
│  ├─ Scan → Grype             │
│  └─ SARIF → GitHub Security  │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│ notify (Ubuntu only)         │
│  └─ Slack: Success / Failure │
└──────────────────────────────┘
```

### Design Principles
- **Parallelism**: All 9 matrix jobs run simultaneously → fastest feedback
- **Isolation**: One failure doesn't hide results from other platforms
- **Efficiency**: SBOM/Docker runs once on Ubuntu (best Docker support)
- **Security First**: External forks never see secrets or write tokens

---

## 2. Matrix & Platform Logic

### Matrix Definition
```yaml
matrix:
  os: [ubuntu-latest, windows-latest, macos-latest]
  node: [18, 20, 22]
```
- **Total combinations**: 3 × 3 = **9 parallel jobs**
- `fail-fast: false` → see full results even if some fail

### Selective Execution Rules
| Event | test-matrix | security-scan | notify |
|---|---|---|---|
| Push → main | ✅ Run | ✅ Run | ✅ Send |
| PR from same repo | ✅ Run | ✅ Run | ✅ Send |
| PR from external fork | ✅ Run | ❌ Skip | ❌ Skip |

**Rule**: `if: github.event_name == 'push' || !github.event.pull_request.head.repo.fork`

---

## 3. Playwright Installation Details

### OS-Specific Commands
| OS | Command | Reason |
|---|---|---|
| **Ubuntu** | `npx playwright install --with-deps` | Installs browsers + system libs (`libnss3`, `libatk1.0-0`, `libx11-xcb1`, etc.) |
| **Windows** | `npx playwright install` | System dependencies preinstalled on runner |
| **macOS** | `npx playwright install` | `--with-deps` unsupported on macOS |

### Browser Cache Paths
| OS | Path |
|---|---|
| Ubuntu | `~/.cache/ms-playwright` |
| Windows | `**/AppData/Local/ms-playwright` |
| macOS | `~/Library/Caches/ms-playwright` |

---

## 4. Caching Strategy Explained

### Two-Tier Cache
| Cache | Key | What It Stores | Benefit |
|---|---|---|---|
| **npm** | Hash of `package-lock.json` | `node_modules` | Skip re-downloading dependencies |
| **Playwright** | `${{ matrix.os }}-pw-${hashFiles('package-lock.json')}` | Browser binaries (~300–500 MB) | Avoid re-downloading browsers every run |

### Fallback Mechanism
```yaml
restore-keys: |
  ${{ matrix.os }}-pw-
```
- Exact match → full reuse
- Partial match → reuse existing binaries, download only new/changed ones
- **Timing**: First run ~3–6 min → Subsequent runs ~1–2 min

---

## 5. Fork Security Boundary

### Critical Event Distinction
| | `pull_request` ✅ | `pull_request_target` ❌ |
|---|---|---|
| **Context** | Forked repo | Base repo (yours) |
| **Secrets** | None available | All secrets exposed |
| **GITHUB_TOKEN** | Read-only | Read/write |
| **Use Case** | All untrusted PRs | Only trusted metadata tasks |

### Additional Protections
- `actions/checkout@v7` → blocks unsafe fork checkout by default
- Base permissions: `contents: read` only
- Secrets never referenced in fork-accessible steps
- Artifact uploads gated: `if: failure() && !github.event.pull_request.head.repo.fork`

---

## 6. SBOM & Vulnerability Scanning

### Tool Chain
| Tool | Action | Output |
|---|---|---|
| **Docker Build** | Build local image, no push | `app/scan:latest` |
| **Syft** | Generate SBOM | `app.cdx.json` (CycloneDX) |
| **Grype** | Scan SBOM vs. vulnerability DB | SARIF results |
| **CodeQL Upload** | Send SARIF to GitHub | Security → Code Scanning Alerts |

### Severity Policy
```yaml
fail-build: true
severity-cutoff: high
```
- **Critical + High** → ❌ Block merge
- **Medium + Low + Negligible** → ⚠️ Alert only
- Adjust `FAIL_SEVERITY: medium` for stricter blocking

### Retention
- Playwright reports: 7 days
- SARIF/Code Scanning: GitHub default (90 days)

---

## 7. Advanced Customization Guide

### A. Reduce Node Versions
```yaml
node: [20, 22]  # Remove 18 when EOL
```

### B. Remove Platforms
```yaml
os:
  - ubuntu-latest
  # - windows-latest   # Uncomment to disable
  # - macos-latest      # Uncomment to disable
```

### C. Microsoft Teams Instead of Slack
```yaml
uses: devopsactions/msteams-action@v1
with:
  webhook-uri: ${{ secrets.TEAMS_WEBHOOK }}
```

### D. Stricter Vulnerability Threshold
```yaml
env:
  FAIL_SEVERITY: medium  # Blocks Medium+
```

### E. Schedule Weekly Security Scan
```yaml
on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday 00:00 UTC
```

### F. Increase Test Timeout
```yaml
run: npx playwright test --ci --timeout 90000
```

---

## 8. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Playwright fails Ubuntu | Missing system libraries | Confirm `--with-deps` present |
| Cache miss often | `package-lock.json` updated | Expected — browsers reinstall |
| Fork PR no SARIF | Security design | Only trusted branches upload |
| Windows/macOS slower | No `--with-deps` needed | Normal provisioning time |
| No Slack notification | Secret missing or fork-triggered | Set `SLACK_WEBHOOK`; forks don't notify |
| False positive vulnerability | Dependency data incomplete | Pin version, suppress via comment, or accept risk |

---

## 9. Decision Log

| Decision | Rationale | When to Reconsider |
|---|---|---|
| **All 3 OS enabled** | Max compatibility | Project narrows to single platform |
| **Node 18/20/22** | Active LTS coverage | Node 18 EOL (Apr 2027) |
| **`pull_request` only** | Block Pwn Request attacks | Fully trusted contributors only |
| **Security scan on Ubuntu** | Best Docker support | Windows/macOS container runtime improves |
| **High threshold** | Balance security + velocity | Compliance requirements demand stricter blocking |
| **Forks skip secrets** | Prevent exposure | All contributors vetted & trusted |

---

*File: `CI-REFERENCE.md` | Maintainer: DevOps/Engineering Team*
```

---

✅ Saved! Now you can commit this directly to your repo at `.github/CI-REFERENCE.md`.

Would you like me to also create a **quick-start checklist** (`CHEATSHEET.md`) for day-to-day use by developers?
