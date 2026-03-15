import { useEffect, useState } from "react"

import { Spinner } from "@/components/ui/spinner"

const TOKEN_STORAGE_KEY = "jwt_token"

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const [isReady, setIsReady] = useState(false)
  const [hasToken, setHasToken] = useState(true)

  useEffect(() => {
    const readToken = () => {
      if (typeof window === "undefined") {
        return false
      }
      return true
      // TODO: TEMPORARY DISABLED AUTH
      // return Boolean(window.localStorage.getItem(TOKEN_STORAGE_KEY))
    }

    setHasToken(readToken())
    setIsReady(true)

    const handleStorage = () => setHasToken(readToken())
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!hasToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-6">
        <div className="max-w-md space-y-4 rounded-xl border bg-card p-6 text-center shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Authentication required</h1>
            <p className="text-sm text-muted-foreground">
              Please add your JWT token to <code className="rounded bg-muted px-2 py-1">localStorage</code> using the key
              <code className="ml-1 rounded bg-muted px-2 py-1">{TOKEN_STORAGE_KEY}</code> and refresh the page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
