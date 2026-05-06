import { useMemo } from "react"
import {
  ActivityIcon,
  ArrowUpRightIcon,
  BotIcon,
  Clock3Icon,
  MessageSquareTextIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useBots } from "@/features/bots/data/queries/use-bots"
import { useCampaigns } from "@/features/campaign/api/campaign-queries"
import type { Bot } from "@/features/bots/data/schemas/bot.schema"
import type { Campaign } from "@/features/campaign/types"

type DashboardEventTone = "success" | "warning" | "neutral"

type DashboardEvent = {
  title: string
  detail: string
  time: string
  tone: DashboardEventTone
  timestamp: number
}

type PortfolioBot = {
  name: string
  owner: string
  status: "Live" | "Draft" | "Archived"
  sessions: number
  successRate: number
  lastSync: string
}

function toSafeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function safeDate(input?: string) {
  if (!input) return undefined
  const parsed = new Date(input)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function toRelativeTime(input?: string) {
  const date = safeDate(input)
  if (!date) return "just now"

  const now = Date.now()
  const deltaMs = date.getTime() - now
  const absMinutes = Math.round(Math.abs(deltaMs) / 60_000)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  if (absMinutes < 60) return rtf.format(Math.round(deltaMs / 60_000), "minute")
  if (absMinutes < 60 * 24) return rtf.format(Math.round(deltaMs / 3_600_000), "hour")
  return rtf.format(Math.round(deltaMs / 86_400_000), "day")
}

function triggerOwnerLabel(bot: Bot) {
  if (bot.triggerType === "keyword") return "Keyword Ops"
  if (bot.triggerType === "api") return "API Integrations"
  return "Inbound Routing"
}

function campaignTone(status: Campaign["status"]): DashboardEventTone {
  if (status === "completed" || status === "running") return "success"
  if (status === "cancelled") return "warning"
  return "neutral"
}

function mapBotStatus(status: Bot["status"]): PortfolioBot["status"] {
  if (status === "published") return "Live"
  if (status === "archived") return "Archived"
  return "Draft"
}

function buildWeeklySeries(bots: Bot[]) {
  const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" })
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const points = Array.from({ length: 7 }, (_, index) => {
    const dayDate = new Date(today)
    dayDate.setDate(today.getDate() - (6 - index))

    return {
      label: dayFormatter.format(dayDate),
      dayKey: dayDate.toDateString(),
      value: 0,
    }
  })

  for (const bot of bots) {
    const botDay = safeDate(bot.updatedAt)
    if (!botDay) continue

    const normalizedBotDay = new Date(botDay)
    normalizedBotDay.setHours(0, 0, 0, 0)
    const point = points.find((entry) => entry.dayKey === normalizedBotDay.toDateString())
    if (!point) continue

    const weightedExecutions = Math.max(1, toSafeNumber(bot.executions))
    point.value += weightedExecutions
  }

  return points.map((point) => ({
    label: point.label,
    value: point.value,
  }))
}

function buildOperationsFeed(campaigns: Campaign[], bots: Bot[]): DashboardEvent[] {
  const campaignEvents: DashboardEvent[] = campaigns
    .slice()
    .sort((a, b) => (safeDate(b.updatedAt)?.getTime() || 0) - (safeDate(a.updatedAt)?.getTime() || 0))
    .slice(0, 2)
    .map((campaign) => ({
      title: `Campaign ${campaign.status}`,
      detail: `${campaign.name} is currently ${campaign.status}.`,
      time: toRelativeTime(campaign.updatedAt),
      tone: campaignTone(campaign.status),
      timestamp: safeDate(campaign.updatedAt)?.getTime() || 0,
    }))

  const botEvents: DashboardEvent[] = bots
    .slice()
    .sort((a, b) => (safeDate(b.updatedAt)?.getTime() || 0) - (safeDate(a.updatedAt)?.getTime() || 0))
    .slice(0, 2)
    .map((bot) => {
      const executions = toSafeNumber(bot.executions)

      return {
        title: `${bot.name} synced`,
        detail: `${mapBotStatus(bot.status)} bot updated with ${executions.toLocaleString()} executions tracked.`,
        time: toRelativeTime(bot.updatedAt),
        tone: bot.status === "archived" ? "warning" : "success",
        timestamp: safeDate(bot.updatedAt)?.getTime() || 0,
      }
    })

  const combined = [...campaignEvents, ...botEvents]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4)

  if (combined.length > 0) return combined

  return [
    {
      title: "Workspace initialized",
      detail: "Create your first bot or campaign to populate live operational events.",
      time: "just now",
      tone: "neutral",
      timestamp: Date.now(),
    },
  ]
}

export function DashboardPage() {
  const { data: bots = [], isLoading: botsLoading } = useBots()
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns()

  const dashboardData = useMemo(() => {
    const publishedBots = bots.filter((bot) => bot.status === "published")
    const totalSessions = bots.reduce((sum, bot) => sum + toSafeNumber(bot.executions), 0)
    const configuredPublished = publishedBots.filter((bot) => bot.isConfigured)
    const resolutionQuality =
      publishedBots.length > 0 ? (configuredPublished.length / publishedBots.length) * 100 : 0

    const activeCampaigns = campaigns.filter(
      (campaign) => campaign.status === "running" || campaign.status === "scheduled",
    )

    const weeklyConversations = buildWeeklySeries(bots)
    const conversationPeak = Math.max(1, ...weeklyConversations.map((point) => point.value))
    const operationsFeed = buildOperationsFeed(campaigns, bots)

    const managedBots: PortfolioBot[] = bots
      .slice()
      .sort((a, b) => toSafeNumber(b.executions) - toSafeNumber(a.executions))
      .slice(0, 4)
      .map((bot) => {
        const executions = toSafeNumber(bot.executions)
        const successes = toSafeNumber((bot as any).successfulExecutions)
        const status = mapBotStatus(bot.status)
        const successRate = executions > 0 ? (successes / executions) * 100 : 0

        return {
          name: bot.name,
          owner: triggerOwnerLabel(bot),
          status,
          sessions: executions,
          successRate,
          lastSync: toRelativeTime(bot.updatedAt),
        }
      })

    const kpiCards = [
      {
        title: "Total Sessions",
        value: totalSessions.toLocaleString(),
        delta: `${bots.length} bots`,
        note: "cumulative execution volume",
        progress: bots.length > 0 ? (publishedBots.length / bots.length) * 100 : 0,
        icon: MessageSquareTextIcon,
      },
      {
        title: "Active Bots",
        value: publishedBots.length.toString(),
        delta: `${bots.length - publishedBots.length} inactive`,
        note: "published and available",
        progress: bots.length > 0 ? (publishedBots.length / bots.length) * 100 : 0,
        icon: BotIcon,
      },
      {
        title: "Resolution Quality",
        value: `${resolutionQuality.toFixed(1)}%`,
        delta: `${configuredPublished.length}/${publishedBots.length || 0}`,
        note: "configured among live bots",
        progress: resolutionQuality,
        icon: ShieldCheckIcon,
      },
      {
        title: "Live Campaigns",
        value: activeCampaigns.length.toString(),
        delta: `${campaigns.length} total`,
        note: "running or scheduled",
        progress: campaigns.length > 0 ? (activeCampaigns.length / campaigns.length) * 100 : 0,
        icon: TrendingUpIcon,
      },
    ]

    return {
      weeklyConversations,
      conversationPeak,
      operationsFeed,
      managedBots,
      kpiCards,
      activeCampaignsCount: activeCampaigns.length,
      publishedBotsCount: publishedBots.length,
      hasLiveData: bots.length > 0 || campaigns.length > 0,
    }
  }, [bots, campaigns])

  const now = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date())

  const isRefreshing = botsLoading || campaignsLoading

  return (
    <div className="space-y-6 pb-8 animate-in fade-in zoom-in-95 duration-500">
      <Card className="relative overflow-hidden border-slate-200/80 bg-linear-to-br from-white via-white to-primary/15 shadow-sm dark:border-white/10 dark:from-[#262626] dark:via-[#242424] dark:to-[#3a3405]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-24 h-48 w-48 rounded-full bg-black/5 blur-3xl dark:bg-white/10" />
        <CardHeader className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Badge className="rounded-full bg-primary/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground shadow-sm">
              EY Intelligence Hub
            </Badge>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Command Center Dashboard
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Monitor bot estate health, campaign throughput, and experience quality in one premium operational cockpit.
              </CardDescription>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-start gap-2 sm:items-end">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
              {isRefreshing ? "Syncing" : "Last refresh"}
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{now}</span>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" className="h-8 rounded-full px-4 text-xs font-semibold" asChild>
                <Link to="/campaign">
                Explore Insights
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs font-semibold" asChild>
                <Link to="/bots">
                  Open Bots
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardData.kpiCards.map((item, index) => {
          const Icon = item.icon

          return (
            <Card
              key={item.title}
              className="group border-slate-200/80 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CardHeader className="space-y-3 pb-0">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    {item.title}
                  </p>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-primary-foreground ring-1 ring-primary/30">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold leading-none text-slate-900 dark:text-white">{item.value}</p>
                  <Badge variant="outline" className="rounded-full border-slate-300/70 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-slate-200">
                    {item.delta}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/70">
                  <div className="h-full rounded-full bg-linear-to-r from-primary to-amber-300" style={{ width: `${Math.max(6, Math.min(100, item.progress))}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <Card className="border-slate-200/80 dark:border-white/10">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weekly Execution Momentum</CardTitle>
              <CardDescription>Execution intensity from recently updated bot flows.</CardDescription>
            </div>
            <Badge className="rounded-full bg-primary/90 text-primary-foreground">Peak {dashboardData.conversationPeak.toLocaleString()}</Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            <div className="grid h-44 grid-cols-7 items-end gap-2">
              {dashboardData.weeklyConversations.map((point) => {
                const barHeight = Math.max(16, Math.round((point.value / dashboardData.conversationPeak) * 100))

                return (
                  <div key={`${point.label}-${point.value}`} className="flex h-full flex-col items-center justify-end gap-2">
                    <div
                      className="w-full rounded-t-xl bg-linear-to-t from-primary to-amber-200 shadow-[0_8px_20px_-10px_rgba(245,158,11,0.7)] transition-all duration-500 hover:brightness-105"
                      style={{ height: `${barHeight}%` }}
                    />
                    <span className="text-[11px] font-medium text-muted-foreground">{point.label}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Weighted executions
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Portfolio growth signal
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Operations Feed</CardTitle>
            <CardDescription>Live stream of campaign and bot updates from your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {dashboardData.operationsFeed.map((event) => (
              <div key={event.title} className="flex items-start gap-3 rounded-lg border border-slate-200/70 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/5">
                <span
                  className={[
                    "mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full",
                    event.tone === "success"
                      ? "bg-emerald-500"
                      : event.tone === "warning"
                        ? "bg-amber-500"
                        : "bg-slate-400",
                  ].join(" ")}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{event.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
                  <p className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <Clock3Icon className="h-3 w-3" />
                    {event.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200/80 dark:border-white/10">
        <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Bot Portfolio Performance</CardTitle>
            <CardDescription>Track reliability and engagement across mission-critical automations.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-full px-3 text-xs font-semibold" asChild>
            <Link to="/bots">
              Open Full Analytics
              <ArrowUpRightIcon className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1.1fr] gap-2 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <span>Bot</span>
              <span>Owner</span>
              <span>Status</span>
              <span>Success</span>
              <span className="text-right">Sessions</span>
            </div>
            <div className="divide-y divide-slate-200/70 dark:divide-white/10">
              {dashboardData.managedBots.map((bot) => (
                <div key={bot.name} className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1.1fr] gap-2 px-4 py-3 text-sm transition-colors hover:bg-slate-50/80 dark:hover:bg-white/5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{bot.name}</p>
                    <p className="text-xs text-muted-foreground">Updated {bot.lastSync}</p>
                  </div>
                  <p className="self-center text-muted-foreground">{bot.owner}</p>
                  <div className="self-center">
                    <Badge
                      variant="outline"
                      className={[
                        "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                        bot.status === "Live"
                          ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : bot.status === "Archived"
                            ? "border-slate-400/35 bg-slate-400/10 text-slate-600 dark:text-slate-300"
                            : "border-amber-500/35 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                      ].join(" ")}
                    >
                      {bot.status}
                    </Badge>
                  </div>
                  <p className="self-center font-medium text-slate-800 dark:text-slate-200">{bot.successRate.toFixed(1)}%</p>
                  <p className="self-center text-right font-semibold text-slate-900 dark:text-slate-100">{bot.sessions.toLocaleString()}</p>
                </div>
              ))}
              {dashboardData.managedBots.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No bots available yet. Create one to populate performance analytics.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200/80 bg-linear-to-r from-slate-50 to-amber-50/70 dark:border-white/10 dark:from-white/5 dark:to-[#3d3608]/40">
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <SparklesIcon className="h-4 w-4 text-amber-500" />
              Executive insight
            </p>
            <p className="text-sm text-muted-foreground">
              {dashboardData.hasLiveData
                ? `You currently have ${dashboardData.publishedBotsCount} live bots and ${dashboardData.activeCampaignsCount} active campaigns. Keep drafting bots configured before publish for stronger quality outcomes.`
                : "Kick off your first bot and campaign to activate live operational insights in this command center."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full bg-white/70 px-3 py-1 text-xs dark:bg-white/10">
              <ActivityIcon className="h-3.5 w-3.5" />
              Healthy throughput
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
