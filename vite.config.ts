import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const devCspConnectSrc = process.env.VITE_API_URL
  ? `'self' ${new URL(process.env.VITE_API_URL).origin}`
  : "'self' http://localhost:3000"

const buildSecurityHeaders = (scriptSrc: string) => ({
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${devCspConnectSrc}`,
    "object-src 'none'",
  ].join('; '),
})

// Vite's dev server and @vitejs/plugin-react-swc inject inline scripts (the HMR
// preamble / Fast Refresh runtime), so the dev CSP must allow 'unsafe-inline'.
// Production (nginx) and `preview` serve the static build with no inline scripts,
// so they stay strict with `script-src 'self'`.
const devSecurityHeaders = buildSecurityHeaders("script-src 'self' 'unsafe-inline'")
const previewSecurityHeaders = buildSecurityHeaders("script-src 'self'")

// https://vite.dev/config/
export default defineConfig(() => {
  return {
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    // Vite's module-preload polyfill is injected as an inline <script>, which the
    // production CSP blocks now that script-src no longer allows 'unsafe-inline'.
    // Modern target browsers support modulepreload natively, so drop the polyfill.
    modulePreload: { polyfill: false },
  },
  server: {
    headers: devSecurityHeaders,
  },
  preview: {
    headers: {
      ...previewSecurityHeaders,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },
  };
})
