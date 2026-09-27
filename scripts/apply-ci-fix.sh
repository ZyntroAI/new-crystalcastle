#!/usr/bin/env bash
set -euo pipefail

# ==============================================
# 🧩 CI Fixes Applier — ZyntroAI
# Mode: dry-run (default) | --write (apply)
# ==============================================

VERSION="1.0.0"
DRY_RUN=true
REPO_ROOT=$(git rev-parse --show-toplevel)
WORKFLOWS_DIR="$REPO_ROOT/.github/workflows"

# ─── Colors ────────────────────────────────────
RED='\033[0;31m'
GRN='\033[0;32m'
YEL='\033[1;33m'
BLU='\033[0;34m'
BOLD='\033[1m'
DIM='\033[2m'
RST='\033[0m'

info() { echo -e "${BLU}ℹ${RST} $1"; }
ok()   { echo -e "${GRN}✅${RST} $1"; }
warn() { echo -e "${YEL}⚠️${RST} $1"; }
fail() { echo -e "${RED}❌${RST} $1" >&2; }
title() { echo -e "\n${BOLD}$1${RST}"; }

# ─── Parse Args ────────────────────────────────
for arg in "$@"; do
  case "$arg" in
    --write) DRY_RUN=false ;;
    --help|-h)
      echo "Usage: $0 [--write]"
      echo "  Default: dry-run only — no files modified"
      echo "  --write: apply fixes to workflows (Group A only)"
      exit 0
      ;;
  esac
done

# ─── Init ─────────────────────────────────────
cd "$REPO_ROOT"
title "🔍 CI Fix Scanner v$VERSION"
info "Repo root: $REPO_ROOT"
info "Workflows: $WORKFLOWS_DIR"
if $DRY_RUN; then
  info "Mode: ${BOLD}DRY-RUN${RST} — no changes will be written"
else
  warn "Mode: ${BOLD}WRITE${RST} — changes will be applied!"
fi

# ─── Counters ──────────────────────────────────
GROUP_A_BRANCHES=()
GROUP_A_ALWAYS=()
GROUP_A_CACHE=()
GROUP_B_INDENT=()
GROUP_B_MARKDOWN=()
GROUP_B_INCOMPLETE=()

# ==============================================
# 🔧 Fix 1: branches: multi-line comma
# ==============================================
fix_branches() {
  local file="$1"
  # Match: branches: [main, develop] → multi-line format
  if grep -qE 'branches:\s*\[[^]]+,' "$file"; then
    GROUP_A_BRANCHES+=("$file")
  fi
}

# ==============================================
# 🔧 Fix 2: add if: always() to jobs with needs:
# ==============================================
fix_always() {
  local file="$1"
  # Has needs: but no if: always()
  if grep -qE '^[[:space:]]+needs:' "$file" && ! grep -qE '^[[:space:]]+if:\s+always\(\)' "$file"; then
    GROUP_A_ALWAYS+=("$file")
  fi
}

# ==============================================
# 🔧 Fix 3: add cache: 'npm' to setup-node
# ==============================================
fix_cache() {
  local file="$1"
  if grep -qE 'actions/setup-node@' "$file" && ! grep -qE 'cache:' "$file"; then
    GROUP_A_CACHE+=("$file")
  fi
}

# ==============================================
# ⚠️ Group B: Check indent / missing `with:`
# ==============================================
check_indent() {
  local file="$1"
  # setup-node followed by unindented node-version (missing `with:`)
  if grep -Pzoq 'actions/setup-node@[^\n]+\n[ \t]+node-version:' "$file" && \
     ! grep -Pzoq 'actions/setup-node@[^\n]+\n[ \t]+with:' "$file"; then
    GROUP_B_INDENT+=("$file")
  fi
}

# ==============================================
# ⚠️ Group B: Markdown inside YAML
# ==============================================
check_markdown() {
  local file="$1"
  # Common markdown patterns inside run blocks
  if grep -qE '^[ \t]*## |^[ \t]*- \[|^[ \t]*\*\*' "$file"; then
    GROUP_B_MARKDOWN+=("$file")
  fi
}

# ==============================================
# ⚠️ Group B: Incomplete workflow
# ==============================================
check_incomplete() {
  local file="$1"
  if ! grep -qE '^on:' "$file" || ! grep -qE '^jobs:' "$file"; then
    GROUP_B_INCOMPLETE+=("$file")
  fi
}

# ==============================================
# 🔍 Scan All Files
# ==============================================
title "📂 Scanning workflows..."
mapfile -t FILES < <(find "$WORKFLOWS_DIR" -name "*.yml" -o -name "*.yaml" | sort)

for f in "${FILES[@]}"; do
  fix_branches "$f"
  fix_always "$f"
  fix_cache "$f"
  check_indent "$f"
  check_markdown "$f"
  check_incomplete "$f"
done

# ==============================================
# 📊 Report Results
# ==============================================
title "📋 Scan Results"

# Group A — Fixable
TOTAL_A=$((${#GROUP_A_BRANCHES[@]} + ${#GROUP_A_ALWAYS[@]} + ${#GROUP_A_CACHE[@]}))
UNIQ_A=($(printf "%s\n" "${GROUP_A_BRANCHES[@]}" "${GROUP_A_ALWAYS[@]}" "${GROUP_A_CACHE[@]}" | sort -u))
UNIQ_A_COUNT=${#UNIQ_A[@]}

echo -e "\n${BOLD}✅ Group A — Fixable Automatically ($UNIQ_A_COUNT files)${RST}"
echo "  Branches format:   ${#GROUP_A_BRANCHES[@]}"
echo "  Add if: always():  ${#GROUP_A_ALWAYS[@]}"
echo "  Add npm cache:     ${#GROUP_A_CACHE[@]}"
if $DRY_RUN; then
  echo -e "  ${DIM}Run with --write to apply${RST}"
fi

# Group B — Manual fix needed
TOTAL_B=$((${#GROUP_B_INDENT[@]} + ${#GROUP_B_MARKDOWN[@]} + ${#GROUP_B_INCOMPLETE[@]}))
UNIQ_B=($(printf "%s\n" "${GROUP_B_INDENT[@]}" "${GROUP_B_MARKDOWN[@]}" "${GROUP_B_INCOMPLETE[@]}" | sort -u))
UNIQ_B_COUNT=${#UNIQ_B[@]}

echo -e "\n${BOLD}⚠️ Group B — Manual Fix Required ($UNIQ_B_COUNT files)${RST}"
echo "  Indent/missing with:   ${#GROUP_B_INDENT[@]}"
echo "  Markdown in YAML:      ${#GROUP_B_MARKDOWN[@]}"
echo "  Incomplete workflow:   ${#GROUP_B_INCOMPLETE[@]}"
echo -e "  ${DIM}These files will NOT be modified — fix manually${RST}"

# ==============================================
# ✍️ Apply Group A Fixes (--write only)
# ==============================================
if ! $DRY_RUN && [ $UNIQ_A_COUNT -gt 0 ]; then
  title "✍️ Applying Group A fixes..."

  # Fix 1: branches single-line → multi-line
  for f in "${GROUP_A_BRANCHES[@]}"; do
    info "Fixing branches: $f"
    sed -i.bak -E 's/(branches:\s*\[)([^]]+)(\])/\1\n      \2\n    /g' "$f"
    rm -f "$f.bak"
  done

  # Fix 2: add if: always()
  for f in "${GROUP_A_ALWAYS[@]}"; do
    info "Adding if: always(): $f"
    sed -i.bak -E '/^[[:space:]]+needs:/a \      if: always()' "$f"
    rm -f "$f.bak"
  done

  # Fix 3: add cache: 'npm'
  for f in "${GROUP_A_CACHE[@]}"; do
    info "Adding npm cache: $f"
    sed -i.bak -E '/(uses: actions\/setup-node@[^#]+)$/!b;n;/cache:/!a \      cache: "npm"' "$f"
    rm -f "$f.bak"
  done

  ok "All Group A fixes applied!"

  # Verify YAML validity
  title "🔐 Validating YAML..."
  python3 -c "import yaml; yaml.safe_load(open('$f'))" 2>/dev/null || {
    warn "YAML validation check skipped — verify manually"
  }
fi

# ==============================================
# 📋 Group B Detailed List
# ==============================================
if [ $UNIQ_B_COUNT -gt 0 ]; then
  title "📝 Files Needing Manual Fix"
  
  if [ ${#GROUP_B_INDENT[@]} -gt 0 ]; then
    echo -e "\n${BOLD}Missing 'with:' block in setup-node:${RST}"
    printf "  - %s\n" "${GROUP_B_INDENT[@]/#$WORKFLOWS_DIR\//}"
  fi
  
  if [ ${#GROUP_B_MARKDOWN[@]} -gt 0 ]; then
    echo -e "\n${BOLD}Markdown content inside YAML:${RST}"
    printf "  - %s\n" "${GROUP_B_MARKDOWN[@]/#$WORKFLOWS_DIR\//}"
  fi
  
  if [ ${#GROUP_B_INCOMPLETE[@]} -gt 0 ]; then
    echo -e "\n${BOLD}Incomplete workflow (missing on:/jobs:):${RST}"
    printf "  - %s\n" "${GROUP_B_INCOMPLETE[@]/#$WORKFLOWS_DIR\//}"
  fi
fi

# ==============================================
# 🎉 Done
# ==============================================
echo -e "\n${BOLD}───────────────────────────────────────${RST}"
if $DRY_RUN; then
  ok "Dry-run complete — $UNIQ_A_COUNT fixable, $UNIQ_B_COUNT need manual"
  info "Re-run with: bash scripts/apply-ci-fixes.sh --write"
else
  ok "Done — Group A applied, Group B listed above"
  info "Next: git diff --stat && git commit -m '🔧 CI workflow fixes'"
fi
