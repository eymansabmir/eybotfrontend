import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const devCspConnectSrc = process.env.VITE_API_URL
  ? `'self' ${new URL(process.env.VITE_API_URL).origin}`
  : "'self' http://localhost:3000"

const frontendSecurityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${devCspConnectSrc}`,
    "object-src 'none'",
  ].join('; '),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    headers: frontendSecurityHeaders,
  },
  preview: {
    headers: {
      ...frontendSecurityHeaders,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },
})
