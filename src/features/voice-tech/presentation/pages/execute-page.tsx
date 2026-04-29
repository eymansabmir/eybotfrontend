import { useState, useMemo, useEffect } from "react";
import { useQueries } from "@tanstack/react-query";
import { useNavigate, useLocation } from "@tanstack/react-router";
import {
  ArrowLeft,
  Zap,
  Database,
  GitBranch,
  CheckCircle2,
  Activity,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useRoutingConfigs,
  useRoutingConfig,
  useBulkExecuteRouting,
  useCampaignStatusPolling,
} from "../../api/voice-tech-queries";
import { voiceTechApi } from "../../api/voice-tech-api";

const TENANT_ID = "tenant-ey-001";

type WizardStep = "review" | "processing" | "results";

export function ExecutePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const autoDataset = (location.state as any)?.autoDataset;
  const initialConfigId = (location.state as any)?.selectedConfigId;
  
  const [step, setStep] = useState<WizardStep>("review");
  const [selectedDatasets] = useState<string[]>(
    autoDataset ? [autoDataset] : []
  );
  const [selectedConfigId] = useState<string | null>(
    initialConfigId || null
  );
  
  const [result, setResult] = useState<{
    totalProcessed: number;
    initiated: number;
    failed: number;
    skipped: number;
  } | null>(null);

  const { data: configs = [] } = useRoutingConfigs(TENANT_ID);
  const { data: fullConfig } = useRoutingConfig(selectedConfigId, TENANT_ID);
  const bulkExecute = useBulkExecuteRouting();

  // Calculate combined audience
  const combinedConditions = useMemo(() => {
    if (!fullConfig?.rules || fullConfig.rules.length === 0) return null;
    if (fullConfig.rules.length === 1) return fullConfig.rules[0].conditions;
    
    return {
      operator: "OR" as const,
      children: fullConfig.rules.map(r => r.conditions)
    };
  }, [fullConfig]);

  const audienceQueries = useQueries({
    queries: selectedDatasets.map(type => ({
      queryKey: ["voice-tech", "query-entities", TENANT_ID, type, combinedConditions],
      queryFn: () => voiceTechApi.queryEntitiesByRule({
        tenantId: TENANT_ID,
        entityType: type,
        conditions: combinedConditions as any,
        countOnly: true
      }),
      enabled: !!combinedConditions && step === "review",
      staleTime: 30000,
    }))
  });

  const totalMatchedCount = audienceQueries.reduce((sum, query) => sum + (query.data?.count ?? 0), 0);
  const isAudienceLoading = audienceQueries.some(q => q.isLoading);

  const selectedConfig = configs.find((c) => c.id === selectedConfigId);

  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const { data: jobStatus } = useCampaignStatusPolling(currentJobId);

  // Monitor job status
  useEffect(() => {
    if (!currentJobId || !jobStatus) return;
    if (jobStatus.status === "completed" || jobStatus.status === "failed") {
      setResult({
        totalProcessed: jobStatus.totalProcessed ?? 0,
        initiated: jobStatus.initiated ?? 0,
        failed: jobStatus.failed ?? 0,
        skipped: jobStatus.skipped ?? 0,
      });
      setStep("results");
      setCurrentJobId(null);
    }
  }, [jobStatus, currentJobId]);

  const handleExecute = () => {
    if (!selectedConfigId || selectedDatasets.length === 0) return;
    setStep("processing");
    bulkExecute.mutate(
      { tenantId: TENANT_ID, routingConfigId: selectedConfigId, entityTypes: selectedDatasets },
      {
        onSuccess: (data) => {
          setCurrentJobId(data.jobId);
        },
        onError: () => setStep("review"),
      }
    );
  };

  // If no data was passed, redirect back
  useEffect(() => {
    if (!autoDataset || !initialConfigId) {
      navigate({ to: "/voice-tech" });
    }
  }, [autoDataset, initialConfigId, navigate]);

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-6">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/voice-tech" })} className="rounded-full">
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Execute Calls</h1>
          <p className="text-sm text-muted-foreground">Review and launch your voice orchestration.</p>
        </div>
      </div>

      {/* ── Review Step ──────────────────────────────── */}
      {step === "review" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="p-4 rounded-xl border bg-muted/20 flex items-center gap-4">
              <Database className="size-5 text-blue-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Dataset</p>
                <p className="text-sm font-semibold">{selectedDatasets.join(", ")}</p>
              </div>
              <Badge variant="outline" className="ml-auto">Active</Badge>
            </div>

            <div className="p-4 rounded-xl border bg-muted/20 flex items-center gap-4">
              <GitBranch className="size-5 text-violet-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Routing Group</p>
                <p className="text-sm font-semibold">{selectedConfig?.name ?? "Unknown"}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-[#FFE600]/10 border-[#FFE600]/20 flex items-center gap-4">
              <Activity className="size-5 text-[#1A1A24]" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Matched Audience</p>
                <div className="flex items-baseline gap-1.5">
                   {isAudienceLoading ? (
                     <Skeleton className="h-6 w-16" />
                   ) : (
                     <p className="text-xl font-black text-[#1A1A24]">{totalMatchedCount.toLocaleString()}</p>
                   )}
                   <p className="text-[10px] text-muted-foreground font-bold uppercase">Target Entities</p>
                </div>
              </div>
              <Badge className="ml-auto bg-[#1A1A24] text-white hover:bg-[#1A1A24]/90 border-none">Live Sync</Badge>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
            <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 leading-relaxed">
              This will initiate calls for all matching entities across the selected datasets.
              Ensure your voice providers are correctly configured before proceeding.
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleExecute} size="lg" className="gap-2 px-8 bg-[#FFE600] text-[#1A1A24] hover:bg-[#FFE600]/90 border-none font-bold">
              <Zap className="size-4" />
              Execute Now
            </Button>
          </div>
        </div>
      )}

      {/* ── Processing ────────────────────────────────── */}
      {step === "processing" && (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
          <div className="relative">
            <div className="size-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-primary animate-pulse" />
          </div>
          <div>
            <p className="text-xl font-bold">Executing Calls</p>
            <p className="text-sm text-muted-foreground mt-1">
              Processing through "{selectedConfig?.name}"...
            </p>
          </div>
        </div>
      )}

      {/* ── Results ───────────────────────────────────── */}
      {step === "results" && result && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-6 flex items-center gap-4">
            <CheckCircle2 className="size-8 text-emerald-500 shrink-0" />
            <div>
              <p className="text-lg font-bold text-foreground">Execution Complete</p>
              <p className="text-sm text-muted-foreground">
                Processed through "{selectedConfig?.name}" routing group.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard label="Total Scanned" value={result.totalProcessed} color="text-foreground" bg="bg-muted/20" />
            <ResultCard label="Calls Initiated" value={result.initiated} color="text-emerald-700" bg="bg-emerald-500/10 border-emerald-500/20" />
            <ResultCard label="Skipped" value={result.skipped} color="text-amber-700" bg="bg-amber-500/10 border-amber-500/20" />
            <ResultCard label="Failed" value={result.failed} color="text-rose-700" bg="bg-rose-500/10 border-rose-500/20" />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => navigate({ to: `/voice-tech/routings/${selectedConfigId}/analytics` as any })} 
              className="w-full gap-2 h-12 text-base bg-[#FFE600] text-[#1A1A24] hover:bg-[#FFE600]/90 border-none font-bold"
            >
              <BarChart3 className="size-5" />
              View Full Analytics
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={cn("p-4 rounded-xl border flex flex-col", bg)}>
      <span className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{label}</span>
      <span className={cn("text-2xl font-bold", color)}>{value.toLocaleString()}</span>
    </div>
  );
}
