import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const devCspConnectSrc = process.env.VITE_API_URL
  ? `'self' ${new URL(process.env.VITE_API_URL).origin}`
  : "'self' http://localhost:3000"

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Vite dev injects inline scripts for HMR / React Refresh; production build uses
  // external module scripts only (modulePreload polyfill disabled below).
  const isDevServer = command === 'serve' && mode === 'development';
  const scriptSrc = isDevServer
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self'";

  const frontendSecurityHeaders = {
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
  };

  return {
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    // Vite's module-preload polyfill is injected as an inline <script>, which the
    // production CSP blocks now that script-src no longer allows 'unsafe-inline'.
    // Modern target browsers support modulepreload natively, so drop the polyfill.
    modulePreload: { polyfill: false },
  },
  server: {
    headers: frontendSecurityHeaders,
  },
  preview: {
    headers: {
      ...frontendSecurityHeaders,
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },
  };
})
