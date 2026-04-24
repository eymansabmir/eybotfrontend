import { useMemo } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Database,
  GitBranch,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Activity,
  Zap,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useOrchestrationStats } from "../../api/voice-tech-queries";
import type { RuleAnalyticsStat } from "../../types";

const TENANT_ID = "tenant-ey-001";

// ─── Provider Colors ────────────────────────────────────────────
const PROVIDER_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  elevenlabs: { bg: "bg-violet-500/10 dark:bg-violet-500/20", text: "text-violet-700 dark:text-violet-400", bar: "bg-violet-500" },
  sarvam:     { bg: "bg-amber-500/10 dark:bg-amber-500/20",  text: "text-amber-700 dark:text-amber-400",  bar: "bg-amber-500" },
  vapi:       { bg: "bg-cyan-500/10 dark:bg-cyan-500/20",    text: "text-cyan-700 dark:text-cyan-400",    bar: "bg-cyan-500" },
  exotel:     { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", bar: "bg-emerald-500" },
  default:    { bg: "bg-blue-500/10 dark:bg-blue-500/20",    text: "text-blue-700 dark:text-blue-400",    bar: "bg-blue-500" },
};

function getProviderColor(name: string) {
  const key = name.toLowerCase();
  return PROVIDER_COLORS[key] || PROVIDER_COLORS.default;
}

// ─── Status Badge Styles ────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  DRAFT:  "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  PAUSED: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
};

// ─── Helpers ────────────────────────────────────────────────────
function formatMs(ms: number): string {
  if (ms === 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

// ─── Loading Skeleton ───────────────────────────────────────────
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClassName,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconClassName?: string;
}) {
  return (
    <Card className="py-4 gap-3">
      <CardContent className="flex items-center gap-4">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", iconClassName)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ═════════════════════════════════════════════════════════════════
// ─── Main Page ──────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════
export function RoutingAnalyticsPage() {
  const { id: configId } = useParams({ strict: false });
  const { data: stats, isLoading, refetch, isFetching } = useOrchestrationStats(TENANT_ID, configId || null);

  const totalProviderCalls = useMemo(
    () => stats?.providerBreakdown?.reduce((sum, p) => sum + p.callCount, 0) ?? 0,
    [stats]
  );

  // ── Loading State ─────────────────────────────────────────────
  if (isLoading) return <AnalyticsSkeleton />;

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 text-center px-6">
        <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
          <BarChart3 className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">No analytics data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Analytics will appear here once calls are processed through this routing configuration.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/voice-tech/routings">Back to Routing</Link>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 font-sans">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* ── 1. Header ───────────────────────────────────── */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-lg shrink-0" asChild>
                <Link to="/voice-tech/routings">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">
                    {stats.routingName}
                  </h1>
                  <Badge variant="outline" className={cn("text-[10px] font-semibold uppercase", STATUS_STYLES[stats.configStatus])}>
                    {stats.configStatus}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                    {stats.routingType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {stats.rulesCount} routing {stats.rulesCount === 1 ? "rule" : "rules"} &middot; {stats.datasets.length > 0 ? stats.datasets.join(", ") : "No dataset linked"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 self-start sm:self-auto"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
              Refresh
            </Button>
          </header>

          {/* ── 2. KPI Summary Cards ────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={Phone}
              label="Calls Processed"
              value={(stats.totalCallsProcessed ?? 0).toLocaleString()}
              sub={`${(stats.totalEvents ?? 0).toLocaleString()} total pipeline events`}
              iconClassName="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
            />
            <KpiCard
              icon={CheckCircle2}
              label="Rules Matched"
              value={(stats.totalRulesMatched ?? 0).toLocaleString()}
              sub={(stats.totalCallsProcessed ?? 0) > 0
                ? `${formatPercentage(stats.totalRulesMatched ?? 0, (stats.totalRulesMatched ?? 0) + (stats.totalNoMatch ?? 0))} match rate`
                : "No calls yet"
              }
              iconClassName="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Unmatched / Errors"
              value={((stats.totalNoMatch ?? 0) + (stats.totalErrors ?? 0)).toLocaleString()}
              sub={`${stats.totalNoMatch ?? 0} unmatched · ${stats.totalErrors ?? 0} errors`}
              iconClassName="bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
            />
            <KpiCard
              icon={Clock}
              label="Avg. Response Time"
              value={formatMs(stats.avgResponseTimeMs)}
              sub="From provider result events"
              iconClassName="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400"
            />
          </div>

          {/* ── 3. Provider Distribution ────────────────────── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="size-4 text-muted-foreground" />
                Voice Provider Distribution
              </CardTitle>
              <CardDescription>
                How calls are distributed across your voice providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.providerBreakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="size-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Zap className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No provider data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Provider metrics appear once calls are executed through this routing.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.providerBreakdown.map((provider) => {
                    const pct = totalProviderCalls > 0
                      ? Math.round((provider.callCount / totalProviderCalls) * 100)
                      : 0;
                    const colors = getProviderColor(provider.providerName);
                    return (
                      <div key={provider.providerId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={cn("size-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase", colors.bg, colors.text)}>
                              {provider.providerName.slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground capitalize">{provider.providerName}</p>
                              <p className="text-xs text-muted-foreground">
                                {provider.callCount} {provider.callCount === 1 ? "call" : "calls"}
                                {provider.avgDurationMs > 0 && ` · avg ${formatMs(provider.avgDurationMs)}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 cursor-default">
                                  <CheckCircle2 className="size-3" /> {provider.successCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Successful calls</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 cursor-default">
                                  <XCircle className="size-3" /> {provider.errorCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Failed calls</TooltipContent>
                            </Tooltip>
                            <Badge variant="secondary" className="tabular-nums font-semibold text-[11px] min-w-[40px] justify-center">
                              {pct}%
                            </Badge>
                          </div>
                        </div>
                        <Progress
                          value={pct}
                          className="h-2 bg-muted"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── 4. Routing Flow Visualization ───────────────── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <GitBranch className="size-4 text-muted-foreground" />
                Routing Flow
              </CardTitle>
              <CardDescription>
                How your data flows from the source dataset through rules to voice providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.ruleStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm font-medium text-foreground">No rules configured</p>
                  <p className="text-xs text-muted-foreground mt-1">Add routing rules to see the flow visualization.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_220px] gap-0 lg:gap-0 items-stretch">

                  {/* Column 1: Dataset Source */}
                  <div className="flex items-center justify-center lg:border-r border-border px-4 py-6">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="size-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                        <Database className="size-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {stats.datasets[0] || "All Data"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Data Source</p>
                        {stats.totalDatasetRecords !== undefined && (
                          <Badge variant="secondary" className="mt-2 text-[10px]">
                            {stats.totalDatasetRecords.toLocaleString()} records
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Rule Conditions */}
                  <div className="flex flex-col gap-2 px-4 py-3 lg:border-r border-border">
                    {stats.ruleStats.map((rule: RuleAnalyticsStat) => {
                      const colors = getProviderColor(rule.provider);
                      return (
                        <div
                          key={rule.ruleId}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                            "bg-card hover:bg-accent/50 cursor-default"
                          )}
                        >
                          {/* Connector dot */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className={cn(
                              "size-6 rounded-md flex items-center justify-center text-[10px] font-bold",
                              rule.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                            )}>
                              {rule.priority}
                            </div>
                            <ChevronRight className="size-3 text-muted-foreground hidden lg:block" />
                          </div>

                          {/* Rule condition */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {rule.conditionsSummary}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {rule.matchCount} matched · {rule.callCount} processed
                            </p>
                          </div>

                          {/* Arrow to provider */}
                          <ChevronRight className="size-3.5 text-muted-foreground shrink-0 hidden lg:block" />

                          {/* Provider chip */}
                          <Badge variant="outline" className={cn("shrink-0 text-[10px] font-semibold capitalize", colors.text)}>
                            {rule.provider}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>

                  {/* Column 3: Provider Summary */}
                  <div className="flex flex-col gap-2 px-4 py-3">
                    {stats.providerBreakdown.length > 0 ? (
                      stats.providerBreakdown.map((p) => {
                        const colors = getProviderColor(p.providerName);
                        const pct = totalProviderCalls > 0
                          ? Math.round((p.callCount / totalProviderCalls) * 100)
                          : 0;
                        return (
                          <div
                            key={p.providerId}
                            className="flex items-center gap-3 rounded-lg border px-3 py-2.5 bg-card"
                          >
                            <div className={cn("size-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase", colors.bg, colors.text)}>
                              {p.providerName.slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground capitalize truncate">{p.providerName}</p>
                              <p className="text-[11px] text-muted-foreground tabular-nums">{p.callCount} calls · {pct}%</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      // Show a placeholder based on rule provider names
                      [...new Set(stats.ruleStats.map((r: RuleAnalyticsStat) => r.provider))].map((name) => {
                        const colors = getProviderColor(name);
                        return (
                          <div key={name} className="flex items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 bg-card">
                            <div className={cn("size-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase", colors.bg, colors.text)}>
                              {name.slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground capitalize truncate">{name}</p>
                              <p className="text-[11px] text-muted-foreground">0 calls · awaiting data</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── 5. Rules Detail Table ───────────────────────── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="size-4 text-muted-foreground" />
                Rules Performance
              </CardTitle>
              <CardDescription>
                Detailed breakdown of each routing rule&apos;s performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.ruleStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No rules configured for this routing.</p>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16 pl-6">Priority</TableHead>
                        <TableHead>Rule Conditions</TableHead>
                        <TableHead>Voice Provider</TableHead>
                        <TableHead className="text-right">Matched</TableHead>
                        <TableHead className="text-right">Processed</TableHead>
                        <TableHead className="text-right">Success Rate</TableHead>
                        <TableHead className="text-right pr-6">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.ruleStats.map((rule: RuleAnalyticsStat) => {
                        const colors = getProviderColor(rule.provider);
                        return (
                          <TableRow key={rule.ruleId}>
                            <TableCell className="pl-6">
                              <Badge variant="outline" className="font-mono text-xs w-8 justify-center">
                                {rule.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium text-foreground max-w-[300px] truncate">
                                {rule.conditionsSummary}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cn("text-xs font-semibold capitalize", colors.text)}>
                                {rule.provider}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              {(rule.matchCount ?? 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-medium">
                              {(rule.callCount ?? 0).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={cn(
                                "text-sm font-semibold tabular-nums",
                                rule.successRate >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                                rule.successRate >= 50 ? "text-amber-600 dark:text-amber-400" :
                                rule.callCount === 0 ? "text-muted-foreground" :
                                "text-red-600 dark:text-red-400"
                              )}>
                                {rule.callCount > 0 ? `${rule.successRate}%` : "—"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-semibold",
                                  rule.isActive
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {rule.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </TooltipProvider>
  );
}
