import type { ReactNode } from "react"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { UsersIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePmvbrAnalytics } from "@/features/campaign/api/campaign-queries"
import type { PmvbrBotAnalytics } from "@/features/campaign/types"

const BOT_COLORS = ["#6366f1", "#f97316", "#14b8a6", "#ec4899", "#eab308", "#3b82f6", "#a855f7", "#10b981"]

function buildPieData(byBot: PmvbrBotAnalytics[]) {
  return byBot.map((bot, index) => ({
    ...bot,
    name: bot.botName,
    value: bot.total,
    color: BOT_COLORS[index % BOT_COLORS.length],
  }))
}

export function PmvbrAnalyticsPanel() {
  const { data, isLoading } = usePmvbrAnalytics()

  if (isLoading || !data) {
    return (
      <Card className="border-slate-200/80 dark:border-white/10">
        <CardHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-72 w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const pieData = buildPieData(data.byBot)

  return (
    <Card className="border-slate-200/80 dark:border-white/10">
      <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">PMVBRY Processed Recipients</CardTitle>
          <CardDescription>
            Total unique recipients processed.
          </CardDescription>
        </div>
        <Badge className="rounded-full bg-primary/90 text-primary-foreground">
          {data.byBot.length} bots
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryStat
            label="Total processed"
            value={data.total.toLocaleString()}
            note="All PMVBR records"
            icon={<UsersIcon className="h-4 w-4" />}
          />
          <SummaryStat
            label="Launched"
            value={data.launched.toLocaleString()}
            note="Successfully queued"
          />
          <SummaryStat
            label="Failed"
            value={data.failed.toLocaleString()}
            note="Processing failures"
          />
        </div>

        {pieData.length > 0 ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <div className="relative mx-auto h-72 w-full max-w-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={108}
                    paddingAngle={3}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.botId} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name, item) => [
                      `${value.toLocaleString()} (${item.payload.percent}%)`,
                      item.payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-slate-900 dark:text-white">
                  {data.total.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Recipients
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200/70 dark:border-white/10">
              <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-2 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <span>Bot</span>
                <span className="text-right">Total</span>
                <span className="text-right">Launched</span>
                <span className="text-right">Share</span>
              </div>
              <div className="divide-y divide-slate-200/70 dark:divide-white/10">
                {data.byBot.map((bot, index) => (
                  <div
                    key={bot.botId}
                    className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-2 px-4 py-3 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: BOT_COLORS[index % BOT_COLORS.length] }}
                      />
                      <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {bot.botName}
                      </span>
                    </div>
                    <p className="self-center text-right font-semibold text-slate-900 dark:text-slate-100">
                      {bot.total.toLocaleString()}
                    </p>
                    <p className="self-center text-right text-muted-foreground">
                      {bot.launched.toLocaleString()}
                    </p>
                    <p className="self-center text-right font-medium text-slate-800 dark:text-slate-200">
                      {bot.percent}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200/70 text-sm text-muted-foreground dark:border-white/10">
            No PMVBR recipients processed yet. Launch a custom API campaign to populate this view.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryStat({
  label,
  value,
  note,
  icon,
}: {
  label: string
  value: string
  note: string
  icon?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}
