import { RouterProvider, createRootRoute, createRoute, createRouter } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { AppProviders } from "@/app/providers/app-providers"
import { RootLayout } from "@/app/routes/root-layout"
import { DashboardPage } from "@/features/dashboard/presentation/pages/dashboard-page"
import { BotsPage } from "@/features/bots/presentation/pages/bots-page"
import { CampaignPage } from "@/features/campaign/presentation/pages/campaign-page"
import { CampaignAnalyticsPage } from "@/features/campaign/presentation/pages/campaign-analytics-page"
import { UsersPage } from "@/features/users/presentation/pages/users-page"
import { SettingsPage } from "@/features/settings/presentation/pages/settings-page"
import { BotEditorPage } from "@/features/bots/presentation/pages/bot-editor-page"
import { BotTestPage } from "@/features/bots/presentation/pages/bot-test-page"
import { EmailOtpLoginPage } from "@/features/auth/presentation/pages/email-otp-login-page"

const rootRoute = createRootRoute({
  component: RootLayout,
})

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
})

const botsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "bots",
  component: BotsPage,
})

const campaignRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "campaign",
  component: CampaignPage,
})

const campaignAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "campaign/$id/analytics",
  component: CampaignAnalyticsPage,
})

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "users",
  component: UsersPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "settings",
  component: SettingsPage,
})

const botEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "bot/$id",
  component: BotEditorPage,
})

const botTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "bot/$id/test",
  component: BotTestPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  component: EmailOtpLoginPage,
})

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  botsRoute,
  campaignRoute,
  campaignAnalyticsRoute,
  usersRoute,
  settingsRoute,
  botEditorRoute,
  botTestRoute,
  loginRoute,
])

const router = createRouter({
  routeTree,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export function AppRouter() {
  return (
    <AppProviders>
      <>
        <RouterProvider router={router} />
        {import.meta.env.DEV ? (
          <TanStackRouterDevtools router={router} position="bottom-right" />
        ) : null}
      </>
    </AppProviders>
  )
}
