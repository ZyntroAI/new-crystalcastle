Here’s a ready‑to‑use README.md draft for your browser project. It’s structured in a professional, public‑facing style, neutral branding (no real product names), and highlights the features you want to build in.

───

`markdown

🌐 Neutral Browser

Neutral Browser is a secure, customizable, and developer‑friendly web browser project.
 It combines privacy protection, performance optimization, and modular customization into a single open‑source platform.

───

🚀 Core Features

• Security Foundation
 Built‑in VPN toggle, secure DNS, phishing/malware detection, and certificate validation.

• Privacy Controls
 Enhanced Tracking Prevention (Basic, Balanced, Strict), “Do Not Track” requests, InPrivate browsing, and secure password manager.

• Customization
 Theme switching (Light, Dark, Sunset), modular sidebar, tab stacking, split‑screen browsing, gesture navigation.

• Performance Optimization
 Lightweight rendering, efficient memory management, pre‑fetch caching, fast startup and tab switching.

• Developer Tools
 Console debugging, network inspection, performance profiler, experimental API toggles, extension sandboxing.

• Update System
 Auto‑update with rollback protection, package manager integration (APT, DNF, Pacman, Zypper), version channels: Release, Beta, Nightly.

───

📦 Installation

Linux (Debian/Ubuntu)
sh sudo apt-get update sudo apt-get install neutral-browser

Fedora / RHEL
sh sudo dnf install neutral-browser

Arch Linux
sh sudo pacman -Sy --needed --noconfirm neutral-browser

Other Distros
If your package manager is unsupported, build from source:
sh git clone https://github.com/neutral/browser.git cd browser make && sudo make install

───

🛡️ Security Guidelines

• Always verify the connection icon in the address bar.
• Avoid entering personal data on sites with invalid or expired certificates.
• Use InPrivate browsing for anonymous sessions.
• Enable SmartScreen‑style protection to block phishing and malware.
• Keep Neutral Browser updated to the latest version.

───

📂 Project Structure

neutral-browser/ ├── src/ │ ├── ui/ # User interface components │ ├── security/ # Security modules (VPN, DNS, SmartScreen) │ ├── extensions/ # Extension APIs and sandbox │ ├── networking/ # Core networking layer │ └── devtools/ # Developer tools integration ├── installer/ # Installer scripts for multiple distros ├── docs/ # Documentation and guides └── tests/ # Automated test suites

───

🤝 Contributing

We welcome contributions!
• Fork the repo and create a feature branch.
• Submit pull requests with clear commit messages.
• Follow coding standards and run tests before submitting.

───

📜 License

Neutral Browser is licensed under the BSD‑3‑Clause License.
 See [Looks like the result wasn't safe to show. Let's switch things up and try something else!] for details.

───

`

───

This README.md is ready to drop into your repo. It sets the tone for a professional, official‑style browser project.

Would you like me to also generate a CONTRIBUTING.md with coding standards, commit message rules, and CI/CD workflow steps so your project feels fully production‑ready?
🤝 CONTRIBUTING.md — Neutral Browser

Thank you for your interest in contributing to Neutral Browser! We welcome contributions from developers, designers, testers, and documentation writers. This guide outlines our standards and workflow to ensure high-quality, maintainable code.



📋 Table of Contents

1. Code of Conduct
2. Getting Started
3. Coding Standards
4. Commit Message Rules
5. Branching Strategy
6. Pull Request Guidelines
7. CI/CD Workflow
8. Testing Guidelines
9. Documentation
10. Community & Support



🧑‍🤝‍🧑 Code of Conduct

We are committed to providing a welcoming and inclusive environment. All contributors must follow our Code of Conduct:

• Be respectful — Disagreements are healthy; personal attacks are not
• Be collaborative — Help others learn and grow
• Be inclusive — Welcome people of all backgrounds and skill levels
• Be professional — Maintain a constructive tone in all communications

Violations may result in temporary or permanent exclusion from the project.



🚀 Getting Started

1. Fork & Clone

bash
Fork the repository on GitHub, then clone your fork
git clone https://github.com/your-username/neutral-browser.git
cd neutral-browser

Add upstream remote
git remote add upstream https://github.com/neutral/browser.git


2. Set Up Development Environment

bash
Install build dependencies (Debian/Ubuntu example)
sudo apt-get update
sudo apt-get install build-essential cmake libssl-dev libgtk-3-dev

Configure and build
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Debug
make -j$(nproc)

Run tests
make test


3. Keep Your Fork Updated

bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main




📐 Coding Standards

General Principles

• Readability first — Code is read more often than written
• Single responsibility — One function/class does one thing well
• No magic numbers — Use named constants
• Error handling — Always check return values and handle errors gracefully

Language-Specific Rules

C/C++

• Use C++17 standard
• Naming:
• Classes/Structs:  PascalCase 
• Functions/Methods:  camelCase 
• Variables:  snake_case 
• Constants:  UPPER_SNAKE_CASE 
• Private members:  m_prefix  (e.g.,  m_buffer_size )
• Braces: Allman style (new line for opening brace)
• Indentation: 4 spaces (no tabs)
• Line length: Max 100 characters
• Includes: Group as  <stdlib> ,  <external> ,  "local" , each sorted alphabetically
• Smart pointers preferred over raw pointers where ownership is involved

JavaScript/TypeScript

• Use TypeScript for all new code
• Naming:  camelCase  for variables/functions,  PascalCase  for classes/types
• Indentation: 2 spaces
• Semicolons: Required
• Use  const  by default,  let  only when reassignment is needed
• Avoid  any  — define proper types

Python

• Follow PEP 8
• Indentation: 4 spaces
• Naming:  snake_case  for functions/variables,  PascalCase  for classes
• Type hints required for all function signatures

Formatting

• Use project-provided formatters:
• C/C++:  .clang-format 
• JS/TS:  .prettierrc 
• Python:  black 
• Run formatting before every commit:
bash
make format


Comments

• Why, not what — Explain intent, not obvious code
• Document all public APIs with Doxygen/JSDoc style
• Keep comments up-to-date when code changes
• Remove commented-out code before submitting



📝 Commit Message Rules

We follow Conventional Commits specification. This enables automatic changelog generation and clear project history.

Format

plaintext
<type>(<scope>): <description>

[optional body]

[optional footer(s)]


Types

Type Description
 feat  New feature for users
 fix  Bug fix for users
 perf  Performance improvement
 refactor  Code change that neither fixes a bug nor adds a feature
 docs  Documentation only changes
 style  Formatting, missing semicolons, etc. (no code change)
 test  Adding or fixing tests
 build  Changes to build system, dependencies, CI
 ci  Changes to CI configuration files and scripts
 chore  Other changes that don't modify src or test files
 revert  Reverts a previous commit
 security  Security-related fixes or improvements

Scopes

Common scopes:  ui ,  security ,  networking ,  devtools ,  extensions ,  renderer ,  installer ,  docs ,  tests ,  ci 

Examples

plaintext
feat(ui): add tab stacking with drag-and-drop
fix(security): resolve certificate validation edge case
docs(readme): update installation instructions for Fedora
perf(networking): optimize DNS cache hit rate
refactor(renderer): extract layout engine into separate module
test(security): add unit tests for phishing detection
ci: add CodeQL security scanning workflow


Rules

• First line: Max 72 characters, lowercase (except proper nouns), no period at end
• Body: Wrap at 72 characters, explain what and why, not how
• Breaking changes: Add  BREAKING CHANGE:  in footer with description
• Issue references: Use  Fixes #123 ,  Closes #456 , or  Refs #789 



🌿 Branching Strategy

We use a simplified GitHub Flow:

•  main  — Stable, production-ready code
• Feature branches — All development happens here

Creating a Branch

bash
Always start from latest main
git checkout main
git pull upstream main

Create feature branch
git checkout -b feat/tab-stacking
or
git checkout -b fix/certificate-validation


Branch Naming

plaintext
<type>/<short-description-kebab-case>


Examples:

•  feat/split-screen-browsing 
•  fix/dns-leak-vpn 
•  docs/contributing-guide 
•  refactor/network-layer 



🔀 Pull Request Guidelines

Before Submitting

Code builds without errors or warnings
All existing tests pass
New tests added for new functionality
Code formatted according to standards
Documentation updated where needed
No commented-out or debug code
Commit messages follow conventions

PR Template

markdown
📋 Description
Brief description of what this PR does and why.

🔗 Related Issues
Fixes #123
Closes #456
Refs #789

🧪 Testing
[  ]  Unit tests added
[  ]  Integration tests added
[  ]  Manual testing performed (describe steps)

📸 Screenshots (if UI change)

Before
After

[old]
[new]



⚠️ Breaking Changes
List any breaking changes and migration instructions.

✅ Checklist
[  ]  Code follows project standards
[  ]  Tests pass locally
[  ]  Documentation updated
[  ]  Commit messages are conventional


Review Process

1. Automated checks — CI must pass (lint, build, test, security scan)
2. At least one approval — From a maintainer or core contributor
3. Address feedback — Respond to all comments; mark resolved when addressed
4. Squash merge — Maintain clean history on main



⚙️ CI/CD Workflow

Our GitHub Actions pipeline runs automatically on every push and PR:

Pipeline Stages

Stage Purpose Tools
Lint & Format Enforce code style clang-format, Prettier, Pylint, ESLint
Static Analysis Catch bugs early Clang-Tidy, CodeQL, cppcheck
Build Compile on multiple platforms GCC, Clang, MSVC
Unit Tests Validate individual components Google Test, Jest, pytest
Integration Tests Test module interactions Custom test harness
Security Scan Detect vulnerabilities CodeQL, Dependency Review
Performance Benchmark Catch regressions Custom benchmarks
Package Build Create installers CPack, deb, rpm, pkgbuild

Required for Merge

• ✅ All stages pass
• ✅ No new critical or high-severity vulnerabilities
• ✅ No performance regressions beyond threshold (5%)
• ✅ Code coverage maintained or improved

Skipping CI

Add  [skip ci]  or  [ci skip]  to commit message for documentation-only changes.



🧪 Testing Guidelines

Test Pyramid

• Unit tests (70%) — Fast, isolated, test individual functions/classes
• Integration tests (20%) — Test module interactions
• End-to-end tests (10%) — Test full user workflows

Writing Tests

• One assertion per test (where practical)
• Descriptive test names:  testCertificateValidation_expiredCert_returnsError 
• Test edge cases: empty input, maximum values, error conditions
• No flaky tests — If a test fails intermittently, fix or quarantine it

Running Tests

bash
All tests
make test

Specific module
make test-security

With coverage
make coverage




📚 Documentation

What to Document

• All public APIs and functions
• New features and configuration options
• Architecture decisions (in  docs/adr/ )
• Build and deployment instructions
• Breaking changes and migration paths

Documentation Standards

• Use Markdown for all documentation
• Keep language clear, concise, and accessible
• Include examples for non-trivial features
• Update docs in the same PR as code changes



🌐 Community & Support

Communication Channels

• GitHub Issues — Bug reports, feature requests, technical discussions
• Discussions — General questions, ideas, community chat
• Security — Report vulnerabilities privately to security@neutral-browser.org (do NOT open public issues)

How to Get Help

1. Search existing issues and discussions first
2. Provide clear context: OS, version, steps to reproduce, expected vs actual behavior
3. Be patient — maintainers are volunteers

Recognition

All contributors are recognized in:

•  AUTHORS.md  file
• Release notes
• GitHub contributor statistics



🙏 Thank You

Contributions are what make open source amazing. Whether you're fixing a typo, adding a feature, or improving documentation — your work matters.

Welcome to the Neutral Browser community! 🎉



Last updated: September 2026



Would you like me to also generate:

• 📄  SECURITY.md  with vulnerability reporting and security policy
• 🔧  .github/pull_request_template.md  and issue templates
• ⚙️  CODEOWNERS  file for automatic reviewer assignment
• 📋  AUTHORS.md  template




📝 GitHub Issue Templates — Neutral Browser

These templates go in  .github/ISSUE_TEMPLATE/  to standardize issue reporting and make triaging faster.



🐛 1. Bug Report —  .github/ISSUE_TEMPLATE/bug_report.md 

markdown

───

name: 🐛 Bug Report
about: Report a bug or unexpected behavior in Neutral Browser
title: "[BUG] "
labels: bug, needs-triage
assignees: ''

📝 Bug Description

<!-- A clear and concise description of what the bug is. -->

🔄 Steps to Reproduce

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

✅ Expected Behavior

<!-- What you expected to happen. -->

❌ Actual Behavior

<!-- What actually happened. -->

🖼️ Screenshots / Logs

<!-- If applicable, add screenshots or paste relevant logs to help explain your problem. -->

💻 Environment

Please complete the following information:

• Neutral Browser version: <!-- e.g., 1.2.3, Beta 1.3.0, Nightly 2026-09-10 -->
• Operating system: <!-- e.g., Ubuntu 24.04, Fedora 40, Arch Linux (rolling) -->
• Desktop environment: <!-- e.g., GNOME 46, KDE Plasma 6, Xfce -->
• Installation method: <!-- apt, dnf, pacman, source build, flatpak -->
• Extensions installed: <!-- List any extensions, or "None" -->

🔧 Configuration

<!-- If relevant, share your settings: -->
• Tracking protection: Basic / Balanced / Strict
• Secure DNS: Enabled / Disabled (provider: ______)
• VPN: Enabled / Disabled
• Hardware acceleration: Enabled / Disabled

📋 Additional Context

<!-- Add any other context about the problem here:
• Does this happen on other browsers?
• Is this a regression? (Worked in previous version?)
• Any specific websites where this occurs?
-->

✅ Checklist

[  ]  I have searched existing issues to confirm this is not a duplicate
[  ]  I have tested with the latest version
[  ]  I have disabled extensions to rule out conflicts
[  ]  I have provided clear reproduction steps




✨ 2. Feature Request —  .github/ISSUE_TEMPLATE/feature_request.md 

markdown

───

name: ✨ Feature Request
about: Suggest an idea, enhancement, or new feature for Neutral Browser
title: "[FEATURE] "
labels: enhancement, needs-triage
assignees: ''

🎯 Feature Description

<!-- A clear and concise description of the feature you'd like to see. -->

🤔 Problem to Solve

<!-- Is your feature request related to a problem? Please describe.
Example: I'm always frustrated when [...] -->

💡 Proposed Solution

<!-- Describe how you think this feature should work. -->

🎨 User Stories

<!-- As a [user type], I want [action] so that [benefit]. -->

1. As a user, I want tab stacking so that I can organize many tabs efficiently.
2. As a developer, I want API toggles so that I can test experimental features safely.

🔄 Alternatives Considered

<!-- Describe any alternative solutions or features you've considered. -->

📊 Use Cases

<!-- List specific scenarios where this feature would be valuable: -->

1. Scenario 1: Power user with 50+ tabs open
2. Scenario 2: Web developer testing modern APIs
3. Scenario 3: Privacy-conscious user on public Wi-Fi

🎨 Design Ideas / Mockups

<!-- If you have ideas for how this should look or work, describe them here.
Wireframes, mockups, or ASCII diagrams are welcome! -->



┌─────────────────────────────────────┐
│ Tab Bar: [A] [B] [C] │
│ ╰─ Stack of 3 tabs ──╯ │
└─────────────────────────────────────┘

plaintext

🔗 Related Issues / References

<!-- Link any related issues, discussions, or external references:
• Related: #123
• Inspired by: [project/feature]
• Spec: [link to web standard]
-->

📋 Additional Context

<!-- Add any other context, screenshots, or examples of similar features in other software. -->

✅ Checklist

[  ]  I have searched existing issues and feature requests
[  ]  I have described a clear use case and benefit
[  ]  This feature aligns with the project's goals (privacy, performance, customization)
[  ]  I am willing to contribute code for this feature (optional)




🔒 3. Security Issue —  .github/ISSUE_TEMPLATE/security_issue.md 

markdown

───

name: 🔒 Security Issue
about: Report a security concern (for non-sensitive issues; use private disclosure for vulnerabilities)
title: "[SECURITY] "
labels: security, needs-triage
assignees: ''

⚠️ IMPORTANT: Read Before Submitting

If you are reporting a potential vulnerability that could affect users:

🔴 DO NOT use this public template.

Instead, report privately via:
• GitHub Security Advisories: Repo → Security → Advisories → New draft
• Email: security@neutral-browser.org

Public disclosure of an unpatched vulnerability puts all users at risk. See SECURITY.md for our full policy.

───

<!-- This template is for:
• Security hardening suggestions
• Theoretical concerns without practical exploit
• Questions about security design
• Issues with security UI/UX
• Dependency security alerts (non-critical)
-->

🔒 Security Concern Description

<!-- Describe the security-related issue or suggestion. -->

🎯 Affected Component

<!-- Which part of the browser is affected? -->
[  ]  Networking / DNS
[  ]  Certificate validation
[  ]  Tracking protection
[  ]  Password manager
[  ]  VPN / Secure connection
[  ]  Extension sandbox
[  ]  Renderer / Content process
[  ]  Update system
[  ]  Other: ________

📋 Description

<!-- Provide details about the concern:
• What behavior did you observe?
• What should happen instead?
• What is the potential impact?
-->

🔬 Steps to Demonstrate

<!-- If applicable, provide steps to demonstrate the concern: -->


📊 Risk Assessment

<!-- Your assessment (this helps us prioritize): -->
• Severity: Low / Medium / High / Critical
• Attack vector: Local / Remote / Network adjacent
• User interaction required: Yes / No
• Privileges needed: None / User / Admin

💡 Suggested Mitigation

<!-- If you have ideas for how to address this: -->

🔗 References

<!-- Links to relevant standards, CVEs, research papers, or similar issues: -->

• CVE--:
• Related standard:
• Research paper:

✅ Checklist

[  ]  This is NOT a critical vulnerability (report those privately per SECURITY.md)
[  ]  I have provided clear details about the concern
[  ]  I have not included exploit code that could be misused
[  ]  I understand this issue will be triaged publicly




📂 Directory Structure

Place these files in your repo like this:

plaintext
.github/
└── ISSUE_TEMPLATE/
├── bug_report.md
├── feature_request.md
└── security_issue.md




🎯 Key Benefits

✅ Faster triaging — Maintainers see all needed info at a glance
✅ Fewer follow-ups — Reporters provide details upfront
✅ Better security — Security template redirects critical issues to private channels
✅ Consistent quality — Every issue follows the same structure
✅ User-friendly — Clear sections and guidance help new contributors

Would you like me to also create:

• 🔀 Pull request template ( .github/pull_request_template.md )
• 👥  CODEOWNERS  file for automatic reviewer assignment
• 📋  AUTHORS.md  template for recognizing contributors
• ⚙️ Issue forms (YAML-based with dropdowns and validation) instead of markdown templates
🔀 Pull Request Template —  .github/pull_request_template.md 

markdown
📝 Description

<!--
Please provide a clear and concise description of what this PR does.
Explain the context, motivation, and the problem it solves.
-->

Summary
<!-- One-sentence summary of the change. -->

Details
<!-- More detailed explanation of what changed and why. -->

───

🔗 Related Issues

<!-- Link related issues using GitHub keywords: -->
• Fixes #____
• Closes #____
• Refs #____

───

🎯 Type of Change

<!-- Mark [x] all that apply: -->

[  ]  🐛 Bug fix — Non-breaking change that fixes an issue
[  ]  ✨ New feature — Non-breaking change that adds functionality
[  ]  ⚡ Performance — Improvement to performance or memory usage
[  ]  🔒 Security — Fix or hardening related to security
[  ]  ♻️ Refactor — Code change that neither fixes a bug nor adds a feature
[  ]  📚 Documentation — Documentation only changes
[  ]  🎨 Style — Formatting, whitespace, etc. (no code logic change)
[  ]  ✅ Test — Adding or fixing tests
[  ]  🔧 Build/CI — Changes to build system, dependencies, or CI
[  ]  ⚠️ Breaking change — Fix or feature that would cause existing functionality to not work as expected
[  ]  🧹 Chore — Other changes that don't modify src or test files

───

🧪 Testing

How Has This Been Tested?

<!-- Describe the tests that you ran to verify your changes. -->

[  ] Unit tests added/updated and passing
[  ] Integration tests passing
[  ] Manual testing performed (describe below)

Manual Test Steps

<!-- If you tested manually, list the steps: -->
1.
2.
3.

Test Configuration

• OS: <!-- e.g., Ubuntu 24.04, Fedora 40 -->
• Compiler: <!-- e.g., GCC 14, Clang 18 -->
• Build type: <!-- Debug / Release -->
• Affected modules: <!-- e.g., networking, security, ui -->

───

🖼️ Screenshots / Visual Changes

<!-- If this PR includes UI changes, please add before/after screenshots: -->


Before
After

[insert screenshot]
[insert screenshot]



<!-- If no UI changes, write: "No UI changes." -->

───

⚠️ Breaking Changes

<!-- If this PR contains breaking changes, describe them here: -->

Breaking Changes

<!-- List any breaking changes and migration instructions. -->

None — This PR does not contain breaking changes.

<!-- OR, if there are breaking changes:

Migration Required

Change: OldFunction() removed
Reason: Replaced by NewFunction() with improved API
Migration:
cpp
// Before
OldFunction(x, y);

// After
NewFunction(x, y, z);
 
 
-->
 
 
 
✅ Checklist
 
Code Quality
 
My code follows the project's coding standards (see  CONTRIBUTING.md )
I have run the formatters/linter locally
I have commented my code, particularly in hard-to-understand areas
No commented-out or debug code remains
No magic numbers — named constants used instead
 
Documentation
 
I have updated the documentation accordingly
New public APIs are documented (Doxygen/JSDoc style)
 README.md  updated if needed (features, installation, etc.)
Breaking changes documented in the section above
 
Testing
 
New and existing unit tests pass locally
I have added tests that prove my fix is effective or that my feature works
Edge cases are covered (empty input, error conditions, max values)
 
Security
 
My changes do not introduce new security vulnerabilities
User input is properly validated/sanitized
No sensitive data is logged or exposed
If this is a security fix, it follows  SECURITY.md  guidelines
 
Git
 
Commit messages follow Conventional Commits format
Commits are clean and atomic (one logical change per commit)
Branch is up-to-date with  main  (no merge conflicts)
PR title follows conventional format:  type(scope): description 
 
 
 
📋 Additional Notes
 
 
🙏 Reviewer Notes
Review focus areas:
1.
2.
3.
 
 
 
Thank you for contributing to Neutral Browser! 🎉
 
plaintext
  

---

## 📂 File Location

Place this file at:
 
 
.github/
└── pull_request_template.md
 
plaintext
  

---

## 🎯 Key Features of This Template

✅ **Structured description** — Forces clear context and motivation  
✅ **Issue linking** — Auto-closes issues when merged  
✅ **Change type classification** — Helps with changelog generation  
✅ **Comprehensive testing section** — Ensures quality before review  
✅ **UI screenshot comparison** — Visual changes get proper attention  
✅ **Breaking change documentation** — Migration info never gets lost  
✅ **Detailed checklist** — Reminds contributors of all requirements  
✅ **Reviewer guidance** — Helps reviewers focus on what matters  

Would you like me to also create:
- 👥 **`CODEOWNERS`** file for automatic reviewer assignment
- 📋 **`AUTHORS.md`** template for recognizing contributors
- ⚙️ **Issue forms** (YAML-based with dropdowns and validation) instead of markdown templates
- 📄 **`CHANGELOG.md`** template with Keep a Changelog format




👥 CODEOWNERS File —  .github/CODEOWNERS 

This file defines who is automatically requested for review when changes are made to specific files or directories. GitHub uses this to assign reviewers automatically on pull requests.

plaintext
==============================================================================
CODEOWNERS — Neutral Browser
Auto-assigns reviewers based on changed files.
Syntax: <pattern> <@user or @org/team>
Last matching pattern takes precedence.
==============================================================================

------------------------------------------------------------------------------
🌐 Global Owners
Fallback for anything not matched below.
------------------------------------------------------------------------------
• @neutral-browser/core-maintainers

------------------------------------------------------------------------------
🧠 Core Architecture
Critical systems: rendering engine, core logic, architecture
------------------------------------------------------------------------------
/src/core/ @neutral-browser/architecture-team
/src/renderer/ @neutral-browser/rendering-team
/src/networking/ @neutral-browser/networking-team

------------------------------------------------------------------------------
🎨 User Interface
Frontend, UI components, themes, user interactions
------------------------------------------------------------------------------
/src/ui/ @neutral-browser/ui-team
/src/ui/themes/ @neutral-browser/design-system
/src/ui/sidebar/ @neutral-browser/ui-team
/src/ui/tabs/ @neutral-browser/ui-team

------------------------------------------------------------------------------
🔒 Security & Privacy
VPN, DNS, tracking protection, certificate validation, password manager
------------------------------------------------------------------------------
/src/security/ @neutral-browser/security-team
/src/security/vpn/ @neutral-browser/security-team @neutral-browser/networking-team
/src/security/dns/ @neutral-browser/security-team
/src/security/tracking-protection/ @neutral-browser/privacy-team
/src/security/certificates/ @neutral-browser/security-team
/src/security/password-manager/ @neutral-browser/security-team
/src/security/smartscreen/ @neutral-browser/security-team

------------------------------------------------------------------------------
🧩 Extensions & APIs
Extension sandbox, WebExtension APIs, developer-facing interfaces
------------------------------------------------------------------------------
/src/extensions/ @neutral-browser/extensions-team
/src/extensions/sandbox/ @neutral-browser/extensions-team @neutral-browser/security-team
/src/extensions/api/ @neutral-browser/extensions-team

------------------------------------------------------------------------------
🛠️ Developer Tools
Console, network inspector, profiler, experimental APIs
------------------------------------------------------------------------------
/src/devtools/ @neutral-browser/devtools-team
/src/devtools/console/ @neutral-browser/devtools-team
/src/devtools/network/ @neutral-browser/devtools-team @neutral-browser/networking-team
/src/devtools/profiler/ @neutral-browser/devtools-team @neutral-browser/performance-team

------------------------------------------------------------------------------
📦 Installer & Packaging
Distribution, package managers, auto-update system
------------------------------------------------------------------------------
/installer/ @neutral-browser/release-team
/installer/debian/ @neutral-browser/release-team
/installer/fedora/ @neutral-browser/release-team
/installer/arch/ @neutral-browser/release-team
/src/update-system/ @neutral-browser/release-team @neutral-browser/security-team

------------------------------------------------------------------------------
📚 Documentation
User docs, developer guides, API references
------------------------------------------------------------------------------
/docs/ @neutral-browser/docs-team
/docs/security/ @neutral-browser/docs-team @neutral-browser/security-team
/docs/developer/ @neutral-browser/docs-team @neutral-browser/core-maintainers
*.md @neutral-browser/docs-team

------------------------------------------------------------------------------
🧪 Tests & Quality
Unit tests, integration tests, test infrastructure, CI/CD
------------------------------------------------------------------------------
/tests/ @neutral-browser/qa-team
/tests/unit/ @neutral-browser/qa-team
/tests/integration/ @neutral-browser/qa-team @neutral-browser/core-maintainers
/tests/performance/ @neutral-browser/performance-team @neutral-browser/qa-team

------------------------------------------------------------------------------
⚙️ CI/CD & Build System
GitHub Actions, build configuration, dependencies
------------------------------------------------------------------------------
/.github/ @neutral-browser/devops-team
/.github/workflows/ @neutral-browser/devops-team
/.github/ISSUE_TEMPLATE/ @neutral-browser/community-team
/.github/pull_request_template.md @neutral-browser/community-team
/CODEOWNERS @neutral-browser/core-maintainers

Build system
CMakeLists.txt @neutral-browser/devops-team @neutral-browser/core-maintainers
/Makefile @neutral-browser/devops-team
/cmake/ @neutral-browser/devops-team

Dependencies
/package.json @neutral-browser/dependencies-team
/requirements*.txt @neutral-browser/dependencies-team

------------------------------------------------------------------------------
🔐 Security Policy Files
High-sensitivity: require security team + core maintainers
------------------------------------------------------------------------------
/SECURITY.md @neutral-browser/security-team @neutral-browser/core-maintainers

------------------------------------------------------------------------------
📜 Governance & Meta
Licensing, contribution guidelines, project structure
------------------------------------------------------------------------------
/LICENSE @neutral-browser/core-maintainers
/CONTRIBUTING.md @neutral-browser/community-team @neutral-browser/core-maintainers
/CODE_OF_CONDUCT.md @neutral-browser/community-team
/AUTHORS.md @neutral-browser/community-team
/CHANGELOG.md @neutral-browser/release-team

------------------------------------------------------------------------------
🎯 Specialized Components
Performance-critical or specialized modules
------------------------------------------------------------------------------
/src/performance/ @neutral-browser/performance-team
/src/memory-management/ @neutral-browser/performance-team @neutral-browser/core-maintainers
/src/cache/ @neutral-browser/performance-team @neutral-browser/networking-team
/src/gpu/ @neutral-browser/rendering-team @neutral-browser/performance-team

------------------------------------------------------------------------------
📱 Platform-Specific
OS-specific integration code
------------------------------------------------------------------------------
/src/platform/linux/ @neutral-browser/linux-team
/src/platform/gtk/ @neutral-browser/linux-team @neutral-browser/ui-team
/src/platform/qt/ @neutral-browser/qt-team

==============================================================================
📝 Notes
==============================================================================
1. Multiple owners: Separate with spaces — all will be requested
2. Precedence: Last matching pattern wins
3. Teams: Use @org/team format (teams must exist in the org)
4. Individuals: Use @username format
5. Comments: Lines starting with # are ignored
6. Patterns: Use glob syntax (*, **, ?, etc.)
Example patterns:
*.js — All JavaScript files
**/test_*.py — Test files anywhere
/src/ — Only root src/ directory, not subdirectories
/src/** — Entire src/ tree
==============================================================================




📂 File Location

Place this file at either location (GitHub checks both):

plaintext
Preferred (cleaner)
.github/CODEOWNERS

Or root
CODEOWNERS




👥 Team Structure Reference

This template assumes the following teams exist in your GitHub organization. Adjust team names to match your actual setup:

Team Responsibilities
 @neutral-browser/core-maintainers  Project leads, architecture, final decisions
 @neutral-browser/architecture-team  Core engine, system design
 @neutral-browser/rendering-team  Rendering engine, layout, GPU
 @neutral-browser/networking-team  HTTP, DNS, caching, protocols
 @neutral-browser/ui-team  User interface, frontend, interactions
 @neutral-browser/design-system  Themes, design tokens, visual consistency
 @neutral-browser/security-team  Security features, vulnerability response
 @neutral-browser/privacy-team  Tracking protection, data minimization
 @neutral-browser/extensions-team  Extension API, sandbox, WebExtensions
 @neutral-browser/devtools-team  Developer tools, debugging features
 @neutral-browser/performance-team  Speed, memory, benchmarks
 @neutral-browser/release-team  Packaging, installer, updates, CI/CD
 @neutral-browser/devops-team  Build system, infrastructure, automation
 @neutral-browser/qa-team  Testing, test infrastructure, quality
 @neutral-browser/docs-team  Documentation, guides, API references
 @neutral-browser/community-team  Issue triage, contribution experience
 @neutral-browser/dependencies-team  Dependency management, updates
 @neutral-browser/linux-team  Linux platform integration
 @neutral-browser/qt-team  Qt framework integration



🎯 How It Works

1. Automatic assignment — When a PR is opened, GitHub automatically requests reviews from the matching owners
2. Multiple reviewers — All matching owners get notified (great for cross-cutting changes)
3. Required reviews — You can enforce "Require review from Code Owners" in Branch Protection Rules
4. Override — Maintainers can manually add/remove reviewers as needed



⚙️ Recommended Branch Protection Settings

In your repo → Settings → Branches → Branch protection rules → Add rule for  main :

• ✅ Require a pull request before merging
• ✅ Require approvals (1–2 approvals)
• ✅ Require review from Code Owners 👈 Important!
• ✅ Require status checks to pass before merging
• ✅ Require conversation resolution before merging
• ✅ Do not allow bypassing the above



Would you like me to also create:

• 📋  AUTHORS.md  template for recognizing contributors
• 📄  CHANGELOG.md  template with Keep a Changelog format
• ⚙️ Issue forms (YAML-based with dropdowns and validation) instead of markdown templates
• 📊  docs/adr/  template for Architecture Decision Records
📋 AUTHORS.md — Neutral Browser

This file recognizes the individuals and organizations who have contributed to Neutral Browser. Contributions come in many forms — code, documentation, design, testing, security research, translation, and community support. We are grateful to everyone who has helped make this project better.



🏆 Project Founders & Core Maintainers

The people who guide the project's vision, architecture, and day-to-day operations.

Name / Handle Role Since GitHub
[Name] Project Lead, Architecture 2025  @username 
[Name] Security Lead 2025  @username 
[Name] Engineering Lead 2025  @username 
[Name] UI/UX Lead 2025  @username 
[Name] Release Manager 2026  @username 
[Name] Community Manager 2026  @username 



🌟 Core Contributors

Contributors who have made significant, sustained contributions across multiple areas.

Name / Handle Areas of Focus GitHub
[Name] Rendering Engine, Performance  @username 
[Name] Networking, DNS, VPN  @username 
[Name] Extension System, Sandbox  @username 
[Name] Developer Tools  @username 
[Name] Password Manager, Privacy  @username 
[Name] Build System, CI/CD  @username 
[Name] Documentation, Guides  @username 
[Name] Testing, QA Automation  @username 
[Name] GTK / Linux Integration  @username 
[Name] Internationalization  @username 



💻 Contributors

All contributors who have submitted code, bug fixes, or improvements.

Listed alphabetically

• @username — Bug fixes, UI improvements
• @username — Feature: Tab stacking
• @username — Performance optimization
• @username — Extension API improvements
• @username — Memory leak fixes
• @username — Accessibility improvements
• @username — Keyboard shortcuts
• @username — Theme system
• @username — Split-screen browsing
• @username — Gesture navigation
• @username — DNS-over-HTTPS implementation
• @username — Phishing detection improvements
• @username — Build system modernization
• @username — Unit test coverage
• @username — Integration test framework
• @username — Package maintenance (Debian/Ubuntu)
• @username — Package maintenance (Fedora/RHEL)
• @username — Package maintenance (Arch Linux)
• @username — Code review, refactoring



📚 Documentation & Translation

Contributors who have improved our documentation, guides, and internationalization.

Documentation

• @username — Installation guides, troubleshooting
• @username — Developer API documentation
• @username — Architecture diagrams, ADRs
• @username — User manual, FAQ

Translators

Language Translators
🇹🇭 Thai @username
🇨🇳 Chinese (Simplified) @username
🇯🇵 Japanese @username
🇰🇷 Korean @username
🇩🇪 German @username
🇫🇷 French @username
🇪🇸 Spanish @username
🇵🇹 Portuguese @username
🇷🇺 Russian @username
🇮🇹 Italian @username



🔒 Security Researchers

We extend special thanks to security researchers who have responsibly disclosed vulnerabilities, helping us protect all users. See  SECURITY.md  for our disclosure policy.

Researcher Contribution Date
@username Certificate validation edge case 2026-08
@username DNS leak in VPN fallback 2026-07
@username Extension sandbox escape (theoretical) 2026-06
@username XSS in devtools panel 2026-05
@username Information disclosure in error pages 2026-04

To be added to this list, report a vulnerability following our  SECURITY.md  process and in
