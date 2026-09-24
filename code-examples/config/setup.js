/**
 * Shared configuration for the JavaScript examples.
 * No credentials live here — read them from the environment.
 */

export const BASE_URL = process.env.ZYNTRO_API_URL ?? "http://localhost:8000";

/** Build a default header set, adding a bearer token when one is configured. */
export function headers(extra = {}) {
  const h = { "Content-Type": "application/json", ...extra };
  const key = process.env.ZYNTRO_API_KEY;
  if (key) h.Authorization = `Bearer ${key}`;
  return h;
}

/**
 * Minimal fetch wrapper: resolves the URL, throws on a non-2xx response with
 * the body included, and parses JSON.
 */
export async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: headers(), ...options });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} -> ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}
