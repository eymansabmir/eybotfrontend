import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, GitBranch, Database, ShieldAlert, Workflow, ArrowRight, Server, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRoutingConfig, useOrchestrationStats } from "../../api/voice-tech-queries";

const TENANT_ID = "tenant-ey-001";

export function RoutingAnalyticsPage() {
  const { id } = useParams({ strict: false });
  const { data: config, isLoading: configLoading } = useRoutingConfig(id ?? null, TENANT_ID);
  const { data: stats, isLoading: statsLoading } = useOrchestrationStats(TENANT_ID, id ?? null);

  if (configLoading || statsLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse p-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!config || !stats) {
    return <div className="p-8 text-center text-muted-foreground">Analytics not found.</div>;
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* ── Header ────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30 p-8 rounded-3xl border border-border/50 shadow-sm group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
          <Workflow className="w-64 h-64" />
        </div>
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-6">
            <Link to="/voice-tech/routings">
              <Button variant="outline" size="icon" className="rounded-full bg-background shadow-sm hover:scale-105 transition-transform">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                  <GitBranch className="size-5 text-violet-600" />
                </div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">{config.name}</h1>
                <Badge variant="secondary" className="px-3 py-1 bg-violet-500/10 text-violet-600 border-none rounded-full">
                  Analytics View
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground/80 font-medium ml-14">
                Visualizing rule execution and provider distribution across {stats.totalRecords.toLocaleString()} records.
              </p>
            </div>
          </div>
        </div>

        {/* High-level KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-background/60 backdrop-blur-sm border border-border/50 p-5 rounded-2xl flex items-center gap-4 hover:shadow-md transition-all">
            <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Database className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Datasets Involved</p>
              <p className="text-xl font-bold text-foreground">
                {stats.datasets.length > 0 ? stats.datasets.join(", ") : "None"}
              </p>
            </div>
          </div>
          
          <div className="bg-background/60 backdrop-blur-sm border border-border/50 p-5 rounded-2xl flex items-center gap-4 hover:shadow-md transition-all">
            <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Total Executions</p>
              <p className="text-xl font-bold text-foreground">{stats.totalRecords.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-background/60 backdrop-blur-sm border border-border/50 p-5 rounded-2xl flex items-center gap-4 hover:shadow-md transition-all">
            <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Active Rules</p>
              <p className="text-xl font-bold text-foreground">{stats.rulesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Flowchart Area ────────────────────────────── */}
      <div className="mt-12 bg-muted/10 border border-border/40 rounded-3xl p-8 relative overflow-hidden">
        <h2 className="text-lg font-semibold tracking-tight mb-8 px-2 flex items-center gap-2">
          <Workflow className="size-5 text-muted-foreground" />
          Execution Flow Mapping
        </h2>
        
        {stats.ruleStats.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg">No execution data available yet.</p>
            <p className="text-sm mt-2">Execute a campaign to see the flowchart.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 relative z-10 px-4 md:px-12 pb-12">
            {stats.ruleStats.map((ruleStat, idx) => (
              <div key={ruleStat.ruleId} className="flex flex-col md:flex-row items-center gap-4 md:gap-8 group">
                
                {/* 1. Condition Node */}
                <div className="flex-1 w-full relative">
                  <div className="bg-background border-2 border-border/60 p-5 rounded-2xl shadow-sm group-hover:border-violet-500/40 group-hover:shadow-violet-500/10 transition-all duration-300 z-10 relative">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs bg-muted/30">Rule {idx + 1}</Badge>
                      <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">{ruleStat.ruleId.slice(0, 8)}</span>
                    </div>
                    <div className="font-mono text-sm text-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
                      {ruleStat.conditionsSummary}
                    </div>
                  </div>
                </div>

                {/* Flow Connector (Desktop) */}
                <div className="hidden md:flex flex-col items-center justify-center min-w-[120px] relative">
                  <div className="h-0.5 w-full bg-gradient-to-r from-border to-violet-500/50 absolute top-1/2 -translate-y-1/2 z-0" />
                  <div className="bg-background border border-violet-200/50 rounded-full px-3 py-1.5 z-10 text-xs font-semibold text-violet-600 shadow-sm flex items-center gap-1.5 group-hover:scale-110 group-hover:bg-violet-50 transition-all">
                    {((ruleStat.count / (stats.totalRecords || 1)) * 100).toFixed(1)}%
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider absolute top-6 bg-background px-2 z-10">
                    {ruleStat.count.toLocaleString()} calls
                  </div>
                </div>

                {/* Flow Connector (Mobile) */}
                <div className="md:hidden flex items-center justify-center w-full py-2">
                  <ArrowRight className="size-5 text-muted-foreground/50 rotate-90" />
                </div>

                {/* 2. Provider Node */}
                <div className="w-full md:w-64 relative">
                  <div className="bg-gradient-to-br from-background to-muted/20 border-2 border-border/60 p-5 rounded-2xl shadow-sm group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/10 transition-all duration-300 flex items-center gap-4 z-10 relative">
                    <div className="size-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Server className="size-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">Diverted to</p>
                      <p className="text-sm font-bold text-foreground truncate">{ruleStat.provider}</p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
