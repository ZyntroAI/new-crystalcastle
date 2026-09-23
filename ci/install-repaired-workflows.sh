#!/usr/bin/env bash
# Install the repaired workflow files into .github/workflows/.
#
# Why this exists: the Fig GitHub App lacks the `workflows` permission, so a
# push that creates or updates a file under .github/workflows/ is rejected by
# GitHub regardless of the account's own rights. The repaired files therefore
# live in ci/repaired-workflows/ (a normal path) and this script copies them
# into place — run it from a machine or token that has `workflows` permission.
#
# Usage:
#   ./ci/install-repaired-workflows.sh            # dry run (default)
#   ./ci/install-repaired-workflows.sh --apply    # actually copy + verify

set -euo pipefail

APPLY=0
for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=1 ;;
    -h|--help)
      sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) echo "unknown argument: $arg" >&2; exit 2 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/ci/repaired-workflows"
DST="$REPO_ROOT/.github/workflows"

[ -d "$SRC" ] || { echo "missing source dir: $SRC" >&2; exit 1; }
[ -d "$DST" ] || { echo "missing destination dir: $DST" >&2; exit 1; }

FILES=(
  CICD_Pipeline.yaml
  errorlog-generator.yml
  pages-ci.yml
  pytest-markers.yml
  scorecsv.yml
)

echo "mode: $([ "$APPLY" = 1 ] && echo APPLY || echo 'dry-run (pass --apply to write)')"
echo "from: $SRC"
echo "to:   $DST"
echo

# 1. Validate every source file parses before touching anything.
python3 - "$SRC" "${FILES[@]}" <<'PY'
import sys, yaml, pathlib
src = pathlib.Path(sys.argv[1])
bad = []
for name in sys.argv[2:]:
    p = src / name
    try:
        d = yaml.safe_load(p.read_text(encoding="utf-8"))
        assert isinstance(d, dict) and "jobs" in d, "missing jobs:"
        print(f"  valid  {name}  ({d.get('name')})")
    except Exception as e:
        bad.append((name, e))
if bad:
    for n, e in bad:
        print(f"  INVALID {n}: {e}")
    sys.exit(1)
print()
PY

# 2. Show what would change.
for f in "${FILES[@]}"; do
  if [ -f "$DST/$f" ] && cmp -s "$SRC/$f" "$DST/$f"; then
    echo "  unchanged  $f"
  else
    echo "  replace    $f"
  fi
done
echo

if [ "$APPLY" != 1 ]; then
  echo "dry run complete — nothing written. Re-run with --apply to install."
  exit 0
fi

# 3. Copy, then re-validate the destination.
for f in "${FILES[@]}"; do
  cp "$SRC/$f" "$DST/$f"
done

python3 - "$DST" "${FILES[@]}" <<'PY'
import sys, yaml, pathlib
dst = pathlib.Path(sys.argv[1])
for name in sys.argv[2:]:
    yaml.safe_load((dst / name).read_text(encoding="utf-8"))
print(f"installed and re-validated {len(sys.argv)-2} workflow files")
PY
