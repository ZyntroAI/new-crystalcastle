#!/usr/bin/env node
import { BASE_URL, api } from "../config/setup.js";

const health = await api("/health");
console.log(`API at ${BASE_URL} ->`, health);
