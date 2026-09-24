#!/usr/bin/env node
import { api } from "../config/setup.js";

const JOB_ID = Number(process.env.ZYNTRO_JOB_ID ?? 1);

try {
  const result = await api(`/api/jobs/${JOB_ID}/execute`, { method: "POST" });
  console.log(`Executed job #${JOB_ID}:`, result);

  const toggled = await api(`/api/jobs/${JOB_ID}/toggle`, { method: "POST" });
  console.log(`Toggled job #${JOB_ID}:`, toggled);
} catch (err) {
  console.error("Request failed:", err.message);
  console.error("(A 404 means the job ID does not exist in your database.)");
  process.exitCode = 1;
}
