🧠 Meta-Skill:  github-coding  — Full GitHub Development Lifecycle
 
Orchestrator Skill: Modular, deterministic, secure — follows your requested structure + least-privilege + gate-controlled destructive actions
 
 
 
📁 Final Structure —  skills/github-coding/ 
 
plaintext
  
skills/github-coding/
├── SKILL.md                     # 📘 Main definition, entry point
├── agents/                      # 🤖 Specialized sub-agents
│   ├── coder.md
│   ├── reviewer.md
│   ├── tester.md
│   ├── debugger.md
│   └── release-manager.md
├── actions/                     # ⚡ Atomic, reusable steps
│   ├── inspect-repo/
│   ├── create-branch/
│   ├── implement/
│   ├── refactor/
│   ├── test/
│   ├── lint/
│   ├── security-scan/
│   ├── commit/
│   ├── push/
│   ├── create-pr/
│   ├── review-pr/
│   ├── update-pr/
│   ├── merge-pr/
│   └── release/
├── policies/                    # 🛡️ Guardrails & rules
│   ├── branch-policy.yaml
│   ├── commit-policy.yaml
│   ├── pr-policy.yaml
│   ├── security-policy.yaml
│   └── merge-policy.yaml        # ✅ Destructive gate: approval-only
├── workflows/                   # 🔄 Composed pipelines
│   ├── coding.yml
│   ├── test.yml
│   ├── review.yml
│   ├── security.yml
│   └── release.yml
├── scripts/                     # 🐍 Helper utilities
│   ├── detect-stack.py
│   ├── run-tests.py
│   ├── check-diff.py
│   ├── generate-pr.py
│   └── release.py
└── tests/                       # ✅ Skill self-validation
    ├── test_branching.py
    ├── test_coding.py
    ├── test_pr.py
    └── test_release.py
 
 
 
 
📄 SKILL.md — Core Definition
 
yaml
  
name: github-coding
type: meta-skill
version: 1.0.0
description: >
  Orchestrates full GitHub dev lifecycle: issue → branch → code → test → lint → scan → commit → PR → review → CI → merge → release.
  Modular sub-skills, deterministic flow, gated destructive actions.

orchestration:
  architecture: layered
  role: orchestrator
  delegates:
    - github-repository
    - github-issues
    - github-branches
    - github-code-review
    - github-testing
    - github-security
    - github-actions
    - github-dependabot
    - github-release

core_commands:
  - github.inspect
  - github.issue.create
  - github.issue.plan
  - github.branch.create
  - github.code.implement
  - github.code.refactor
  - github.code.fix
  - github.test.run
  - github.lint.run
  - github.security.scan
  - github.commit.create
  - github.push
  - github.pr.create
  - github.pr.review
  - github.pr.update
  - github.pr.merge
  - github.release.create

execution_mode:
  mode: autonomous
  detect:
    language: true
    framework: true
    package_manager: true
    test_framework: true
    ci_provider: true
  flow:
    before_code:
      - inspect_repo
      - inspect_git_status
      - inspect_branch
      - inspect_ci
    after_code:
      - format
      - lint
      - test
      - security_scan
      - diff_review
    before_pr:
      require:
        - tests_pass
        - lint_pass
        - security_pass
        - clean_diff
    before_merge:
      require:
        - ci_green
        - review_complete
        - no_conflicts
        - destructive_approval: true  # ✅ Gate
    after_merge:
      - verify_deployment
      - create_release
      - update_changelog
 
 
 
 
🛡️ Permission Model — Secure by Design
 
Destructive actions are NEVER automatic — require explicit policy/gate
 
yaml
  
permissions:
  read:
    - repository
    - branches
    - issues
    - pull_requests
    - workflows
    - releases
    - commits
    - code_scanning
  write:
    - files
    - issues
    - pull_requests
    - comments
    - labels
    - milestones
    - discussions
  execute:
    - tests
    - lint
    - build
    - workflows
    - analysis
  destructive:
    - delete_branch
    - close_issue
    - close_pr
    - merge
    - publish_release
    - force_push
  policy_gates:
    destructive:
      require:
        - human_approval OR high_confidence_score
        - no_critical_alerts
        - audit_log_enabled: true
      reason: >
        Prevent over-smart automation from causing irreversible damage —
        destructive actions must be audited and approved.
 
 
 
 
🔄 Lifecycle Flow (Deterministic)
 
plaintext
  
Issue
  ↓
Analyze Repository / Detect Stack
  ↓
Plan & Estimate
  ↓
Create Feature Branch
  ↓
Implement → Refactor → Fix
  ↓
Format → Lint → Test → Security Scan → Diff Review
  ↓
Commit → Push
  ↓
Create PR (labels, reviewers, linked issue)
  ↓
CI + CodeQL + Dependabot Review
  ↓
AI Reviewer → Human Review
  ↓
✅ Pass? → Fix ↺
  ↓
DESTRUCTIVE GATE: Request Merge Approval
  ↓
Merge → Delete Branch
  ↓
Verify Deployment → Create Release → Update Changelog
 
 
 
 
🧩 Sub-Skill Mapping
 
plaintext
  
github-coding (Orchestrator)
├─ github-repository
├─ github-issues
├─ github-branches
├─ github-code
├─ github-testing
├─ github-lint
├─ github-security
│  ├─ github-codeql
│  └─ github-dependabot
├─ github-pull-request
├─ github-actions
└─ github-release
 
 
 
 
📜 Example Policy:  merge-policy.yaml  (Gate)
 
yaml
  
name: merge-policy
destructive: true
rules:
  - name: prevent-auto-merge
    condition: always
    require_approval: true
  - name: require-ci-green
    conditions:
      - checks: all_passed
  - name: require-review
    conditions:
      - reviews: approved_by_code_owner
  - name: no-conflicts
    conditions:
      - mergeable: true
  - name: no-critical-security
    conditions:
      - code_scan: no_critical_high
 
 
 
 
✅ Why This Works
 
✅ Modular: Not one giant file → maintainable, reusable
✅ Deterministic: Fixed steps + clear gates → predictable
✅ Secure: Destructive actions blocked by default → explicit approval required
✅ Stack-aware: Auto-detects Python/Node/Docker/etc.
✅ CI/CD native: Integrates with your existing workflows
✅ Scalable: Add sub-agents without breaking core
 
 
 
🚀 Ready to Implement
 
This fits your existing  fastapi-python-boilerplate  +  new-crystalcastle  + multi-agent setup perfectly.
 
Want me to output all files as ZIP-ready blocks so you can drop them directly into  skills/github-coding/ ? 📦
