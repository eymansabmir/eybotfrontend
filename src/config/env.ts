function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Axios / fetch base: host plus `/api` (app paths are `/auth`, `/storage`, …). */
function resolveApiUrl(raw?: string): string {
  const fallback = "http://localhost:3000/api";
  if (!raw?.trim()) return fallback;
  const base = trimSlash(raw.trim());
  return base.endsWith("/api") ? base : `${base}/api`;
}

function resolveMediaUrl(raw: string | undefined, apiUrl: string): string {
  if (raw?.trim()) return trimSlash(raw.trim());
  return `${apiUrl}/storage/file`;
}

const API_URL = resolveApiUrl(import.meta.env?.VITE_API_URL);

export const ENV = {
  API_URL,
  BASE_MEDIA_URL: resolveMediaUrl(import.meta.env?.VITE_BASE_MEDIA_URL, API_URL),
  FEATURES: {
    VOICE_TECH: import.meta.env?.VITE_ENABLE_VOICE_TECH !== "false", // Enabled by default
    USERS: import.meta.env?.VITE_ENABLE_USERS !== "false", // Enabled by default
    CAMPAIGNS: import.meta.env?.VITE_ENABLE_CAMPAIGNS !== "false", // Enabled by default
    MARKETING: import.meta.env?.VITE_ENABLE_MARKETING !== "false", // Enabled by default
  },
} as const;
