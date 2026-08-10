#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

echo "======================================"
echo " Lint"
echo "======================================"

if [[ ! -f package.json ]]; then
  echo "ERROR: package.json not found"
  exit 1
fi

echo "Running ESLint..."

npm run lint

echo
echo "Lint completed successfully."
