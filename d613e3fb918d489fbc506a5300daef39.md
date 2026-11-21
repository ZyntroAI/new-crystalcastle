# Conventions Reference — CrystalCastle X

> โหลดไฟล์นี้เมื่อ: สร้าง branch/commit/PR, ตั้งชื่อ env var/secret, หรือถามเกี่ยวกับ code style / label

## Branch Naming

| Pattern | ใช้สำหรับ | ตัวอย่าง |
|---|---|---|
| `feature/<scope>-<slug>` | feature ใหม่ | `feature/captions-style-presets` |
| `fix/<scope>-<slug>` | bug fix | `fix/provider-timeout` |
| `chore/<slug>` | maintenance | `chore/bump-deps` |
| `ci/<slug>` | workflow/CI | `ci/consolidate-changelog` |
| `repair/<run-id>` | **auto-generated** โดย ai-auto-repair | `repair/35399662325` |
| `dependabot/*` | dependency update (auto) | — |

ห้าม push direct ไป `main` / `develop` — ต้องผ่าน PR + required review.

## Commits — Conventional Commits (commit-lint.yml บังคับ)

```
<type>(<scope>): <subject>

[optional body]
[optional footer]
```

| type | ใช้ |
|---|---|
| `feat` | feature ใหม่ (user-facing) |
| `fix` | แก้ bug |
| `ci` | แก้ workflow/CI/CD |
| `chore` | maintenance, deps, config ไม่กระทบ runtime |
| `docs` | เอกสาร |
| `refactor` | refactor ไม่เปลี่ยน behavior |
| `perf` | performance |
| `test` | เพิ่ม/แก้ test |
| `revert` | revert commit |

scope ที่ใช้บ่อย: `ai`, `providers`, `video`, `render`, `captions`, `api`, `frontend`, `workflows`, `docker`, `security`

ตัวอย่าง: `fix(providers): add circuit breaker for gemini timeout`, `ci(workflows): consolidate 3 changelog workflows into 1`

## Pull Requests

- Title: format เดียวกับ commit (conventional)
- Body: ใช้ template (มีใน repo) — อธิบาย what/why, test ที่ทำ, screenshot ถ้า UI เปลี่ยน
- Label: ต้องมีอย่างน้อย 1 จาก `bug`/`enhancement`/`documentation`/`ai`/`ci`/`security`
- Merge: **squash merge** เท่านั้น (commit message ต้อง conventional)
- ต้อง pass ทุก check: lint, tsc, unit test, gitleaks, pnpm audit, CodeQL, Trivy, preview health, e2e (ถ้าแตะ frontend)

## Labels (canonical)

`bug`, `enhancement`, `documentation`, `ai`, `ci`, `security`, `performance`, `needs-review`, `stale-pr`, `auto-repair`, `dependencies`

## Env Vars & Secrets

- **ชื่อ**: `UPPER_SNAKE_CASE` (`DB_PASSWORD`, `REDIS_URL`, `OPENAI_API_KEY`)
- **`.env.example`**: ต้องมีครบทุกตัวแปร พร้อม placeholder (ห้ามใส่ค่าจริง)
- **Secrets**: เก็บใน GitHub **Environment** (`sandbox` / `production`) — ไม่ใช่ repo-wide secret
- **Cloud deploy**: ใช้ OIDC (ไม่ใช่ long-lived token/PAT)
- **Frontend**: ตัวแปรที่ฝั่ง browser เห็นต้องขึ้นต้น `NEXT_PUBLIC_` — ห้ามใส่ secret ลงตรงนี้
- **AI keys**: แต่ละ key มี scope จำกัด + budget alert + rotate ทุก 90 วัน

## Code Style

| Layer | Tool | คำสั่ง |
|---|---|---|
| Frontend (TS/JS) | ESLint + Prettier | `pnpm lint`, `pnpm format` |
| Backend (Python) | ruff + black + mypy | `ruff check .`, `black .`, `mypy app/` |
| YAML | prettier + actionlint | `actionlint .github/workflows/` |
| Commit | commitlint | (auto ใน CI) |

## File/Path Rules

- ห้ามใช้ absolute path ในโค้ด/config (`check-absolute-paths.yml` บังคับ)
- `.gitignore` ครอบคลุม: `.env*`, `node_modules/`, `__pycache__/`, `.next/`, `uploads/`, `diagnostics/`, `*.log`
- `gitignore-check.yml` + `IgnoreFileCheck.yml` บังคับ — ถ้าเพิ่มไฟล์ build output ต้องเพิ่มใน .gitignore ด้วย
- ห้าม commit `diagnostics/`, `repair.patch`, `failure_context.json` (เป็น artifact ของ auto-repair)

## Testing Standards

- Unit test: ความช่วยเหลือใหม่ต้องมี test; `pnpm test --runInBand` (frontend), `pytest` (backend)
- e2e: Playwright ต่อ preview URL — flow สำคัญ (login, upload, generate, download) ต้องมี
- Prompt change: ต้องผ่าน `test:prompts` (golden output) ก่อน merge
