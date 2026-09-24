#!/usr/bin/env bash
#
# install.sh — install the repaired workflow files into .github/workflows/
#
# Dry-run by default. Pass --apply to actually write.
#
#   ./ci/repaired-workflows-v2/install.sh            # show what would change
#   ./ci/repaired-workflows-v2/install.sh --apply    # write the files
#
# Safety:
#   * TWO-PHASE: every file is validated before anything is written, so a single
#     bad file cannot leave a half-applied pack behind
#   * refuses to overwrite an existing target unless --force is given
#   * validates each file as YAML and checks every action ref is a full 40-char SHA
#   * moves download-a-Build-Artifact.yml OUT of .github/workflows/ (archive)
#
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SRC/../.." && pwd)"
WF_DIR="$REPO_ROOT/.github/workflows"
ARCHIVE_DIR="$REPO_ROOT/ci/archived-nonworkflows"

APPLY=0
FORCE=0
for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=1 ;;
    --force) FORCE=1 ;;
    -h|--help) sed -n '2,16p' "$0"; exit 0 ;;
    *) echo "unknown argument: $arg" >&2; exit 2 ;;
  esac
done

WORKFLOWS=(
  CICD_Pipeline.yaml
  errorlog-generator.yml
  pages-ci.yml
  pytest-markers.yml
  scorecsv.yml
  supabase-branch.yml
  apply-branch-protection.yml
)
ARCHIVE=(download-a-Build-Artifact.yml)

say() { printf '%s\n' "$*"; }
hr()  { printf -- '%.0s-' {1..72}; echo; }

command -v python3 >/dev/null 2>&1 || { echo "python3 is required" >&2; exit 1; }

validate_yaml() {
  python3 - "$1" <<'PY'
import sys, yaml
try:
    yaml.safe_load(open(sys.argv[1], encoding="utf-8"))
except Exception as e:
    print(str(e).splitlines()[0]); sys.exit(1)
PY
}

validate_shas() {
  python3 - "$1" <<'PY'
import sys, re
txt = open(sys.argv[1], encoding="utf-8").read()
bad = []
for line in txt.splitlines():
    s = line.strip()
    if s.startswith("#"):
        continue
    m = re.search(r'uses:\s*([A-Za-z0-9_.\-]+/[A-Za-z0-9_.\-]+)@(\S+)', s)
    if m and not re.fullmatch(r'[0-9a-f]{40}', m.group(2)):
        bad.append(f"{m.group(1)}@{m.group(2)}")
if bad:
    print("unpinned: " + ", ".join(bad)); sys.exit(1)
PY
}

say "repaired workflow pack v2"
say "source : $SRC"
say "target : $WF_DIR"
[ "$APPLY" -eq 1 ] && say "mode   : APPLY (files will be written)" || say "mode   : DRY RUN (nothing will be written; pass --apply)"
hr

# ---------------- PHASE 1: validate everything, write nothing ----------------
say "phase 1 — validation"
fail=0
declare -A STATE=()
for f in "${WORKFLOWS[@]}"; do
  src="$SRC/$f"; dst="$WF_DIR/$f"
  printf '  %-32s ' "$f"
  if [ ! -f "$src" ]; then echo "MISSING from pack"; fail=1; continue; fi
  if ! err=$(validate_yaml "$src"); then echo "INVALID YAML: $err"; fail=1; continue; fi
  if ! err=$(validate_shas "$src"); then echo "INVALID REFS: $err"; fail=1; continue; fi
  if [ -f "$dst" ] && [ "$FORCE" -ne 1 ]; then
    echo "valid, target exists (would SKIP; --force to overwrite)"
    STATE[$f]=skip
  else
    echo "valid"
    STATE[$f]=write
  fi
done
hr

if [ "$fail" -ne 0 ]; then
  say "RESULT: FAILED — validation failed. NOTHING was written."
  exit 3
fi

# ---------------- PHASE 2: apply ----------------
say "phase 2 — apply"
for f in "${WORKFLOWS[@]}"; do
  src="$SRC/$f"; dst="$WF_DIR/$f"
  printf '  %-32s ' "$f"
  if [ "${STATE[$f]}" = "skip" ]; then
    echo "skipped (target exists)"
    continue
  fi
  if [ "$APPLY" -eq 1 ]; then
    mkdir -p "$WF_DIR"
    cp "$src" "$dst"
    echo "installed"
  else
    echo "would install"
  fi
done

for f in "${ARCHIVE[@]}"; do
  dst="$WF_DIR/$f"
  printf '  %-32s ' "$f"
  if [ -f "$dst" ]; then
    if [ "$APPLY" -eq 1 ]; then
      mkdir -p "$ARCHIVE_DIR"
      git -C "$REPO_ROOT" mv "$dst" "$ARCHIVE_DIR/$f" 2>/dev/null || mv "$dst" "$ARCHIVE_DIR/$f"
      echo "moved out of .github/workflows/ -> ci/archived-nonworkflows/"
    else
      echo "would move out of .github/workflows/ -> ci/archived-nonworkflows/"
    fi
  else
    echo "not present in .github/workflows/ (nothing to move)"
  fi
done

hr
if [ "$APPLY" -eq 1 ]; then
  say "RESULT: applied. Review with:"
  say "  git -C \"$REPO_ROOT\" status --short .github/workflows/"
  say "then commit and push."
else
  say "RESULT: pack valid. Re-run with --apply to install."
fi
