#!/usr/bin/env bash
# Install the documentation deploy workflow.
#
# Dry-run by default; pass --apply to actually write the file.
#
#     ./ci/docs-deploy/install.sh            # show what would happen
#     ./ci/docs-deploy/install.sh --apply    # do it
#
# Why this exists: the Fig GitHub App cannot push to .github/workflows/, so the
# workflow ships here and a human with write access installs it.

set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/docs-deploy.yml"
DEST_REL=".github/workflows/docs-deploy.yml"

APPLY=0
case "${1:-}" in
  --apply) APPLY=1 ;;
  ""|--dry-run) APPLY=0 ;;
  *) echo "usage: $0 [--apply]" >&2; exit 2 ;;
esac

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  echo "error: not inside a git repository" >&2
  exit 1
fi
cd "$REPO_ROOT"
DEST="$REPO_ROOT/$DEST_REL"

echo "source : $SRC"
echo "target : $DEST"
echo

if [ ! -f "$SRC" ]; then
  echo "error: source workflow not found at $SRC" >&2
  exit 1
fi

# Refuse to overwrite: this is not a file we created in the target repo.
if [ -e "$DEST" ]; then
  echo "refusing to overwrite: $DEST_REL already exists."
  echo
  echo "Compare before deciding:"
  echo "    diff '$SRC' '$DEST'"
  exit 3
fi

if [ "$APPLY" -eq 0 ]; then
  echo "DRY RUN — nothing written. Would create:"
  echo "    $DEST_REL"
  echo
  echo "Target directory exists: $([ -d "$(dirname "$DEST")" ] && echo yes || echo 'no (would be created)')"
  echo "Re-run with --apply to install."
  exit 0
fi

mkdir -p "$(dirname "$DEST")"
cp "$SRC" "$DEST"
echo "installed -> $DEST_REL"
echo
echo "Next:"
echo "  1. git add '$DEST_REL'"
echo "  2. git commit -m 'ci(docs): add Pages deploy workflow'"
echo "  3. git push"
echo "  4. Settings -> Pages -> Source: GitHub Actions"
