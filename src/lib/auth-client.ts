import { createAuthClient } from "better-auth/client"
import { emailOTPClient } from "better-auth/client/plugins"

const authBaseUrl = `${import.meta.env.VITE_API_URL}/auth`

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient()],
})
