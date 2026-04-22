import {
  Plus,
  Settings2,
  ChevronRight,
  Target,
  FlaskConical,
  Activity,
  Zap,
  Trash2,
  Database,
  Filter,
  Check
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { RoutingRuleList } from "../rule-builder/routing-rule-list";
import { CreateRoutingRuleDialog } from "../rule-builder/create-rule-dialog";
import { SimulationDialog } from "./simulation-dialog";
import { CreateConfigDialog } from "./create-config-dialog";
import { EntityMatchesDialog } from "./entity-matches-dialog";
import { RuleCallLaunchpadDialog } from "./rule-call-launchpad-dialog";
import { BulkCallDialog } from "./bulk-call-dialog";
import {
  useRoutingConfigs,
  useRoutingConfig,
  useUpsertRoutingRule,
  useDeleteRoutingRule,
  useToggleRuleActive,
  useQueryEntitiesByRule,
  useDeleteRoutingConfig,
  useEntityTypes
} from "../../../api/voice-tech-queries";
import { CampaignConfirmationDialog } from "./campaign-confirmation-dialog";
import type { EntityAttribute, RoutingRule } from "../../../types";
import { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQueries } from "@tanstack/react-query";
import { voiceTechApi } from "../../../api/voice-tech-api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RoutingTabProps {
  tenantId: string;
  entityType: string | null;
}

export function RoutingTab({ tenantId, entityType }: RoutingTabProps) {
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>(
    entityType ? [entityType] : []
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isCreateConfigOpen, setIsCreateConfigOpen] = useState(false);
  const [activeRuleForMatches, setActiveRuleForMatches] = useState<RoutingRule | null>(null);
  const [isMatchesOpen, setIsMatchesOpen] = useState(false);
  const [simulationInitialData, setSimulationInitialData] = useState<Record<string, string> | undefined>(undefined);
  const [confirmCampaignOpen, setConfirmCampaignOpen] = useState(false);
  const [isBulkProcessOpen, setIsBulkProcessOpen] = useState(false);
  const [pendingActiveRule, setPendingActiveRule] = useState<RoutingRule | null>(null);
  const [isCallLaunchpadOpen, setIsCallLaunchpadOpen] = useState(false);
  const [activeRuleForCall, setActiveRuleForCall] = useState<RoutingRule | null>(null);
  const [isDeleteConfigOpen, setIsDeleteConfigOpen] = useState(false);
  const [callLaunchMode, setCallLaunchMode] = useState<"single" | "bulk">("single");
  const [ruleToEdit, setRuleToEdit] = useState<RoutingRule | null>(null);

  const { data: configs, isLoading: isConfigsLoading } = useRoutingConfigs(tenantId);
  const { data: entityTypes = [] } = useEntityTypes(tenantId);
  const { data: fullConfig, isLoading: isRulesLoading } = useRoutingConfig(selectedConfigId, tenantId);

  // Fetch attributes for all selected entity types
  const attributesQueries = useQueries({
    queries: selectedEntityTypes.map(type => ({
      queryKey: ["voice-tech", "attributes", tenantId, type],
      queryFn: () => voiceTechApi.listAttributes({ tenantId, entityType: type }),
      staleTime: 60000,
    }))
  });


  // Grouped attributes: { [entityType]: Attribute[] }
  const groupedAttributes = useMemo(() => {
    const grouped: Record<string, EntityAttribute[]> = {};
    attributesQueries.forEach((query, index) => {
      if (query.data) {
        grouped[selectedEntityTypes[index]] = query.data;
      }
    });
    return grouped;
  }, [attributesQueries, selectedEntityTypes]);


  const upsertRule = useUpsertRoutingRule(tenantId);
  const deleteRule = useDeleteRoutingRule(selectedConfigId ?? "", tenantId);
  const toggleRule = useToggleRuleActive(selectedConfigId ?? "", tenantId);
  const deleteConfig = useDeleteRoutingConfig(tenantId);

  // For the confirmation dialog
  const { data: entitiesCount } = useQueryEntitiesByRule({
    tenantId,
    entityType: entityType ?? "",
    conditions: pendingActiveRule?.conditions ?? null,
    enabled: !!pendingActiveRule && !!entityType && confirmCampaignOpen
  });

  const handleSaveRule = (ruleData: any) => {
    if (!selectedConfigId) return;
    upsertRule.mutate({
      ...ruleData,
      routingConfigId: selectedConfigId
    }, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setRuleToEdit(null);
      }
    });
  };

  const handleEditRule = (rule: RoutingRule) => {
    setRuleToEdit(rule);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    deleteRule.mutate(ruleId);
  };

  const handleToggleActive = (rule: RoutingRule, active: boolean) => {
    if (active) {
      setPendingActiveRule(rule);
      setConfirmCampaignOpen(true);
    } else {
      toggleRule.mutate({
        ruleId: rule.id,
        tenantId,
        entityType: entityType ?? "",
        isActive: false
      });
    }
  };

  const handleConfirmCampaign = (triggerCampaign: boolean) => {
    if (!pendingActiveRule) return;
    toggleRule.mutate({
      ruleId: pendingActiveRule.id,
      tenantId,
      entityType: entityType ?? "",
      isActive: true,
      triggerCampaign
    }, {
      onSuccess: () => {
        setConfirmCampaignOpen(false);
        setPendingActiveRule(null);
      }
    });
  };

  const handleDeleteConfig = () => {
    if (!selectedConfigId) return;
    deleteConfig.mutate(selectedConfigId, {
      onSuccess: () => {
        setSelectedConfigId(null);
        setIsDeleteConfigOpen(false);
      }
    });
  };

  const handleExecuteTest = (rule: RoutingRule) => {
    // Extract fields from rule conditions to pre-fill simulation
    const initialData: Record<string, string> = {};
    const traverse = (node: any) => {
      if (node.field) {
        initialData[node.field] = node.value || "";
      } else if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(rule.conditions);

    setSimulationInitialData(initialData);
    setIsSimulationOpen(true);
  };

  const handleQueryEntities = (rule: RoutingRule) => {
    setActiveRuleForMatches(rule);
    setIsMatchesOpen(true);
  };

  const handleSingleCall = (rule: RoutingRule) => {
    setCallLaunchMode("single");
    setActiveRuleForCall(rule);
    setIsCallLaunchpadOpen(true);
  };


  return (
    <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6 items-start">
      {/* Sidebar: Config Selector & Info */}
      <div className="space-y-4">
        <Card className="border-border/60">
          <CardHeader className="pb-3 px-4">
            <CardTitle className="text-xs font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
              <Settings2 className="size-3.5" />
              Routing Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Selected Stack</label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5 rounded-md hover:bg-primary/20 hover:text-primary"
                  onClick={() => setIsCreateConfigOpen(true)}
                >
                  <Plus className="size-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select
                    value={selectedConfigId ?? ""}
                    onValueChange={setSelectedConfigId}
                    disabled={isConfigsLoading}
                  >
                    <SelectTrigger className="w-full text-sm h-10 border-border bg-background">
                      <SelectValue placeholder={isConfigsLoading ? "Loading..." : "Select Config"} />
                    </SelectTrigger>
                    <SelectContent>
                      {configs?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 text-destructive hover:bg-destructive/10"
                  disabled={!selectedConfigId || isConfigsLoading}
                  onClick={() => setIsDeleteConfigOpen(true)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase mb-1 flex items-center gap-1.5">
                <Activity className="size-3" /> System Status
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Using <strong>Smart Fallback</strong>. If no rules match, calls default to the global provider priority list.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Source Datasets</label>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between h-9 text-xs border-dashed hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Database className="size-3.5 text-primary" />
                      <span className="truncate">
                        {selectedEntityTypes.length === 0
                          ? "Select Datasets"
                          : `${selectedEntityTypes.length} Selected`}
                      </span>
                    </div>
                    <Filter className="size-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-2" align="start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1.5">Available Entities</p>
                    <div className="max-h-[200px] overflow-y-auto vt-scrollbar space-y-0.5">
                      {entityTypes.map((type) => (
                        <div
                          key={type}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                            selectedEntityTypes.includes(type) ? "bg-primary/10" : "hover:bg-muted"
                          )}
                          onClick={() => {
                            setSelectedEntityTypes(prev =>
                              prev.includes(type)
                                ? prev.filter(t => t !== type)
                                : [...prev, type]
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedEntityTypes.includes(type)}
                            id={`type-${type}`}
                            className="size-3.5"
                          />
                          <Label className="flex-1 cursor-pointer text-xs font-semibold">{type}</Label>
                          {selectedEntityTypes.includes(type) && <Check className="size-3 text-primary" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-1">
                {selectedEntityTypes.map(type => (
                  <Badge key={type} variant="secondary" className="text-[9px] h-4 px-1.5 font-bold bg-muted/60">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              className="w-full justify-start gap-2 h-9 text-xs"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={!selectedConfigId || upsertRule.isPending || selectedEntityTypes.length === 0}
            >
              <Plus className="size-3.5 text-primary" />
              Add Routing Rule
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Rules List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Target className="size-4" />
            <span className="font-bold text-foreground">Active Logic Path</span>
            <ChevronRight className="size-3.5 mx-0.5" />
            <span className="text-xs">{fullConfig?.name ?? "No config selected"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-2 text-xs"
              onClick={() => setIsSimulationOpen(true)}
              disabled={!selectedConfigId}
            >
              <FlaskConical className="size-3.5" />
              Simulate Routing
            </Button>

            <Button
              size="sm"
              className="h-8 gap-2 text-xs font-bold"
              onClick={() => setIsBulkProcessOpen(true)}
              disabled={!selectedConfigId}
            >
              <Zap className="size-3.5 fill-current" />
              Bulk Process Orchestrator
            </Button>
          </div>
        </div>

        {!selectedConfigId ? (
          <div className="h-[400px] grid place-items-center border-2 border-dashed rounded-2xl bg-muted/20">
            <div className="text-center space-y-2">
              <div className="size-12 rounded-full bg-primary/10 grid place-items-center mx-auto text-primary mb-4">
                <Target className="size-6" />
              </div>
              <p className="font-bold">Select a configuration to view rules</p>
              <p className="text-xs text-muted-foreground">Pick a routing stack from the dropdown on the left.</p>
            </div>
          </div>
        ) : isRulesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 w-full animate-pulse bg-muted/40 rounded-xl" />
            ))}
          </div>
        ) : (
          <RoutingRuleList
            rules={fullConfig?.rules ?? []}
            onExecuteTest={handleExecuteTest}
            onQueryEntities={handleQueryEntities}
            onSingleCall={handleSingleCall}
            onToggleActive={handleToggleActive}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
          />
        )}
      </div>

      <CreateRoutingRuleDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setRuleToEdit(null);
        }}
         tenantId={tenantId}
        attributes={groupedAttributes as any}
        onSave={handleSaveRule}
        isSaving={upsertRule.isPending}
        editingRule={ruleToEdit}
        nextPriority={(fullConfig?.rules?.length ?? 0) === 0
          ? 1
          : Math.max(...(fullConfig?.rules?.map(r => r.priority) ?? [0])) + 1}
        existingPriorities={fullConfig?.rules?.map(r => r.priority) ?? []}
      />

      <SimulationDialog
        open={isSimulationOpen}
        onOpenChange={(open) => {
          setIsSimulationOpen(open);
          if (!open) setSimulationInitialData(undefined);
        }}
        attributes={groupedAttributes as any}
        configId={selectedConfigId}
        tenantId={tenantId}
        initialData={simulationInitialData}
      />

      <CreateConfigDialog
        open={isCreateConfigOpen}
        onOpenChange={setIsCreateConfigOpen}
        tenantId={tenantId}
        onSuccess={(id) => setSelectedConfigId(id)}
      />

      <EntityMatchesDialog
        open={isMatchesOpen}
        onOpenChange={setIsMatchesOpen}
        rule={activeRuleForMatches}
        tenantId={tenantId}
        availableEntityTypes={selectedEntityTypes}
      />

      <CampaignConfirmationDialog
        open={confirmCampaignOpen}
        onOpenChange={setConfirmCampaignOpen}
        ruleName="Selected Rule"
        matchCount={entitiesCount?.length ?? 0}
        isPending={toggleRule.isPending}
        onConfirm={handleConfirmCampaign}
      />

      <RuleCallLaunchpadDialog
        open={isCallLaunchpadOpen}
        onOpenChange={(open) => {
          setIsCallLaunchpadOpen(open);
          if (!open) {
            setActiveRuleForCall(null);
          }
        }}
        tenantId={tenantId}
        entityType={entityType ?? ""}
        configId={selectedConfigId}
        rule={activeRuleForCall}
        initialMode={callLaunchMode}
      />

      <BulkCallDialog
        open={isBulkProcessOpen}
        onOpenChange={setIsBulkProcessOpen}
        tenantId={tenantId}
        configId={selectedConfigId!}
        configName={fullConfig?.name ?? ""}
        sourceEntityTypes={selectedEntityTypes}
      />

      <AlertDialog open={isDeleteConfigOpen} onOpenChange={setIsDeleteConfigOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Routing Stack?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the <strong>{fullConfig?.name}</strong> routing configuration and all its associated rules.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfig}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteConfig.isPending}
            >
              {deleteConfig.isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
