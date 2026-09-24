#!/bin/sh
# Install the repaired workflows from this bundle.
#
# Run from the repository root. Needs a token with the `workflows` permission:
# .github/workflows/ cannot be written without it.
set -eu

BUNDLE="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-.github/workflows}"

[ -d "$DEST" ] || { echo "error: $DEST not found; run from the repository root" >&2; exit 1; }

n=0
# Preserve each file's path relative to .github/workflows/, so a workflow that
# lives in a subdirectory stays there. Moving one to the top level would change
# whether GitHub treats it as an active workflow.
find "$BUNDLE" -type f \( -name '*.yml' -o -name '*.yaml' \) ! -name '*.example' | while read -r f; do
  rel="${f#$BUNDLE/}"
  out="$DEST/$rel"
  mkdir -p "$(dirname "$out")"
  cp "$f" "$out"
  echo "  $out"
done
n=$(find "$BUNDLE" -type f \( -name '*.yml' -o -name '*.yaml' \) | wc -l | tr -d ' ')

cp "$BUNDLE/check-action-pins.py" ci/check-action-pins.py

echo "installed $n workflow file(s) into $DEST"
echo "next: python3 ci/check-action-pins.py   (warns; add --strict to gate)"
