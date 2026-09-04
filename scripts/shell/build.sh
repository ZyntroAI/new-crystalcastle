#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

echo "======================================"
echo " Build"
echo "======================================"

if [[ ! -f package.json ]]; then
  echo "ERROR: package.json not found"
  exit 1
fi

echo "Installing dependencies..."
npm ci

echo
echo "Running production build..."
npm run build

echo
echo "Build completed successfully."
