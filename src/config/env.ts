export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  BASE_MEDIA_URL: import.meta.env.VITE_BASE_MEDIA_URL || "http://localhost:3000/api/storage/file", // Fallback to local endpoint if no CDN
} as const;
