import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  GitBranch,
  BarChart2,
  MoreVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
  Target,
  FlaskConical,
  Database,
  Filter,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { RoutingRuleList } from "../components/rule-builder/routing-rule-list";
import { CreateRoutingRuleDialog } from "../components/rule-builder/create-rule-dialog";
import { CreateConfigDialog } from "../components/tabs/create-config-dialog";
import { SimulationDialog } from "../components/tabs/simulation-dialog";
import { EntityMatchesDialog } from "../components/tabs/entity-matches-dialog";
import { RuleCallLaunchpadDialog } from "../components/tabs/rule-call-launchpad-dialog";
import { CampaignConfirmationDialog } from "../components/tabs/campaign-confirmation-dialog";
import {
  useRoutingConfigs,
  useRoutingConfig,
  useUpsertRoutingRule,
  useDeleteRoutingRule,
  useToggleRuleActive,
  useDeleteRoutingConfig,
  useEntityTypes,
  useQueryEntitiesByRule,
} from "../../api/voice-tech-queries";
import { useQueries } from "@tanstack/react-query";
import { voiceTechApi } from "../../api/voice-tech-api";
import type { RoutingRule, EntityAttribute } from "../../types";
import { formatDistanceToNow } from "date-fns";

const TENANT_ID = "tenant-ey-001";

export function RoutingsPage() {
  const navigate = useNavigate();
  const [isCreateConfigOpen, setIsCreateConfigOpen] = useState(false);
  const [expandedConfigId, setExpandedConfigId] = useState<string | null>(null);
  const [deleteConfigId, setDeleteConfigId] = useState<string | null>(null);
  const [deleteConfigName, setDeleteConfigName] = useState("");

  // Rule-level state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<RoutingRule | null>(null);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [simulationInitialData, setSimulationInitialData] = useState<Record<string, string> | undefined>(undefined);
  const [activeRuleForMatches, setActiveRuleForMatches] = useState<RoutingRule | null>(null);
  const [isMatchesOpen, setIsMatchesOpen] = useState(false);
  const [activeRuleForCall, setActiveRuleForCall] = useState<RoutingRule | null>(null);
  const [isCallLaunchpadOpen, setIsCallLaunchpadOpen] = useState(false);
  const [callLaunchMode, setCallLaunchMode] = useState<"single" | "bulk">("single");
  const [confirmCampaignOpen, setConfirmCampaignOpen] = useState(false);
  const [pendingActiveRule, setPendingActiveRule] = useState<RoutingRule | null>(null);

  // Dataset selection for rules
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([]);

  const { data: configs = [], isLoading: configsLoading } = useRoutingConfigs(TENANT_ID);
  const { data: entityTypes = [] } = useEntityTypes(TENANT_ID);
  const { data: fullConfig, isLoading: rulesLoading } = useRoutingConfig(expandedConfigId, TENANT_ID);

  const deleteConfig = useDeleteRoutingConfig(TENANT_ID);
  const upsertRule = useUpsertRoutingRule(TENANT_ID);
  const deleteRule = useDeleteRoutingRule(expandedConfigId ?? "", TENANT_ID);
  const toggleRule = useToggleRuleActive(expandedConfigId ?? "", TENANT_ID);

  // Fetch attributes for selected entity types
  const attributesQueries = useQueries({
    queries: selectedEntityTypes.map((type) => ({
      queryKey: ["voice-tech", "attributes", TENANT_ID, type],
      queryFn: () => voiceTechApi.listAttributes({ tenantId: TENANT_ID, entityType: type }),
      staleTime: 60000,
    })),
  });

  const groupedAttributes = useMemo(() => {
    const grouped: Record<string, EntityAttribute[]> = {};
    attributesQueries.forEach((query, index) => {
      if (query.data) {
        grouped[selectedEntityTypes[index]] = query.data;
      }
    });
    return grouped;
  }, [attributesQueries, selectedEntityTypes]);

  // Sync selected entity types when a config is expanded/loaded
  useMemo(() => {
    if (fullConfig && fullConfig.entityTypeId) {
      const dataset = entityTypes.find(et => et.id === fullConfig.entityTypeId);
      if (dataset) {
        setSelectedEntityTypes([dataset.name]);
      }
    }
  }, [fullConfig, entityTypes]);

  const { data: entitiesCount } = useQueryEntitiesByRule({
    tenantId: TENANT_ID,
    entityType: selectedEntityTypes[0] ?? "",
    conditions: pendingActiveRule?.conditions ?? null,
    enabled: !!pendingActiveRule && selectedEntityTypes.length > 0 && confirmCampaignOpen,
  });

  // ── Handlers ───────────────────────────────────────────
  const handleDeleteConfig = () => {
    if (!deleteConfigId) return;
    deleteConfig.mutate(deleteConfigId, {
      onSuccess: () => {
        if (expandedConfigId === deleteConfigId) setExpandedConfigId(null);
        setDeleteConfigId(null);
      },
    });
  };

  const handleToggleExpanded = (configId: string) => {
    if (expandedConfigId === configId) {
      setExpandedConfigId(null);
    } else {
      setExpandedConfigId(configId);
    }
  };

  const handleSaveRule = (ruleData: any) => {
    if (!expandedConfigId) return;
    upsertRule.mutate({ ...ruleData, routingConfigId: expandedConfigId }, {
      onSuccess: () => { setIsCreateDialogOpen(false); setRuleToEdit(null); },
    });
  };

  const handleEditRule = (rule: RoutingRule) => { setRuleToEdit(rule); setIsCreateDialogOpen(true); };
  const handleDeleteRule = (ruleId: string) => { deleteRule.mutate(ruleId); };

  const handleToggleActive = (rule: RoutingRule, active: boolean) => {
    if (active) { setPendingActiveRule(rule); setConfirmCampaignOpen(true); }
    else {
      toggleRule.mutate({ ruleId: rule.id, tenantId: TENANT_ID, entityType: selectedEntityTypes[0] ?? "", isActive: false });
    }
  };

  const handleConfirmCampaign = (triggerCampaign: boolean) => {
    if (!pendingActiveRule) return;
    toggleRule.mutate({
      ruleId: pendingActiveRule.id, tenantId: TENANT_ID,
      entityType: selectedEntityTypes[0] ?? "", isActive: true, triggerCampaign,
    }, { onSuccess: () => { setConfirmCampaignOpen(false); setPendingActiveRule(null); } });
  };

  const handleExecuteTest = (rule: RoutingRule) => {
    const initialData: Record<string, string> = {};
    const traverse = (node: any) => { if (node.field) initialData[node.field] = node.value || ""; else if (node.children) node.children.forEach(traverse); };
    traverse(rule.conditions);
    setSimulationInitialData(initialData);
    setIsSimulationOpen(true);
  };

  const handleQueryEntities = (rule: RoutingRule) => { setActiveRuleForMatches(rule); setIsMatchesOpen(true); };
  const handleSingleCall = (rule: RoutingRule) => { setCallLaunchMode("single"); setActiveRuleForCall(rule); setIsCallLaunchpadOpen(true); };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/voice-tech">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Step 2</p>
            <h1 className="text-2xl font-bold tracking-tight">Routing Groups</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Define rules that control how calls are routed to voice providers.
            </p>
          </div>
        </div>

        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsCreateConfigOpen(true)}>
          <Plus className="size-4" />
          Create Routing Group
        </Button>
      </div>

      {/* ── Routing Groups Table ──────────────────────── */}
      {configsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : configs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/60 rounded-2xl bg-muted/10">
          <div className="size-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
            <GitBranch className="size-8 text-muted-foreground/40" />
          </div>
          <p className="text-base font-semibold text-foreground mb-1">No routing groups yet</p>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm text-center">
            Create a routing group to define how your calls should be processed.
          </p>
          <Button onClick={() => setIsCreateConfigOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Create Your First Routing Group
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10" />
                <TableHead className="font-semibold">Routing Group</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => {
                const isExpanded = expandedConfigId === config.id;
                return (
                  <TableRow
                    key={config.id}
                    className={cn("group cursor-pointer", isExpanded && "bg-muted/30")}
                    onClick={() => handleToggleExpanded(config.id)}
                  >
                    <TableCell className="w-10">
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                          <GitBranch className="size-4 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{config.name}</p>
                          <p className="text-xs text-muted-foreground">Routing Group</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {config.createdAt && !isNaN(new Date(config.createdAt).getTime())
                          ? formatDistanceToNow(new Date(config.createdAt), { addSuffix: true })
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 cursor-pointer hover:bg-primary/10 hover:text-primary"
                          onClick={() => navigate({ to: `/voice-tech/routings/${config.id}/analytics` })}
                          aria-label="View analytics"
                        >
                          <BarChart2 className="size-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 cursor-pointer">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => navigate({ to: `/voice-tech/routings/${config.id}/analytics` })}
                              className="gap-2 cursor-pointer"
                            >
                              <BarChart2 className="size-4" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => { setDeleteConfigId(config.id); setDeleteConfigName(config.name); }}
                              className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                            >
                              <Trash2 className="size-4" />
                              Delete Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── Expanded Rules Panel ──────────────────────── */}
      {expandedConfigId && (
        <div className="border rounded-xl bg-card overflow-hidden animate-in slide-in-from-top-2 duration-300">
          {/* Panel header */}
          <div className="px-5 py-4 border-b bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Target className="size-4 text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  Rules for "{fullConfig?.name ?? "Loading..."}"
                </h3>
                <p className="text-xs text-muted-foreground">
                  {fullConfig?.rules?.length ?? 0} rules configured
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dataset Selector */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2 text-xs cursor-pointer">
                    <Database className="size-3.5" />
                    {selectedEntityTypes.length === 0 ? "Select Datasets" : `${selectedEntityTypes.length} Selected`}
                    <Filter className="size-3 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-2" align="end">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1.5">Available Datasets</p>
                  <div className="max-h-[200px] overflow-y-auto space-y-0.5">
                    {entityTypes.map((type) => (
                      <div
                        key={type.id}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                          selectedEntityTypes.includes(type.name) ? "bg-primary/10" : "hover:bg-muted"
                        )}
                        onClick={() => setSelectedEntityTypes((prev) =>
                          prev.includes(type.name) ? prev.filter((t) => t !== type.name) : [...prev, type.name]
                        )}
                      >
                        <Checkbox checked={selectedEntityTypes.includes(type.name)} className="size-3.5" />
                        <Label className="flex-1 cursor-pointer text-xs font-medium">{type.name}</Label>
                        {selectedEntityTypes.includes(type.name) && <Check className="size-3 text-primary" />}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-2 text-xs cursor-pointer"
                onClick={() => setIsSimulationOpen(true)}
                disabled={!expandedConfigId}
              >
                <FlaskConical className="size-3.5" />
                Simulate
              </Button>

              <Button
                size="sm"
                className="h-8 gap-2 text-xs cursor-pointer"
                onClick={() => { setIsCreateDialogOpen(true); setRuleToEdit(null); }}
                disabled={selectedEntityTypes.length === 0}
              >
                <Plus className="size-3.5" />
                Add Rule
              </Button>
            </div>
          </div>

          {/* Rules list */}
          <div className="p-4">
            {rulesLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
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
                tenantId={TENANT_ID}
                availableEntityTypes={selectedEntityTypes}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Dialogs ───────────────────────────────────── */}
      <CreateConfigDialog
        open={isCreateConfigOpen}
        onOpenChange={setIsCreateConfigOpen}
        tenantId={TENANT_ID}
        onSuccess={(id) => { setExpandedConfigId(id); setIsCreateConfigOpen(false); }}
      />

      <CreateRoutingRuleDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) setRuleToEdit(null); }}
        tenantId={TENANT_ID}
        attributes={groupedAttributes as any}
        onSave={handleSaveRule}
        isSaving={upsertRule.isPending}
        editingRule={ruleToEdit}
        nextPriority={(fullConfig?.rules?.length ?? 0) === 0 ? 1 : Math.max(...(fullConfig?.rules?.map((r) => r.priority) ?? [0])) + 1}
        existingPriorities={fullConfig?.rules?.map((r) => r.priority) ?? []}
      />

      <SimulationDialog
        open={isSimulationOpen}
        onOpenChange={(open) => { setIsSimulationOpen(open); if (!open) setSimulationInitialData(undefined); }}
        attributes={groupedAttributes as any}
        configId={expandedConfigId}
        tenantId={TENANT_ID}
        initialData={simulationInitialData}
      />

      <EntityMatchesDialog
        open={isMatchesOpen}
        onOpenChange={setIsMatchesOpen}
        rule={activeRuleForMatches}
        tenantId={TENANT_ID}
        availableEntityTypes={selectedEntityTypes}
      />

      <CampaignConfirmationDialog
        open={confirmCampaignOpen}
        onOpenChange={setConfirmCampaignOpen}
        ruleName="Selected Rule"
        matchCount={entitiesCount?.count ?? 0}
        isPending={toggleRule.isPending}
        onConfirm={handleConfirmCampaign}
      />

      <RuleCallLaunchpadDialog
        open={isCallLaunchpadOpen}
        onOpenChange={(open) => { setIsCallLaunchpadOpen(open); if (!open) setActiveRuleForCall(null); }}
        tenantId={TENANT_ID}
        entityType={selectedEntityTypes[0] ?? ""}
        configId={expandedConfigId}
        rule={activeRuleForCall}
        initialMode={callLaunchMode}
      />

      {/* Delete config */}
      <AlertDialog open={!!deleteConfigId} onOpenChange={(open) => !open && setDeleteConfigId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Routing Group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteConfigName}</strong> and all its routing rules.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfig} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteConfig.isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
