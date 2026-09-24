#!/usr/bin/env tsx
import { BASE_URL, api } from "../config/setup.js";
import type { HealthResponse } from "../config/types.js";

const health = await api<HealthResponse>("/health");
console.log(`API at ${BASE_URL} ->`, health);
