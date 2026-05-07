const isTruthy = (value: string | undefined): boolean => {
  if (!value) return false;
  const v = value.toLowerCase().trim();
  return v === "true" || v === "1" || v === "yes" || v === "on";
};

export const ENV = {
  API_URL: import.meta.env?.VITE_API_URL || "http://localhost:3000/api",
  BASE_MEDIA_URL: import.meta.env?.VITE_BASE_MEDIA_URL || "http://localhost:3000/api/storage/file",
  FEATURES: {
    VOICE_TECH: isTruthy(import.meta.env?.VITE_ENABLE_VOICE_TECH),
    USERS: isTruthy(import.meta.env?.VITE_ENABLE_USERS),
    CAMPAIGNS: import.meta.env?.VITE_ENABLE_CAMPAIGNS !== "false", // Enabled by default
  }
} as const;
