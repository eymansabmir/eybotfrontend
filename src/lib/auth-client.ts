import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"
import { ENV } from "@/config/env"

export const authClient = createAuthClient({
  baseURL: `${ENV.API_URL}/auth`,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [emailOTPClient()],
})
