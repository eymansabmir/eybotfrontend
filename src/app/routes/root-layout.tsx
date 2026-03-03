import { Outlet } from "@tanstack/react-router"

import { AppShell } from "@/app/layouts/app-shell"
import { ProtectedLayout } from "@/app/layouts/protected-layout"

export function RootLayout() {
  return (
    <ProtectedLayout>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedLayout>
  )
}
