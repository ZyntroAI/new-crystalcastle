#!/usr/bin/env bash
#
# scripts/review.sh
# Local code-review runner
#
# Usage:
#   ./scripts/review.sh
#   ./scripts/review.sh --staged
#   ./scripts/review.sh --branch
#   ./scripts/review.sh path/to/file.ts
#

set -Eeuo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

MODE="working"
FILES=()

usage() {
  cat <<'EOF'
Usage:
  ./scripts/review.sh
  ./scripts/review.sh --staged
  ./scripts/review.sh --branch
  ./scripts/review.sh <file> [file...]

Options:
  --staged    Review staged changes
  --branch    Review current branch against main
  --help      Show help

Checks:
  - Git status
  - Diff
  - package.json scripts
  - lint
  - test
  - build
EOF
}

for arg in "$@"; do
  case "$arg" in
    --staged)
      MODE="staged"
      ;;
    --branch)
      MODE="branch"
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    -*)
      echo "ERROR: Unknown option: $arg"
      usage
      exit 1
      ;;
    *)
      FILES+=("$arg")
      ;;
  esac
done

echo "======================================"
echo " Code Review"
echo "======================================"
echo "Root: $ROOT_DIR"
echo "Mode: $MODE"
echo

echo "== Git status =="
git status --short
echo

echo "== Collecting diff =="

DIFF_FILE="$(mktemp)"
trap 'rm -f "$DIFF_FILE"' EXIT

if [[ ${#FILES[@]} -gt 0 ]]; then
  git diff -- "${FILES[@]}" > "$DIFF_FILE"

elif [[ "$MODE" == "staged" ]]; then
  git diff --cached > "$DIFF_FILE"

elif [[ "$MODE" == "branch" ]]; then
  git diff main...HEAD > "$DIFF_FILE"

else
  git diff > "$DIFF_FILE"
fi

if [[ ! -s "$DIFF_FILE" ]]; then
  echo "No changes found to review."
  exit 0
fi

echo "Diff collected:"
wc -l "$DIFF_FILE"
echo

run_check() {
  local name="$1"
  shift

  echo "== $name =="

  if "$@"; then
    echo "PASS: $name"
  else
    echo "FAIL: $name"
    return 1
  fi

  echo
}

FAILURES=0

if [[ -f package.json ]]; then

  echo "== package.json detected =="

  if command -v npm >/dev/null 2>&1; then

    if npm run lint --if-present; then
      echo "PASS: lint"
    else
      echo "FAIL: lint"
      FAILURES=$((FAILURES + 1))
    fi

    if npm test --if-present; then
      echo "PASS: test"
    else
      echo "FAIL: test"
      FAILURES=$((FAILURES + 1))
    fi

    if npm run build --if-present; then
      echo "PASS: build"
    else
      echo "FAIL: build"
      FAILURES=$((FAILURES + 1))
    fi

  else
    echo "WARNING: npm not found"
  fi

  echo
fi

echo "======================================"
echo " Review Summary"
echo "======================================"

if [[ "$FAILURES" -eq 0 ]]; then
  echo "Automated checks: PASS"
else
  echo "Automated checks: $FAILURES failure(s)"
fi

echo
echo "Changed files:"
git diff --name-only

echo
echo "Diff available at:"
echo "$DIFF_FILE"

echo
echo "Next step:"
echo "Run an AI reviewer against the collected diff."

exit "$FAILURES"
