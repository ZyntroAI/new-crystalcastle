#!/usr/bin/env bash
# List workflows, then execute and toggle the first one.
set -euo pipefail

BASE="${ZYNTRO_API_URL:-http://localhost:8000}"

echo "GET $BASE/api/workflows/"
curl -sS -w '\nHTTP %{http_code}\n' "$BASE/api/workflows/"

WF_ID="${ZYNTRO_WORKFLOW_ID:-1}"

echo
echo "POST $BASE/api/workflows/$WF_ID/execute"
curl -sS -X POST -w '\nHTTP %{http_code}\n' "$BASE/api/workflows/$WF_ID/execute"

echo
echo "POST $BASE/api/workflows/$WF_ID/toggle"
curl -sS -X POST -w '\nHTTP %{http_code}\n' "$BASE/api/workflows/$WF_ID/toggle"
