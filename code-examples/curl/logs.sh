#!/usr/bin/env bash
# Read execution logs.
set -euo pipefail

BASE="${ZYNTRO_API_URL:-http://localhost:8000}"
LIMIT="${ZYNTRO_LOG_LIMIT:-10}"

echo "GET $BASE/api/execution/logs?limit=$LIMIT"
curl -sS -w '\nHTTP %{http_code}\n' "$BASE/api/execution/logs?limit=$LIMIT"
