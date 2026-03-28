import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Spinner } from "@/components/ui/spinner"
import { ENV } from "@/config/env"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [isReady, setIsReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${ENV.API_URL}/auth/get-session`, {
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

  useEffect(() => {
    if (!isReady || isAuthenticated) return
    void navigate({ to: "/login", replace: true })
  }, [isReady, isAuthenticated, navigate])

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
