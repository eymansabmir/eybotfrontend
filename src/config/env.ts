export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  BASE_MEDIA_URL: import.meta.env.VITE_BASE_MEDIA_URL || "http://localhost:3000/api/storage/file", // Fallback to local endpoint if no CDN
  FEATURES: {
    VOICE_TECH: import.meta.env.VITE_ENABLE_VOICE_TECH === "true",
    USERS: import.meta.env.VITE_ENABLE_USERS === "true",
    CAMPAIGNS: import.meta.env.VITE_ENABLE_CAMPAIGNS !== "false", // Enabled by default unless explicitly disabled
  }
} as const;
