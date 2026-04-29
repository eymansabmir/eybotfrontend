import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronRight,
  Database,
  GitBranch,
  Zap,
  Check,
  Loader2,
  Plus,
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { 
  useEntityTypes, 
  useCreateRoutingConfig, 
  useUpsertRoutingRule, 
  useRoutingConfig,
  useBulkExecuteRouting,
  useCampaignStatusPolling,
  useRoutingConfigs,
  useUpdateRoutingConfig,
  useDeleteRoutingRule,
  useToggleRuleActive
} from "../../api/voice-tech-queries";
import { DatasetSelector } from "../components/wizard/dataset-selector";
import { RoutingRuleList } from "../components/rule-builder/routing-rule-list";
import { CreateRoutingRuleDialog } from "../components/rule-builder/create-rule-dialog";
import { useQueries } from "@tanstack/react-query";
import { voiceTechApi } from "../../api/voice-tech-api";
import type { RoutingRule } from "../../types";

const TENANT_ID = "tenant-ey-001";

const STEPS = [
  { id: 1, name: "Select Dataset", icon: Database, description: "Choose or upload your data source" },
  { id: 2, name: "Define Rules", icon: GitBranch, description: "Configure routing logic" },
  { id: 3, name: "Execute", icon: Zap, description: "Finalize and execute" },
];

export function OrchestrationWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [orchestrationName, setOrchestrationName] = useState("");
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);
  const [createdConfigId, setCreatedConfigId] = useState<string | null>(null);
  
  const search = useSearch({ from: "/voice-tech/create" }) as any;

  // Queries
  const { data: datasets = [] } = useEntityTypes(TENANT_ID);
  const { data: existingConfigs = [] } = useRoutingConfigs(TENANT_ID);
  const createConfig = useCreateRoutingConfig();
  const updateConfig = useUpdateRoutingConfig(TENANT_ID);
  const upsertRule = useUpsertRoutingRule(TENANT_ID);
  const deleteRule = useDeleteRoutingRule(createdConfigId ?? "", TENANT_ID);
  const toggleRule = useToggleRuleActive(createdConfigId ?? "", TENANT_ID);
  const { data: fullConfig, isLoading: rulesLoading } = useRoutingConfig(createdConfigId, TENANT_ID);

  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);

  const matchedExistingConfigs = useMemo(() => {
    if (!orchestrationName || orchestrationName.length < 2) return [];
    return existingConfigs.filter(c => 
      c.name.toLowerCase().includes(orchestrationName.toLowerCase())
    ).slice(0, 5);
  }, [orchestrationName, existingConfigs]);

  const handleSelectExisting = (config: any) => {
    setOrchestrationName(config.name);
    setCreatedConfigId(config.id);
    if (config.entityTypeIds && config.entityTypeIds.length > 0) {
      setSelectedDatasetIds(config.entityTypeIds);
    } else if (config.entityTypeId) {
      setSelectedDatasetIds([config.entityTypeId]);
    }
  };

  // Direct edit effect
  useEffect(() => {
    if (search.edit && existingConfigs.length > 0 && createdConfigId !== search.edit) {
      const config = existingConfigs.find(c => c.id === search.edit);
      if (config) {
        handleSelectExisting(config);
        if (search.step) {
          setCurrentStep(Number(search.step));
        }
      }
    }
  }, [search.edit, search.step, existingConfigs, createdConfigId]);

  // Step 2 Rule Builder State
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const selectedDatasets = datasets.filter(d => selectedDatasetIds.includes(d.id));
  const datasetNames = selectedDatasets.map(d => d.name);

  const attributesQueries = useQueries({
    queries: datasetNames.map((type) => ({
      queryKey: ["voice-tech", "attributes", TENANT_ID, type],
      queryFn: () => voiceTechApi.listAttributes({ tenantId: TENANT_ID, entityType: type }),
      staleTime: 60000,
    })),
  });

  const groupedAttributes = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    attributesQueries.forEach((query, index) => {
      if (query.data) {
        grouped[datasetNames[index]] = query.data;
      }
    });
    return grouped;
  }, [attributesQueries, datasetNames]);

  // Handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (!orchestrationName || selectedDatasetIds.length === 0) return;
      
      // Create or Update config
      if (!createdConfigId) {
        createConfig.mutate({
          tenantId: TENANT_ID,
          name: orchestrationName,
          entityTypeId: selectedDatasetIds[0], 
          entityTypeIds: selectedDatasetIds,
        }, {
          onSuccess: (config) => {
            setCreatedConfigId(config.id);
            setCurrentStep(2);
          }
        });
      } else {
        // Update existing one to ensure datasets are synced
        updateConfig.mutate({
          id: createdConfigId,
          name: orchestrationName,
          entityTypeIds: selectedDatasetIds,
        }, {
          onSuccess: () => {
            setCurrentStep(2);
          }
        });
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const [executionResult, setExecutionResult] = useState<{
    totalProcessed: number;
    initiated: number;
    failed: number;
    skipped: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  
  const bulkExecute = useBulkExecuteRouting();
  const { data: jobStatus } = useCampaignStatusPolling(currentJobId);

  // Monitor job status
  useEffect(() => {
    if (!currentJobId || !jobStatus) return;
    if (jobStatus.status === "completed" || jobStatus.status === "failed") {
      setExecutionResult({
        totalProcessed: jobStatus.totalProcessed ?? 0,
        initiated: jobStatus.initiated ?? 0,
        failed: jobStatus.failed ?? 0,
        skipped: jobStatus.skipped ?? 0,
      });
      setIsProcessing(false);
      setCurrentJobId(null);
    }
  }, [jobStatus, currentJobId]);

  const handleExecute = () => {
    if (!createdConfigId || datasetNames.length === 0) return;
    setIsProcessing(true);
    bulkExecute.mutate(
      { tenantId: TENANT_ID, routingConfigId: createdConfigId, entityTypes: datasetNames },
      {
        onSuccess: (data) => {
          setCurrentJobId(data.jobId);
        },
        onError: () => setIsProcessing(false),
      }
    );
  };

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
    queries: datasetNames.map(type => ({
      queryKey: ["voice-tech", "query-entities", TENANT_ID, type, combinedConditions],
      queryFn: () => voiceTechApi.queryEntitiesByRule({
        tenantId: TENANT_ID,
        entityType: type,
        conditions: combinedConditions as any,
        countOnly: true
      }),
      enabled: !!combinedConditions && currentStep === 3,
      staleTime: 30000,
    }))
  });

  const totalMatchedCount = audienceQueries.reduce((sum, query) => sum + (query.data?.count ?? 0), 0);
  const isAudienceLoading = audienceQueries.some(q => q.isLoading);

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* ── Progress Header ───────────────────────────────── */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link to="/voice-tech">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {createdConfigId ? "Edit Orchestration" : "Create New Orchestration"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {createdConfigId 
                ? `Modifying "${orchestrationName}" routing configuration.` 
                : "Set up a unified voice call strategy in minutes."
              }
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative flex justify-between items-center px-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 -z-10 mx-10" />
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                <div className={cn(
                  "size-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isActive ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : 
                  isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : 
                  "bg-card border-border text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="size-5" /> : <Icon className="size-5" />}
                </div>
                <div className="text-center">
                  <p className={cn("text-xs font-bold", isActive ? "text-primary" : isCompleted ? "text-emerald-600" : "text-muted-foreground")}>
                    {step.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step Content ──────────────────────────────────── */}
      <Card className="border-border/60 shadow-xl overflow-hidden rounded-2xl bg-card/50 backdrop-blur-sm">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-foreground ml-1">Orchestration Name</label>
                  <div className="relative">
                    <Input 
                      placeholder="e.g., Q4 Customer Feedback" 
                      value={orchestrationName}
                      onChange={(e) => {
                        setOrchestrationName(e.target.value);
                        setCreatedConfigId(null); 
                      }}
                      className={cn(
                        "h-12 rounded-xl bg-card border-border/60 focus:ring-primary/20 text-lg font-medium",
                        createdConfigId && "border-emerald-500/50 bg-emerald-50/10"
                      )}
                    />
                    {createdConfigId && (
                      <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-emerald-500" />
                    )}

                    {/* Custom Search Results Dropdown */}
                    {matchedExistingConfigs.length > 0 && !createdConfigId && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-2 p-2 rounded-xl bg-card border border-border shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5 font-bold">Existing Orchestrations</p>
                        <div className="space-y-1">
                          {matchedExistingConfigs.map(config => (
                            <button 
                              key={config.id} 
                              onClick={() => handleSelectExisting(config)}
                              className="w-full flex items-center justify-between rounded-lg py-2 px-3 hover:bg-muted transition-colors text-left"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight className="size-3.5 text-blue-500" />
                                <span className="text-sm font-medium">{config.name}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200">Edit</Badge>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {matchedExistingConfigs.some(c => c.name.toLowerCase() === orchestrationName.toLowerCase()) && !createdConfigId && (
                    <p className="text-[10px] text-amber-600 font-bold mt-1 ml-1 flex items-center gap-1">
                      <AlertTriangle className="size-3" />
                      An orchestration with this name already exists. Select it from the list or use a different name.
                    </p>
                  )}
                  {createdConfigId && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 ml-1 flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      Linked to existing orchestration.
                    </p>
                  )}
                </div>

                <DatasetSelector 
                  datasets={datasets}
                  selectedDatasetIds={selectedDatasetIds}
                  onSelect={setSelectedDatasetIds}
                  tenantId={TENANT_ID}
                />
              </div>

              <div className="pt-6 border-t flex items-center justify-between">
                <p className="text-xs text-muted-foreground italic">
                  * Name and at least one dataset are required to proceed to rule configuration.
                </p>
                <Button 
                  onClick={handleNext} 
                  disabled={!orchestrationName || selectedDatasetIds.length === 0 || createConfig.isPending}
                  className="gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/10"
                >
                  {createConfig.isPending || updateConfig.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : createdConfigId ? (
                    <>
                       Go to Rules
                      <ChevronRight className="size-4" />
                    </>
                  ) : (
                    <>
                      Continue to Rules
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Configure Routing Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Define logic for "{orchestrationName}" using {selectedDatasetIds.length} datasets: {datasetNames.join(", ")}
                  </p>
                </div>
                <Button 
                  onClick={() => setIsCreateRuleOpen(true)} 
                  className="gap-2 h-10 rounded-xl"
                  size="sm"
                >
                  <Plus className="size-4" />
                  Add Rule
                </Button>
              </div>

              <div className="min-h-[300px]">
                {rulesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading your rules...</p>
                  </div>
                ) : (
                  <RoutingRuleList 
                    rules={fullConfig?.rules ?? []}
                    tenantId={TENANT_ID}
                    availableEntityTypes={datasetNames}
                    onEdit={(rule) => {
                      setEditingRule(rule);
                      setIsCreateRuleOpen(true);
                    }}
                    onDelete={(ruleId) => deleteRule.mutate(ruleId)}
                    onToggleActive={(rule, active) => toggleRule.mutate({
                      ruleId: rule.id,
                      tenantId: TENANT_ID,
                      entityType: datasetNames[0] || "",
                      isActive: active
                    })}
                  />
                )}
              </div>

              <div className="pt-6 border-t flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} className="h-11 rounded-xl">Back</Button>
                <Button onClick={handleNext} className="gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/10">
                  Execute
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {isProcessing ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-6">
                  <div className="relative">
                    <div className="size-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">Executing Calls</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Processing through "{orchestrationName}"...
                    </p>
                  </div>
                </div>
              ) : executionResult ? (
                <div className="space-y-6">
                  <div className="rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-6 flex items-center gap-4">
                    <CheckCircle2 className="size-8 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-foreground">Execution Complete</p>
                      <p className="text-sm text-muted-foreground">
                        Processed through "{orchestrationName}" routing group.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ResultCard label="Total Scanned" value={executionResult.totalProcessed} color="text-foreground" bg="bg-muted/20" />
                    <ResultCard label="Calls Initiated" value={executionResult.initiated} color="text-emerald-700" bg="bg-emerald-500/10 border-emerald-500/20" />
                    <ResultCard label="Skipped" value={executionResult.skipped} color="text-amber-700" bg="bg-amber-500/10 border-amber-500/20" />
                    <ResultCard label="Failed" value={executionResult.failed} color="text-rose-700" bg="bg-rose-500/10 border-rose-500/20" />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => navigate({ to: `/voice-tech/routings/${createdConfigId}/analytics` as any })} 
                      className="w-full gap-2 h-12 text-base bg-[#FFE600] text-[#1A1A24] hover:bg-[#FFE600]/90 border-none font-bold"
                    >
                      <BarChart3 className="size-5" />
                      View Full Analytics
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border bg-muted/20 flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <Database className="size-5 text-blue-500" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">Datasets ({selectedDatasetIds.length})</p>
                          <p className="text-sm font-semibold">{datasetNames.join(", ")}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">Active</Badge>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-muted/20 flex items-center gap-4">
                      <GitBranch className="size-5 text-violet-500" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Routing Group</p>
                        <p className="text-sm font-semibold">{orchestrationName}</p>
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

                  <div className="pt-6 border-t flex items-center justify-between">
                    <Button variant="ghost" onClick={handleBack} className="h-11 rounded-xl">Back</Button>
                    <Button 
                      onClick={handleExecute} 
                      className="gap-2 h-11 px-8 rounded-xl bg-[#FFE600] text-[#1A1A24] hover:bg-[#FFE600]/90 border-none font-bold"
                    >
                      <Zap className="size-4" />
                      Execute Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Creator Dialog */}
      <CreateRoutingRuleDialog 
        open={isCreateRuleOpen}
        onOpenChange={(open) => {
          setIsCreateRuleOpen(open);
          if (!open) setEditingRule(null);
        }}
        tenantId={TENANT_ID}
        attributes={groupedAttributes}
        editingRule={editingRule}
        nextPriority={(fullConfig?.rules?.length || 0) + 1}
        existingPriorities={fullConfig?.rules?.map(r => r.priority) || []}
        onSave={(ruleData) => {
          upsertRule.mutate({
            ...ruleData,
            routingConfigId: createdConfigId!,
          });
        }}
        isSaving={upsertRule.isPending}
      />
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
