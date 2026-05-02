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
import { VoiceTechPage } from "@/features/voice-tech/presentation/pages/voice-tech-page"
import { DatasetsPage } from "@/features/voice-tech/presentation/pages/datasets-page"
import { RoutingsPage } from "@/features/voice-tech/presentation/pages/routings-page"
import { RoutingAnalyticsPage } from "@/features/voice-tech/presentation/pages/routing-analytics-page"
import { ExecutePage } from "@/features/voice-tech/presentation/pages/execute-page"
import { VendorsPage } from "@/features/voice-tech/presentation/pages/vendors-page"
import { VendorAgentsPage } from "@/features/voice-tech/presentation/pages/vendor-agents-page"
import { OrchestrationWizardPage } from "@/features/voice-tech/presentation/pages/orchestration-wizard-page"
import { DatasetFieldsPage } from "@/features/voice-tech/presentation/pages/dataset-fields-page"
import { CreateVendorPage } from "@/features/voice-tech/presentation/pages/create-vendor-page"
import { CreateAgentPage } from "@/features/voice-tech/presentation/pages/create-agent-page"
import { CreateBotPage } from "../features/bots/presentation/pages/create-bot-page"


import { BotSettingsPage } from "@/features/bots/presentation/pages/bot-settings-page"

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

const voiceTechRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech",
  component: VoiceTechPage,
})

const voiceTechDatasetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/datasets",
  component: DatasetsPage,
})

const voiceTechRoutingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/routings",
  component: RoutingsPage,
})

const voiceTechRoutingAnalyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/routings/$id/analytics",
  component: RoutingAnalyticsPage,
})

const voiceTechExecuteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/execute",
  component: ExecutePage,
})

const voiceTechVendorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/vendors",
  component: VendorsPage,
})

const voiceTechVendorAgentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/vendors/agents",
  component: VendorAgentsPage,
})

const voiceTechCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/create",
  component: OrchestrationWizardPage,
})

const voiceTechDatasetFieldsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/datasets/$name",
  component: DatasetFieldsPage,
})

const voiceTechCreateVendorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/vendors/create",
  component: CreateVendorPage,
})

const voiceTechCreateAgentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "voice-tech/agents/create",
  component: CreateAgentPage,
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

const botSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "bot/$id/settings",
  component: BotSettingsPage,
})

const botTestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "bot/$id/test",
  component: BotTestPage,
})

const createBotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "create-bot",
  component: CreateBotPage,
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
  voiceTechRoute,
  voiceTechDatasetsRoute,
  voiceTechRoutingsRoute,
  voiceTechRoutingAnalyticsRoute,
  voiceTechExecuteRoute,
  campaignAnalyticsRoute,

  usersRoute,
  settingsRoute,
  botEditorRoute,
  botSettingsRoute,
  botTestRoute,
  loginRoute,
  voiceTechVendorsRoute,
  voiceTechVendorAgentsRoute,
  voiceTechCreateRoute,
  voiceTechDatasetFieldsRoute,
  voiceTechCreateVendorRoute,
  voiceTechCreateAgentRoute,
  createBotRoute,
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
