import { useState, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Database,
  GitBranch,
  CheckCircle2,
  Activity,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  useEntityTypes,
  useRoutingConfigs,
  useRoutingConfig,
  useBulkExecuteRouting,
} from "../../api/voice-tech-queries";
import { voiceTechApi } from "../../api/voice-tech-api";
import { CsvUploadPanel } from "../components/ingest/csv-upload-panel";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";

const TENANT_ID = "tenant-ey-001";

type WizardStep = "datasets" | "routing" | "review" | "processing" | "results";

export function ExecutePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>("datasets");
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [result, setResult] = useState<{
    totalProcessed: number;
    initiated: number;
    failed: number;
    skipped: number;
  } | null>(null);

  const { data: entityTypes = [], isLoading: datasetsLoading } = useEntityTypes(TENANT_ID);
  const { data: configs = [], isLoading: configsLoading } = useRoutingConfigs(TENANT_ID);
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

  const toggleDataset = (type: string) => {
    setSelectedDatasets((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleExecute = () => {
    if (!selectedConfigId || selectedDatasets.length === 0) return;
    setStep("processing");
    bulkExecute.mutate(
      { tenantId: TENANT_ID, routingConfigId: selectedConfigId, entityTypes: selectedDatasets },
      {
        onSuccess: (data) => {
          setResult({
            totalProcessed: data.totalProcessed,
            initiated: data.initiated,
            failed: data.failed,
            skipped: data.skipped,
          });
          setStep("results");
        },
        onError: () => setStep("review"),
      }
    );
  };

  const reset = () => {
    setStep("datasets");
    setSelectedDatasets([]);
    setSelectedConfigId(null);
    setResult(null);
  };

  const WIZARD_STEPS = [
    { key: "datasets", label: "Select Datasets", number: 1 },
    { key: "routing", label: "Select Routing", number: 2 },
    { key: "review", label: "Review & Execute", number: 3 },
  ] as const;

  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.key === step);

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Link to="/voice-tech">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Step 3</p>
          <h1 className="text-2xl font-bold tracking-tight">Execute Calls</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select your data, choose routing rules, and launch execution.
          </p>
        </div>
      </div>

      {/* ── Progress Stepper ──────────────────────────── */}
      {step !== "processing" && step !== "results" && (
        <div className="flex items-center gap-2">
          {WIZARD_STEPS.map((ws, i) => {
            const isActive = ws.key === step;
            const isDone = currentStepIndex > i;
            return (
              <div key={ws.key} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 transition-all",
                    isActive && "border-primary bg-primary/5",
                    isDone && "border-emerald-500/30 bg-emerald-500/5",
                    !isActive && !isDone && "border-border/60 bg-muted/10"
                  )}
                >
                  <div
                    className={cn(
                      "size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      isActive && "bg-primary text-primary-foreground",
                      isDone && "bg-emerald-500 text-white",
                      !isActive && !isDone && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isDone ? <CheckCircle2 className="size-3.5" /> : ws.number}
                  </div>
                  <span className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {ws.label}
                  </span>
                </div>
                {i < WIZARD_STEPS.length - 1 && (
                  <ArrowRight className="size-4 text-muted-foreground/40 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Step 1: Select Datasets ───────────────────── */}
      {step === "datasets" && (
        <div className="space-y-4">
          <h2 className="text-base font-bold">Which datasets should be processed?</h2>
          {datasetsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : entityTypes.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed rounded-xl">
              <p className="text-sm text-muted-foreground mb-3">No datasets available. Upload data first.</p>
              
              <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Database className="size-4" />
                    Upload Dataset
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[440px] sm:max-w-[440px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Upload Dataset</SheetTitle>
                  </SheetHeader>
                  <CsvUploadPanel tenantId={TENANT_ID} entityType="" />
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold">Select datasets</h2>
                
                <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                      <Plus className="size-3.5" />
                      Upload New
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[440px] sm:max-w-[440px]">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Upload Dataset</SheetTitle>
                    </SheetHeader>
                    <CsvUploadPanel tenantId={TENANT_ID} entityType="" />
                  </SheetContent>
                </Sheet>
              </div>
              <div className="space-y-2">
                {entityTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => toggleDataset(type.name)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                      selectedDatasets.includes(type.name)
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-border hover:bg-muted/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Database className={cn("size-4", selectedDatasets.includes(type.name) ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-sm font-semibold">{type.name}</span>
                    </div>
                    <Checkbox checked={selectedDatasets.includes(type.name)} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setStep("routing")}
                  disabled={selectedDatasets.length === 0}
                  className="gap-2"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Step 2: Select Routing ────────────────────── */}
      {step === "routing" && (
        <div className="space-y-4">
          <h2 className="text-base font-bold">Which routing group should process the calls?</h2>
          {configsLoading ? (
            <Skeleton className="h-10 rounded-lg" />
          ) : configs.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed rounded-xl">
              <p className="text-sm text-muted-foreground mb-3">No routing groups available. Create one first.</p>
              <Link to="/voice-tech/routings">
                <Button variant="outline" className="gap-2">
                  <GitBranch className="size-4" />
                  Go to Routing
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Select value={selectedConfigId ?? ""} onValueChange={setSelectedConfigId}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Choose a routing group..." />
                </SelectTrigger>
                <SelectContent>
                  {configs.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="py-3">
                      <div className="flex items-center gap-2">
                        <GitBranch className="size-4 text-violet-500" />
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep("datasets")}>Back</Button>
                <Button onClick={() => setStep("review")} disabled={!selectedConfigId} className="gap-2">
                  Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Step 3: Review & Execute ──────────────────── */}
      {step === "review" && (
        <div className="space-y-6">
          <h2 className="text-base font-bold">Review and confirm execution</h2>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border bg-muted/20 flex items-center gap-4">
              <Database className="size-5 text-blue-500" />
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">Datasets</p>
                <p className="text-sm font-semibold">{selectedDatasets.join(", ")}</p>
              </div>
              <Badge variant="outline" className="ml-auto">{selectedDatasets.length} selected</Badge>
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

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("routing")}>Back</Button>
            <Button onClick={handleExecute} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
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
              Processing {selectedDatasets.length} dataset(s) through "{selectedConfig?.name}"...
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
            <Button variant="outline" onClick={reset} className="flex-1">
              New Execution
            </Button>
            {selectedConfigId && (
              <Button
                className="flex-1 gap-2"
                onClick={() => navigate({ to: `/voice-tech/routings/${selectedConfigId}/analytics` })}
              >
                <Activity className="size-4" />
                View Analytics
              </Button>
            )}
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
