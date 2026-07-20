function resolveApiBase(raw: string | undefined): string {
  const value = raw?.trim() || "http://localhost:3000/api";
  if (value.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${value}`;
    }
    return value;
  }
  return value;
}

function resolveMediaBase(raw: string | undefined, apiBase: string): string {
  const value = raw?.trim();
  if (value) {
    if (value.startsWith("/") && typeof window !== "undefined") {
      return `${window.location.origin}${value}`;
    }
    return value;
  }
  return `${apiBase.replace(/\/$/, "")}/storage/file`;
}

export const ENV = {
  get API_URL() {
    return resolveApiBase(import.meta.env?.VITE_API_URL);
  },
  get BASE_MEDIA_URL() {
    const api = resolveApiBase(import.meta.env?.VITE_API_URL);
    return resolveMediaBase(import.meta.env?.VITE_BASE_MEDIA_URL, api);
  },
  FEATURES: {
    VOICE_TECH: import.meta.env?.VITE_ENABLE_VOICE_TECH !== "false",
    USERS: import.meta.env?.VITE_ENABLE_USERS !== "false",
    CAMPAIGNS: import.meta.env?.VITE_ENABLE_CAMPAIGNS !== "false",
  },
} as const;
