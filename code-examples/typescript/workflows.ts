#!/usr/bin/env tsx
import { api } from "../config/setup.js";
import type { ExecutionResult, WorkflowResponse } from "../config/types.js";

const workflows = await api<WorkflowResponse[]>("/api/workflows/");
console.log(`Found ${workflows.length} workflow(s)`);
for (const wf of workflows) console.log(`  #${wf.id}  ${wf.name}`);

if (workflows.length > 0) {
  const id = workflows[0].id;
  const result = await api<ExecutionResult>(`/api/workflows/${id}/execute`, {
    method: "POST",
  });
  console.log(`Executed workflow #${id}:`, result);

  const toggled = await api<WorkflowResponse>(`/api/workflows/${id}/toggle`, {
    method: "POST",
  });
  console.log(`Toggled workflow #${id}:`, toggled);
} else {
  console.log("No workflows to execute.");
}
