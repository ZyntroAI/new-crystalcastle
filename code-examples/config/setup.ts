/** Shared configuration for the TypeScript examples. */

export const BASE_URL: string =
  process.env.ZYNTRO_API_URL ?? "http://localhost:8000";

export function headers(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json", ...extra };
  const key = process.env.ZYNTRO_API_KEY;
  if (key) h.Authorization = `Bearer ${key}`;
  return h;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: headers(), ...options });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} -> ${res.status}: ${text}`);
  }
  return (text ? JSON.parse(text) : null) as T;
}
