import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronRight,
  Database,
  GitBranch,
  Zap,
  Check,
  Loader2,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEntityTypes, useCreateRoutingConfig, useUpsertRoutingRule, useRoutingConfig } from "../../api/voice-tech-queries";
import { DatasetSelector } from "../components/wizard/dataset-selector";
import { RoutingRuleList } from "../components/rule-builder/routing-rule-list";
import { CreateRoutingRuleDialog } from "../components/rule-builder/create-rule-dialog";
import { useQueries } from "@tanstack/react-query";
import { voiceTechApi } from "../../api/voice-tech-api";

const TENANT_ID = "tenant-ey-001";

const STEPS = [
  { id: 1, name: "Select Dataset", icon: Database, description: "Choose or upload your data source" },
  { id: 2, name: "Define Rules", icon: GitBranch, description: "Configure routing logic" },
  { id: 3, name: "Review & Launch", icon: Zap, description: "Finalize and execute" },
];

export function OrchestrationWizardPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [orchestrationName, setOrchestrationName] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(null);
  const [createdConfigId, setCreatedConfigId] = useState<string | null>(null);

  // Queries
  const { data: datasets = [] } = useEntityTypes(TENANT_ID);
  const createConfig = useCreateRoutingConfig();
  const upsertRule = useUpsertRoutingRule(TENANT_ID);
  const { data: fullConfig, isLoading: rulesLoading } = useRoutingConfig(createdConfigId, TENANT_ID);

  // Step 2 Rule Builder State
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const selectedDataset = datasets.find(d => d.id === selectedDatasetId);
  const datasetNames = selectedDataset ? [selectedDataset.name] : [];

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
      if (!orchestrationName || !selectedDatasetId) return;
      
      // Create config if not exists
      if (!createdConfigId) {
        createConfig.mutate({
          tenantId: TENANT_ID,
          name: orchestrationName,
          entityTypeId: selectedDatasetId,
        }, {
          onSuccess: (config) => {
            setCreatedConfigId(config.id);
            setCurrentStep(2);
          }
        });
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      navigate({ to: "/voice-tech" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveRule = (ruleData: any) => {
    if (!createdConfigId) return;
    upsertRule.mutate({ ...ruleData, routingConfigId: createdConfigId }, {
      onSuccess: () => setIsCreateRuleOpen(false),
    });
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
            <h1 className="text-2xl font-bold tracking-tight">Create New Orchestration</h1>
            <p className="text-sm text-muted-foreground">Set up a unified voice call strategy in minutes.</p>
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
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground ml-1">Orchestration Name</label>
                  <Input 
                    placeholder="e.g., Q4 Customer Feedback" 
                    value={orchestrationName}
                    onChange={(e) => setOrchestrationName(e.target.value)}
                    className="h-12 rounded-xl bg-card border-border/60 focus:ring-primary/20 text-lg font-medium"
                  />
                </div>

                <DatasetSelector 
                  datasets={datasets}
                  selectedDatasetId={selectedDatasetId}
                  onSelect={setSelectedDatasetId}
                  tenantId={TENANT_ID}
                />
              </div>

              <div className="pt-6 border-t flex items-center justify-between">
                <p className="text-xs text-muted-foreground italic">
                  * Name and dataset are required to proceed to rule configuration.
                </p>
                <Button 
                  onClick={handleNext} 
                  disabled={!orchestrationName || !selectedDatasetId || createConfig.isPending}
                  className="gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/10"
                >
                  {createConfig.isPending ? <Loader2 className="size-4 animate-spin" /> : "Continue to Rules"}
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Configure Routing Rules</h3>
                  <p className="text-sm text-muted-foreground">Define logic for "{orchestrationName}" using dataset "{selectedDataset?.name}"</p>
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
                    onEdit={() => {}} // TODO: Implement edit
                    onDelete={() => {}} // TODO: Implement delete
                    onToggleActive={() => {}}
                  />
                )}
              </div>

              <div className="pt-6 border-t flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack} className="h-11 rounded-xl">Back</Button>
                <Button onClick={handleNext} className="gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/10">
                  Review & Finalize
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center py-10">
              <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Check className="size-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Ready to Launch!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your orchestration "{orchestrationName}" has been configured with {fullConfig?.rules?.length ?? 0} rules.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-6">
                <Card className="bg-muted/30 border-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Dataset</p>
                    <p className="font-bold truncate">{selectedDataset?.name}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border-none">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rules</p>
                    <p className="font-bold">{fullConfig?.rules?.length ?? 0}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-10 flex flex-col items-center gap-4">
                <Button 
                  onClick={handleNext} 
                  className="gap-2 h-14 px-12 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                >
                  Finish & View Dashboard
                </Button>
                <Button variant="ghost" onClick={handleBack} className="h-11 rounded-xl">
                  Go Back to Edit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rule Creator Dialog */}
      <CreateRoutingRuleDialog 
        open={isCreateRuleOpen}
        onOpenChange={setIsCreateRuleOpen}
        tenantId={TENANT_ID}
        attributes={groupedAttributes as any}
        onSave={handleSaveRule}
        isSaving={upsertRule.isPending}
        nextPriority={(fullConfig?.rules?.length ?? 0) + 1}
        existingPriorities={fullConfig?.rules?.map(r => r.priority) ?? []}
      />
    </div>
  );
}
