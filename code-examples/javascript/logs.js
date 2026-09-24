#!/usr/bin/env node
import { api } from "../config/setup.js";

const LIMIT = Number(process.env.ZYNTRO_LOG_LIMIT ?? 10);

const logs = await api(`/api/execution/logs?limit=${LIMIT}`);
console.log(`${logs.length} log entr${logs.length === 1 ? "y" : "ies"}:`);
for (const row of logs) {
  console.log(`  #${row.id}  job=${row.job_id ?? "-"}  status=${row.status ?? "-"}`);
}

const failed = logs.filter((r) => r.status && !["success", "completed"].includes(r.status));
if (failed.length) {
  console.log(`
${failed.length} non-success entr${failed.length === 1 ? "y" : "ies"}:`);
  for (const row of failed) console.log(`  ${row.status}: ${row.message ?? ""}`);
}
