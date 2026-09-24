#!/usr/bin/env bash
# Check that the API is alive.
set -euo pipefail

BASE="${ZYNTRO_API_URL:-http://localhost:8000}"

echo "GET $BASE/health"
curl -sS -w '\nHTTP %{http_code}\n' "$BASE/health"
