import { useMemo } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  GitBranch,
  CheckCircle2,
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
  TooltipProvider,
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
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4 text-center px-6 bg-background">
        <div className="size-14 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center">
          <BarChart3 className="size-6 text-muted-foreground/40" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">No analytics data found</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Analytics will appear here once calls are processed through this routing configuration.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-lg mt-2">
          <Link to="/voice-tech">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background -mx-8 -mt-8 px-8 pt-8 font-sans">
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">

          {/* ── 1. Header ───────────────────────────────────── */}
          <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full bg-card border border-border shadow-sm hover:bg-muted shrink-0" asChild>
                <Link to="/voice-tech">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    {stats.routingName}
                  </h1>
                  <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", STATUS_STYLES[stats.configStatus])}>
                    {stats.configStatus}
                  </div>
                  <div className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border text-[10px] font-bold uppercase tracking-wider">
                    {stats.routingType}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.rulesCount} rules configured &middot; {stats.datasets.length > 0 ? stats.datasets.join(", ") : "No dataset linked"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-10 px-4 bg-card border-border rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-muted"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
              Refresh Analytics
            </Button>
          </header>

          {/* ── 2. KPI Summary Cards ────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <StatsCard 
              title="Total Records" 
              value={(stats.totalDatasetRecords ?? 0).toLocaleString()} 
              trend="Dataset Size" 
              barColor="bg-primary"
              isTrendPositive={true}
              progress={100}
            />
            <StatsCard 
              title="Matched Audience" 
              value={(stats.liveMatchedCount ?? 0).toLocaleString()} 
              trend={`${formatPercentage(stats.liveMatchedCount ?? 0, stats.totalDatasetRecords ?? 1)} coverage`} 
              barColor="bg-emerald-500"
              isTrendPositive={true}
              progress={Math.round(((stats.liveMatchedCount ?? 0) / (stats.totalDatasetRecords ?? 1)) * 100)}
            />
            <StatsCard 
              title="Unmatched" 
              value={(stats.liveUnmatchedCount ?? 0).toLocaleString()} 
              trend="Outside Rules" 
              barColor="bg-amber-400"
              isTrendPositive={false}
              progress={Math.round(((stats.liveUnmatchedCount ?? 0) / (stats.totalDatasetRecords ?? 1)) * 100)}
            />
            <StatsCard 
              title="Calls Processed" 
              value={(stats.totalCallsProcessed ?? 0).toLocaleString()} 
              trend="Executed" 
              barColor="bg-primary"
              isTrendPositive={true}
              progress={80}
            />
            <StatsCard 
              title="Success Rate" 
              value={stats.totalCallsProcessed > 0 ? `${Math.round(((stats.totalCallsProcessed - stats.totalErrors) / stats.totalCallsProcessed) * 100)}%` : "0%"} 
              trend="Stable" 
              barColor="bg-emerald-500"
              isTrendPositive={true}
              progress={stats.totalCallsProcessed > 0 ? Math.round(((stats.totalCallsProcessed - stats.totalErrors) / stats.totalCallsProcessed) * 100) : 0}
            />
          </div>

          {/* ── 3. Provider Distribution ────────────────────── */}
          <div className="flex flex-col gap-8">
            <Card className="border-border shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="p-6 border-b border-border bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                      <Activity className="size-4 text-muted-foreground/60" />
                      Voice Provider Distribution
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">Workload balance across connected AI engines</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-card">
                {stats.providerBreakdown.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Zap className="size-8 text-muted/20 mb-3" />
                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Awaiting execution data...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {stats.providerBreakdown.map((provider) => {
                      const pct = totalProviderCalls > 0
                        ? Math.round((provider.callCount / totalProviderCalls) * 100)
                        : 0;
                      const colors = getProviderColor(provider.providerName);
                      return (
                        <div key={provider.providerId} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn("size-9 rounded-lg flex items-center justify-center text-[10px] font-black uppercase border shadow-sm", colors.bg, colors.text)}>
                                {provider.providerName.slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground capitalize">{provider.providerName}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight">
                                  {provider.callCount} calls {provider.avgDurationMs > 0 && `· ${formatMs(provider.avgDurationMs)}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                                <CheckCircle2 className="size-3" /> {provider.successCount}
                              </div>
                              <div className="text-[10px] font-bold text-foreground bg-muted px-2 py-1 rounded-md min-w-[36px] text-center">
                                {pct}%
                              </div>
                            </div>
                          </div>
                          <Progress
                            value={pct}
                            className="h-1.5 bg-muted"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="p-6 border-b border-border bg-card">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                  <GitBranch className="size-4 text-muted-foreground/60" />
                  Routing Logic Pipeline
                </CardTitle>
                <CardDescription className="text-xs mt-1">Visual flow from source dataset to voice providers</CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-card overflow-y-auto max-h-[400px] custom-scrollbar">
                {stats.ruleStats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">No rules found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.ruleStats.map((rule: RuleAnalyticsStat) => {
                      const colors = getProviderColor(rule.provider);
                      return (
                        <div
                          key={rule.ruleId}
                          className="flex items-center gap-4 rounded-xl border border-border p-4 bg-muted/10 hover:bg-muted/20 transition-colors"
                        >
                          <div className={cn(
                            "size-8 rounded-lg flex items-center justify-center text-xs font-black border shadow-sm shrink-0",
                            rule.isActive ? "bg-background text-foreground border-border" : "bg-muted text-muted-foreground border-border"
                          )}>
                            {rule.priority}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">
                              {rule.conditionsSummary}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest h-5 px-2", colors.text)}>
                                {rule.provider}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                {rule.matchCount} matches
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="size-4 text-slate-300" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── 4. Rules Detail Table ───────────────────────── */}
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-2">
                <BarChart3 className="size-4 text-muted-foreground/60" />
                Rules Performance Deep-Dive
              </CardTitle>
            </div>
            {stats.ruleStats.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">No rule execution history available</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6 h-12 w-20">Priority</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6 h-12">Rule Conditions</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6 h-12">Voice Provider</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6 h-12 text-right">Matched</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6 h-12 text-right">Processed</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6 h-12 text-right">Success Rate</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-6 h-12 text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.ruleStats.map((rule: RuleAnalyticsStat) => {
                      const colors = getProviderColor(rule.provider);
                      return (
                        <TableRow key={rule.ruleId} className="hover:bg-muted/50 border-b border-border last:border-0 transition-colors">
                          <TableCell className="px-6 py-5">
                            <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground border border-border">
                              {rule.priority}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <p className="text-sm font-bold text-foreground max-w-[350px] truncate">
                              {rule.conditionsSummary}
                            </p>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-1", colors.text)}>
                              {rule.provider}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-5 text-right font-bold text-foreground tabular-nums text-sm">
                            {(rule.matchCount ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="px-6 py-5 text-right font-bold text-foreground tabular-nums text-sm">
                            {(rule.callCount ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="px-6 py-5 text-right">
                            <span className={cn(
                              "text-xs font-black tabular-nums uppercase",
                              rule.successRate >= 90 ? "text-emerald-600" :
                              rule.successRate >= 50 ? "text-amber-600" :
                              rule.callCount === 0 ? "text-slate-300" :
                              "text-rose-600"
                            )}>
                              {rule.callCount > 0 ? `${rule.successRate}%` : "—"}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-5 text-right">
                            {rule.isActive ? (
                              <div className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">
                                Active
                              </div>
                            ) : (
                              <div className="inline-flex items-center px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border text-[9px] font-black uppercase tracking-wider">
                                Inactive
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}

function StatsCard({ title, value, trend, barColor, isTrendPositive, progress = 40 }: any) {
  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden rounded-xl border hover:shadow-md transition-all duration-300">
      <CardContent className="p-7">
        <div className="flex items-start justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">{title}</p>
          <div className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
            isTrendPositive ? "text-emerald-500 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10",
            trend === "Stable" && "text-muted-foreground bg-muted"
          )}>
            {trend}
          </div>
        </div>
        <div className="mt-5">
          <h3 className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </h3>
          <div className="mt-8 h-1 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", barColor)} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
