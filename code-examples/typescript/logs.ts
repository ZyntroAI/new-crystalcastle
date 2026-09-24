#!/usr/bin/env tsx
import { api } from "../config/setup.js";
import type { ExecutionLogResponse } from "../config/types.js";

const limit = Number(process.env.ZYNTRO_LOG_LIMIT ?? 10);
const OK = new Set(["success", "completed"]);

const logs = await api<ExecutionLogResponse[]>(
  `/api/execution/logs?limit=${limit}`,
);
console.log(`${logs.length} log entr${logs.length === 1 ? "y" : "ies"}:`);
for (const row of logs) {
  console.log(`  #${row.id}  job=${row.job_id ?? "-"}  status=${row.status ?? "-"}`);
}

const failed = logs.filter((r) => r.status && !OK.has(r.status));
for (const row of failed) console.log(`  ${row.status}: ${row.message ?? ""}`);
