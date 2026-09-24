#!/usr/bin/env node
import { api } from "../config/setup.js";

// List every workflow
const workflows = await api("/api/workflows/");
console.log(`Found ${workflows.length} workflow(s)`);
for (const wf of workflows) {
  console.log(`  #${wf.id}  ${wf.name}`);
}

// Execute the first one, if any exist
if (workflows.length > 0) {
  const id = workflows[0].id;
  const result = await api(`/api/workflows/${id}/execute`, { method: "POST" });
  console.log(`Executed workflow #${id}:`, result);

  const toggled = await api(`/api/workflows/${id}/toggle`, { method: "POST" });
  console.log(`Toggled workflow #${id}:`, toggled);
} else {
  console.log("No workflows to execute.");
}
