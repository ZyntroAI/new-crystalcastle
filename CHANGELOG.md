# Changelog

All notable changes to this repository. Dates are UTC.

Entries are generated from merged pull requests on `main`, newest first, and grouped by merge date. Each entry cites its pull request number.

Repo layout notes live in [`README.md`](./README.md); architecture in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## [2026-09-11]

### Added
- **PR #142** — feat(skills): add supabase-agent-suite
- **PR #145** — docs(api): add App API Guidelines (v1.0)
- **PR #146** — docs(mcp-tools): add registry, dashboard & MCP architecture diagram

### Security
- **PR #144** — Potential fix for code scanning alert no. 15: Workflow does not contain permissions

## [2026-09-10]

### Added
- **PR #138** — docs: add categorized MCP & AI tools catalog with index
- **PR #141** — feat(skills): add auto-debugging sub-skill to the CrystalCastleX suite

### Changed
- **PR #139** — chore(workflows): auto-move non-workflow files out of .github/workflows

## [2026-09-09]

### Added
- **PR #136** — feat(security): CWE-1321 prototype pollution protection suite

### Changed
- **PR #137** — chore: add open-issue.yml workflow for manual issue creation (workflow_dispatch)

## [2026-09-08]

### Added
- **PR #99** — Create Toolbar.tsx
- **PR #117** — Create apply-branch-protection.yml
- **PR #118** — Add pnpm to .gitignore
- **PR #120** — Create Skill.md
- **PR #128** — test: add no-op test script so CI test step passes
- **PR #129** — feat: add hardened secure python sandbox under scripts/sandbox
- **PR #130** — feat: add AST10 security gates (G2 intent + G3 behavioral sandbox)
- **PR #131** — feat: add python-dev orchestrator (pyflakes static + AST10-sandboxed runtime)
- **PR #132** — docs: add knowledge record for python-dev orchestrator merge
- **PR #133** — feat: wire Slack alerts into G3 sandbox node (AST10)
- **PR #134** — feat: add permission-aware workflow guardian (scripts/workflow_guardian)
- **PR #135** — feat: add CrystalCastleX core skill suite (9 sub-skills + loader)

### Changed
- **PR #122** — Update README.md
- **PR #124** — ci: add eslint/jsconfig configs and fix useOnboarding3 extension
- **PR #125** — ci: repair malformed ci.yml yaml
- **PR #126** — ci: make npm run lint pass (0 errors)
- **PR #127** — ci: make typecheck pass by removing orphaned blog sub-app

### Fixed
- **PR #83** — Patch 6
- **PR #121** — fix: repair root package.json and add package-lock.json for CI

### Security
- **PR #107** — Potential fix for code scanning alert no. 10: Workflow does not contain permissions
- **PR #114** — Create codeql
- **PR #115** — Create codeql-config.yml
- **PR #116** — Create require-codeql-pass.yml

## [2026-09-07]

### Added
- **PR #108** — clawverse (#65)

## [2026-09-04]

### Added
- **PR #111** — Add files via upload

### Changed
- **PR #113** — Update ci.yml

## [2026-09-03]

### Added
- **PR #106** — Create Onspace AI

## [2026-09-01]

### Added
- **PR #100** — Create tsx.md

### Security
- **PR #102** — CodeQL Advanced Security Scan

## [2026-08-30]

### Added
- **PR #82** — Create Code Navigation on Github
- **PR #95** — Add files via upload
- **PR #97** — Create copilot-instructions.md

## [2026-08-29]

### Added
- **PR #72** — Create AutoCloseIssue
- **PR #73** — Rename README.md to index.html
- **PR #89** — Create test.yml
- **PR #90** — Add files via upload
- **PR #91** — agents: 2b982529 1ce3 4f6a af95 cec2a82d9542
- **PR #92** — Add marketplace badges documentation
- **PR #93** — Add files via upload

## [2026-08-26]

### Added
- **PR #77** — Create Auto_Submit_GitHub_PR_Comment.py

## [2026-08-25]

### Added
- **PR #64** — Rename .github/workflows/proof-html.js to .github/workflows/.devconta...

### Changed
- **PR #66** — Update .env

### Dependencies
- **PR #86** — chore(deps)(deps): bump the production-deps group in /backend with 2 updates

## [2026-08-22]

### Added
- **PR #85** — Create package.html

### Changed
- **PR #84** — ci: improve error log generator workflow

## [2026-08-21]

### Added
- **PR #74** — Create mobile_pc
- **PR #76** — Create pull_request_template.md
- **PR #80** — Create lint-check.js

### Changed
- **PR #78** — Update CI

### Dependencies
- **PR #56** — Bump zod from 3.25.76 to 4.4.3
- **PR #57** — Bump @hello-pangea/dnd from 17.0.0 to 18.0.1
- **PR #58** — Bump eslint-plugin-react-refresh from 0.4.26 to 0.5.4
- **PR #62** — Bump @react-three/fiber from 8.18.0 to 9.7.0
- **PR #63** — Bump eslint-plugin-react-hooks from 5.2.0 to 7.1.1
- **PR #69** — Bump @types/react-dom from 18.3.7 to 19.2.4

## [2026-08-16]

### Added
- **PR #51** — Add uploaded files
- **PR #52** — Add initial docker-compose configuration
- **PR #67** — Create i18n.ts

### Dependencies
- **PR #60** — Bump react from 18.3.1 to 19.2.8

## [2026-08-14]

### Added
- **PR #65** — clawverse

## [2026-08-12]

### Added
- **PR #35** — Add files via upload
- **PR #41** — Add auto-generate-csv.js script for CSV generation
- **PR #42** — เพิ่มคำแนะนำการแปลง PDF เป็นไฟล์ข้อความ
- **PR #43** — Add changelog for Python version setup issue
- **PR #44** — Create FullStack Development & DevOps Skillsbook
- **PR #45** — Add deployment configuration for oauth-api
- **PR #46** — Add GitHub Action for CodeRabbit Review
- **PR #47** — Create ENCRYPTION.md for encryption standards
- **PR #48** — Add workflow automations guide for development lifecycle
- **PR #50** — Add uploaded files

### Dependencies
- **PR #27** — Bump node from 22.3.1 to 26.5.1

## [2026-08-11]

### Added
- **PR #39** — Update RoadMap

### Dependencies
- **PR #26** — Bump react-resizable-panels from 2.1.9 to 4.12.2

## [2026-08-10]

### Changed
- **PR #38** — Update CI job configuration

### Dependencies
- **PR #21** — Bump react-helmet-async from 2.0.5 to 3.0.0
- **PR #23** — Bump uuid from 13.0.2 to 14.0.1
- **PR #24** — Bump react-day-picker from 8.10.2 to 10.0.1
- **PR #25** — Bump globals from 15.15.0 to 17.9.0

## [2026-08-08]

### Added
- **PR #36** — Create initial documentation for repository

### Dependencies
- **PR #20** — Bump react-markdown from 9.1.0 to 10.1.0

## [2026-08-07]

### Changed
- **PR #34** — [WIP] Set up code coverage reporting and integrate into CI workflows

### Dependencies
- **PR #19** — Bump @react-three/drei from 9.122.0 to 10.7.7

## [2026-08-06]

### Added
- **PR #17** — Create .npmignore
- **PR #29** — Add documentation for signing commits
- **PR #30** — Add GitHub Actions workflow for dependency review
- **PR #31** — Add GraphQL Hive gateway configuration
- **PR #32** — Add GitHub Actions workflow for releases
- **PR #33** — Create VsCode Web Prototype V3

### Changed
- **PR #28** — Update Dependabot configuration

### Dependencies
- **PR #18** — Bump @vitejs/plugin-react-swc from 3.11.0 to 4.3.3
- **PR #22** — Bump @stripe/react-stripe-js from 3.10.0 to 6.8.0

## [2026-08-05]

### Added
- **PR #7** — Create CI.yml
- **PR #9** — Add workflow to download a build artifact
- **PR #10** — Add Dockerfile for multi-stage Node.js application
- **PR #11** — Add .dockerignore file for Docker build context
- **PR #12** — Add package.json for backend setup
- **PR #13** — Add installation instructions for nvm and Node.js
- **PR #14** — Add Dependabot auto-merge workflow
- **PR #15** — Add Dependabot configuration for npm updates
- **PR #16** — Add dependabot configuration file

## [2026-08-04]

### Added
- **PR #6** — Create Azure-AI
- **PR #8** — Create components/navbar.jsx

## [2026-08-01]

### Changed
- **PR #5** — update

## [2026-07-31]

### Added
- **PR #1** — Create useOnboarding3.ts
- **PR #2** — Add Vercel configuration file vercel.json
- **PR #3** — Switch to Vite for build and deployment configuration
- **PR #4** — Document copying from external images in Docker

---

_Generated from 116 merged pull requests; earliest entry 2026-07-31 (PR #1), latest 2026-09-11 (PR #146)._
