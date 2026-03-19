import { createAuthClient } from "better-auth/client"
import { emailOTPClient } from "better-auth/client/plugins"

const authBaseUrl = import.meta.env.VITE_AUTH_URL || "http://localhost:3000/api/auth"

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient()],
})
