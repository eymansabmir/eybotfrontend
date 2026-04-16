import { 
  Plus, 
  Settings2, 
  ChevronRight, 
  Target,
  FlaskConical,
  Activity
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
import { RoutingRuleList } from "../rule-builder/routing-rule-list";
import { CreateRoutingRuleDialog } from "../rule-builder/create-rule-dialog";
import { SimulationDialog } from "./simulation-dialog";
import { CreateConfigDialog } from "./create-config-dialog";
import { EntityMatchesDialog } from "./entity-matches-dialog";
import { useRoutingConfigs, useRoutingConfig, useUpsertRoutingRule, useDeleteRoutingRule } from "../../../api/voice-tech-queries";
import type { EntityAttribute, RoutingRule } from "../../../types";
import { useState } from "react";

interface RoutingTabProps {
  tenantId: string;
  entityType: string;
  attributes: EntityAttribute[];
}

export function RoutingTab({ tenantId, entityType, attributes }: RoutingTabProps) {
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isCreateConfigOpen, setIsCreateConfigOpen] = useState(false);
  const [activeRuleForMatches, setActiveRuleForMatches] = useState<RoutingRule | null>(null);
  const [isMatchesOpen, setIsMatchesOpen] = useState(false);
  const [simulationInitialData, setSimulationInitialData] = useState<Record<string, string> | undefined>(undefined);
  
  const { data: configs, isLoading: isConfigsLoading } = useRoutingConfigs(tenantId);
  const { data: fullConfig, isLoading: isRulesLoading } = useRoutingConfig(selectedConfigId, tenantId);

  const upsertRule = useUpsertRoutingRule(tenantId);
  const deleteRule = useDeleteRoutingRule(selectedConfigId ?? "", tenantId);

  const handleSaveRule = (ruleData: any) => {
    if (!selectedConfigId) return;
    upsertRule.mutate({
      ...ruleData,
      routingConfigId: selectedConfigId
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    deleteRule.mutate(ruleId);
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

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
               <p className="text-[10px] font-bold text-primary uppercase mb-1 flex items-center gap-1.5">
                  <Activity className="size-3" /> System Status
               </p>
               <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Using <strong>Smart Fallback</strong>. If no rules match, calls default to the global provider priority list.
               </p>
            </div>

            <Button 
              className="w-full justify-start gap-2 h-9 text-xs" 
              variant="outline"
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={!selectedConfigId || upsertRule.isPending}
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
              {[1,2,3].map(i => (
                 <div key={i} className="h-32 w-full animate-pulse bg-muted/40 rounded-xl" />
              ))}
           </div>
        ) : (
          <RoutingRuleList 
            rules={fullConfig?.rules ?? []} 
            onExecuteTest={handleExecuteTest}
            onQueryEntities={handleQueryEntities}
            onDelete={handleDeleteRule}
          />
        )}
      </div>

      <CreateRoutingRuleDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        attributes={attributes}
        onSave={handleSaveRule}
        isSaving={upsertRule.isPending}
      />

      <SimulationDialog
        open={isSimulationOpen}
        onOpenChange={(open) => {
          setIsSimulationOpen(open);
          if (!open) setSimulationInitialData(undefined);
        }}
        attributes={attributes}
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
        entityType={entityType}
      />
    </div>
  );
}
