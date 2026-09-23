├── scripts/ │ ├── review.sh │ ├── build.sh │ ├── test.sh │ └── lint.sh ├── │
Here’s the complete, ready-to-use **`scripts/README.md`** tailored exactly for your `new-crystalcastle` repository structure 📚✅

---

# 🛠️ Scripts — new-crystalcastle

> Automation • Validation • Maintenance • Quality Assurance

---

## 📁 Directory Structure

```
scripts/
├── errorlog-generator/     # Generate & analyze error logs
├── java/                    # Java-specific utilities & review
├── jobs/                    # Scheduled & one-off job runners
├── python/                  # Python scripts & helpers
├── sandbox/                  # Sandbox environment & integration tools
├── shell/                   # Bash/shell automation scripts
├── tests/                   # Test utilities & validation suites
├── workflow_guardian/       # CI hygiene, markdown checks, PR enforcement
│
├── count-files.js           # 📊 File counting & statistics
├── file-manager.js          # 📂 Organize, clean, verify paths
├── auth-cli.ts              # 🔐 Authentication CLI tool
├── smoke-tests.sh           # 💨 Quick health checks
├── sponsorship-log-sync.ts  # 📝 Sponsor data sync
└── README.md                # ← You are here
```

---

## 🚀 Quick Start

```bash
# From repo root
cd scripts

# Run file stats
node count-files.js

# Validate all paths & filenames
node file-manager.js verify

# Run smoke tests
bash smoke-tests.sh
```

---

## 📋 Script Reference

### `.js` — JavaScript / Node

| File | Purpose | Usage |
|---|---|---|
| **`count-files.js`** | Count files by type, extension & folder | `node count-files.js [--detail] [--json]` |
| **`file-manager.js`** | Organize, clean, verify paths • **Catches `.md` directory conflicts** | `node file-manager.js <command>` |

**`file-manager.js` Commands:**
```bash
node file-manager.js list        # List all files
node file-manager.js stats       # Show breakdown
node file-manager.js clean       # Remove temp/.DS_Store files
node file-manager.js organize    # Sort media/docs → folders
node file-manager.js verify      # ✅ Critical — check for invalid paths
node file-manager.js empty-dirs  # List empty folders
```

### `.ts` — TypeScript

| File | Purpose |
|---|---|
| **`auth-cli.ts`** | CLI for authentication & token management |
| **`sponsorship-log-sync.ts`** | Sync & validate sponsorship records |

### `.sh` — Shell

| File | Purpose |
|---|---|
| **`smoke-tests.sh`** | Fast sanity checks before full CI |
| **`shell/`** | Collection of reusable bash helpers |

### Folders — Specialized Suites

| Folder | Focus |
|---|---|
| **`errorlog-generator/`** | Structured error logging & analysis |
| **`java/`** | Java code review, linting, standards |
| **`jobs/`** | Background & scheduled tasks |
| **`python/`** | Python tooling & cleanup scripts |
| **`sandbox/`** | Isolated integration & staging environment |
| **`tests/`** | Git environment & configuration validation |
| **`workflow_guardian/`** | PR hygiene, markdown validation, branch protection rules |

---

## ✅ Recommended Workflow

```bash
# 1. Before committing new files
node scripts/file-manager.js verify

# 2. Check impact
node scripts/count-files.js --detail

# 3. Clean up
node scripts/file-manager.js clean

# 4. Quick health check
bash scripts/smoke-tests.sh
```

---

## ⚠️ Critical Checks — Always Run These

| Command | Why It Matters |
|---|---|
| `node file-manager.js verify` | **Blocks Git checkout failure (exit code 128)** — catches directories named `*.md/` |
| `bash smoke-tests.sh` | Catches broken configs & missing dependencies early |
| `workflow_guardian/` | Enforces PR templates, bilingual standards, and markdown structure |

---

## 📌 Standards

- **All scripts are executable** — `chmod +x script.sh` if needed
- **Prefer cross-platform** — Node.js scripts work on macOS/Linux/Windows
- **Ignore patterns match root `.gitignore`** — `node_modules/`, `.git/` are automatically skipped
- **Dry-run by default** — destructive commands support `--dry-run` / `-n`
- **Bilingual-ready** — outputs support both English & Thai where applicable

---

## 🤝 Adding New Scripts

1. Choose the right folder:
   - Broad utility → place directly in `scripts/`
   - Language-specific → `java/` / `python/` / `shell/`
   - Complex system → create new subfolder
2. Update this README — add your script to the table above
3. Add a short header comment at the top of your file
4. Run `node file-manager.js verify` before pushing ✅

---

## 🆘 Troubleshooting

| Issue | Fix |
|---|---|
| `node: command not found` | Install Node.js ≥ 20 |
| Permission denied | `chmod +x script.sh` |
| Path conflict detected | Rename — cannot have `file.md` and `file.md/` at same time |
| Script hangs | Check `IGNORE_DIRS` — exclude heavy folders like `node_modules/` |

---

> **new-crystalcastle** — maintained by @ZyntroAI • Standards • Automation • Quality 🚀

---

Would you like me to add a **`package.json` shortcut section** or a **pre-commit hook** that automatically runs `file-manager verify` before every commit? 🛡️⚡
