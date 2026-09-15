For GitHub Actions workflows, add instructions such as these to `.github/copilot-instructions.md`:

```md
## GitHub Actions workflow guidelines

- Store workflows in `.github/workflows/`.
- Use valid GitHub Actions YAML syntax.
- Pin third-party actions to a major version or commit SHA; do not use floating branches.
- Set the minimum required permissions explicitly at the workflow or job level.
- Prefer least-privilege permissions, usually:
  `contents: read`
- Use `${{ secrets.NAME }}` for sensitive values; never hard-code secrets, tokens, or credentials.
- Use repository variables through `${{ vars.NAME }}` when appropriate.
- Add explicit job names, trigger conditions, dependencies, and timeouts.
- Use `needs` when jobs must run in sequence.
- Avoid duplicating setup steps; use reusable workflows or composite actions when logic is shared.
- Cache dependencies when it improves build performance.
- Run formatting, linting, tests, and security checks in CI.
- Make workflow steps deterministic and fail clearly.
- When modifying a workflow, preserve existing triggers and required checks unless the change explicitly requires otherwise.
- Validate changed workflow files with a YAML parser and GitHub Actions workflow checks.
```

For instructions that apply only to workflow files, create `.github/instructions/workflows.instructions.md`:

```md
---
applyTo: ".github/workflows/**/*.yml,.github/workflows/**/*.yaml"
---

- Use least-privilege `permissions`.
- Pin action versions.
- Never expose secrets in logs.
- Prefer explicit `if`, `needs`, `timeout-minutes`, and job-level permissions.
- Keep workflows reusable and avoid unnecessary duplication.
```

The path-specific file is useful when you want these rules applied only while Copilot edits GitHub Actions workflows.
