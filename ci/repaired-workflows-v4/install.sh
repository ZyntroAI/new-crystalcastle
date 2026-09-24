#!/bin/sh
# Install the six repaired workflows.
#
# Run from the repository root. Needs a token with the `workflows` permission:
# .github/workflows/ cannot be written without it.
set -eu

BUNDLE="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-.github/workflows}"

[ -d "$DEST" ] || { echo "error: $DEST not found; run from the repository root" >&2; exit 1; }

n=0
for f in "$BUNDLE"/*.yml "$BUNDLE"/*.yaml; do
  [ -e "$f" ] || continue
  cp "$f" "$DEST/$(basename "$f")"
  n=$((n + 1))
  echo "  $DEST/$(basename "$f")"
done

echo "installed $n workflow file(s)"
echo "verify: python3 -c \"import yaml,glob;[yaml.safe_load(open(p)) for p in glob.glob('$DEST/*.yml')]\""
