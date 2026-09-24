#!/bin/bash
# Run this script from this directory to install the repaired workflows
set -e
cd "$(dirname "$0")"
TARGET="../../.github/workflows"
mkdir -p "$TARGET"
cp FastAPI_CI.yaml codeql.yml Python-CI.yml "$TARGET/"
echo "✅ Installed repaired workflows to $TARGET"
