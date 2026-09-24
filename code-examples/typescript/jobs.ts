#!/usr/bin/env tsx
import { api } from "../config/setup.js";
import type { CronJobResponse, ExecutionResult } from "../config/types.js";

const jobId = Number(process.env.ZYNTRO_JOB_ID ?? 1);

try {
  const result = await api<ExecutionResult>(`/api/jobs/${jobId}/execute`, {
    method: "POST",
  });
  console.log(`Executed job #${jobId}:`, result);

  const toggled = await api<CronJobResponse>(`/api/jobs/${jobId}/toggle`, {
    method: "POST",
  });
  console.log(`Toggled job #${jobId}:`, toggled);
} catch (err) {
  console.error("Request failed:", (err as Error).message);
  process.exitCode = 1;
}
