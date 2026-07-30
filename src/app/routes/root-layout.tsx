import { Outlet } from "@tanstack/react-router"
import { useRouterState } from "@tanstack/react-router"

import { AppShell } from "@/app/layouts/app-shell"
import { ProtectedLayout } from "@/app/layouts/protected-layout"

export function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isPublicRoute =
    pathname.startsWith("/login") || pathname.startsWith("/partner-meet")

  if (isPublicRoute) {
    return <Outlet />
  }

  return (
    <ProtectedLayout>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedLayout>
  )
}
