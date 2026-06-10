import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"

import { Spinner } from "@/components/ui/spinner"
import { ensureCsrfToken } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"

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
        // Perform a direct fetch to ensure we have the latest session state
        const { data: session } = await authClient.getSession()
        
        if (!session) {
          setIsAuthenticated(false)
          void navigate({ to: "/login", replace: true })
          return
        }
        
        setIsAuthenticated(true)
        await ensureCsrfToken()
      } catch {
        setIsAuthenticated(false)
        void navigate({ to: "/login", replace: true })
      } finally {
        setIsReady(true)
      }
    }

    void checkSession()
  }, [navigate])

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
