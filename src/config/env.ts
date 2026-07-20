
export const ENV = {
  API_URL: import.meta.env?.VITE_API_URL || "http://localhost:3000/api",
  BASE_MEDIA_URL: import.meta.env?.VITE_BASE_MEDIA_URL || "http://localhost:3000/api/storage/file",
  FEATURES: {
    VOICE_TECH: import.meta.env?.VITE_ENABLE_VOICE_TECH !== "false",
    USERS: import.meta.env?.VITE_ENABLE_USERS !== "false",
    CAMPAIGNS: import.meta.env?.VITE_ENABLE_CAMPAIGNS !== "false",
  },
} as const;
