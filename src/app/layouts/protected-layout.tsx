import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"

import { Spinner } from "@/components/ui/spinner"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [isReady, setIsReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const authBaseUrl = import.meta.env.VITE_AUTH_URL || "http://localhost:3000/api/auth"

      try {
        const response = await fetch(`${authBaseUrl}/get-session`, {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          setIsAuthenticated(false)
          return
        }

        const payload = await response.json()
        setIsAuthenticated(Boolean(payload?.session || payload?.data?.session))
      } catch {
        setIsAuthenticated(false)
      } finally {
        setIsReady(true)
      }
    }

    void checkSession()
  }, [])

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-6">
        <div className="max-w-md space-y-4 rounded-xl border bg-card p-6 text-center shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Authentication required</h1>
            <p className="text-sm text-muted-foreground">
              Please sign in with your email OTP to continue.
            </p>
            <Link to="/login" className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
