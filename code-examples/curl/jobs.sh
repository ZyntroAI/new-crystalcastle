#!/usr/bin/env bash
# Execute and toggle a cron job.
set -euo pipefail

BASE="${ZYNTRO_API_URL:-http://localhost:8000}"
JOB_ID="${ZYNTRO_JOB_ID:-1}"

echo "POST $BASE/api/jobs/$JOB_ID/execute"
curl -sS -X POST -w '\nHTTP %{http_code}\n' "$BASE/api/jobs/$JOB_ID/execute"

echo
echo "POST $BASE/api/jobs/$JOB_ID/toggle"
curl -sS -X POST -w '\nHTTP %{http_code}\n' "$BASE/api/jobs/$JOB_ID/toggle"
