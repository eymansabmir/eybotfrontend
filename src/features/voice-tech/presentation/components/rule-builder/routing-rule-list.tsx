import { 
  Play, 
  MoreVertical, 
  CheckCircle2, 
  XSquare,
  ArrowRight,
  Trash2,
  Phone,
  MessageCircle,
  Settings2,
  Users,
  Loader2,
  Activity,
  BarChart2
} from "lucide-react";
import { useQueryEntitiesByRule } from "../../../api/voice-tech-queries";
import { useState, useMemo } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProviderBadge } from "../shared/provider-badge";
import type { RoutingRule, RoutingCondition } from "../../../types";
import { isConditionLeaf } from "../../../types";
import { cn } from "@/lib/utils";

interface RoutingRuleListProps {
  rules: RoutingRule[];
  onExecuteTest: (rule: RoutingRule) => void;
  onQueryEntities: (rule: RoutingRule) => void;
  onSingleCall: (rule: RoutingRule) => void;
  onToggleActive: (rule: RoutingRule, active: boolean) => void;
  onEdit: (rule: RoutingRule) => void;
  onDelete: (ruleId: string) => void;
}

export function RoutingRuleList({ 
  rules, 
  onExecuteTest, 
  onSingleCall,
  onToggleActive,
  onEdit,
  onDelete,
  tenantId,
  availableEntityTypes
}: RoutingRuleListProps & { tenantId: string; availableEntityTypes: string[] }) {
  const getTransport = (rule: RoutingRule): "telephony" | "whatsapp" =>
    rule.action.channel === "whatsapp"
      ? "whatsapp"
      : "telephony";

  const getProvider = (rule: RoutingRule): string =>
    getTransport(rule) === "telephony"
      ? rule.action.telephonyProvider
      : rule.action.voiceProvider;

  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl bg-muted/20">
        <div className="size-12 rounded-full bg-muted grid place-items-center mb-4">
           <Play className="size-6 text-muted-foreground/40" />
        </div>
        <p className="font-bold">No routing rules yet</p>
        <p className="text-xs text-muted-foreground mt-1">Rules define where your calls go. Create your first rule to start routing.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-2xl bg-background overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <div className="divide-y divide-border/60 min-w-[700px] lg:min-w-0">
        {rules.sort((a, b) => a.priority - b.priority).map((rule) => {
          const transport = getTransport(rule);
          const isWhatsapp = transport === "whatsapp";
          return (
          <div key={rule.id} className="group hover:bg-muted/30 transition-all flex items-center gap-4 p-3">
            
            {/* Priority Hub */}
            <div className="flex flex-col items-center justify-center gap-0.5 min-w-[50px]">
               <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Prio</span>
               <span className="text-base font-bold font-mono tracking-tighter leading-none">{rule.priority}</span>
               <div className={`size-1.5 rounded-full mt-1 ${rule.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
            </div>

            {/* Conditions Block */}
            <div className="flex-1 min-w-0">
               <div className="flex flex-wrap gap-1 items-center">
                  <ConditionSummaryNode node={rule.conditions} />
               </div>
            </div>

            {/* Arrow Divider */}
            <div className="flex flex-col items-center shrink-0">
               <div className="size-7 rounded-full bg-muted/40 border flex items-center justify-center text-muted-foreground">
                  <ArrowRight className="size-3.5" />
               </div>
            </div>

            {/* Action Block */}
            <div className="min-w-[160px] shrink-0">
               <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/30 border border-border/40">
                  <ProviderBadge provider={getProvider(rule) as any} />
                  <div className="min-w-0">
                     <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Agent ID</p>
                     <p className="text-[10px] font-mono truncate mt-0.5">{rule.action.agentId}</p>
                  <p className="text-[9px] mt-0.5 inline-flex items-center gap-1 rounded-full bg-background/70 border px-1.5 py-0.5">
                    {isWhatsapp ? <MessageCircle className="size-2.5 text-emerald-600" /> : <Phone className="size-2.5 text-indigo-600" />}
                    <span className="font-semibold">{isWhatsapp ? "WhatsApp" : "Telephony"}</span>
                  </p>
                  </div>
               </div>
            </div>

            {/* Impact Analysis (Inline) */}
            <div className="min-w-[90px] flex justify-end">
               <InlineMatchCount 
                 rule={rule} 
                 tenantId={tenantId} 
                 entityType={availableEntityTypes[0] || ""} 
               />
            </div>

            {/* Rule Meta & Actions */}
            <div className="flex items-center gap-2 pl-4 border-l">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-primary/10 hover:text-primary transition-colors">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEdit(rule)} className="gap-2 py-2">
                       <Settings2 className="size-4 text-primary" />
                       <span className="font-medium">Edit Rule Details</span>
                    </DropdownMenuItem>
                    {rule.isActive ? (
                       <DropdownMenuItem 
                         onClick={() => onToggleActive(rule, false)} 
                         className="gap-2 py-2 font-medium text-amber-600"
                       >
                          <XSquare className="size-4" /> Deactivate Rule
                       </DropdownMenuItem>
                    ) : (
                       <DropdownMenuItem 
                         onClick={() => onToggleActive(rule, true)} 
                         className="gap-2 py-2 font-medium text-emerald-600"
                       >
                          <CheckCircle2 className="size-4" /> Activate Rule
                       </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(rule.id)} 
                      className="text-destructive gap-2 py-2 focus:text-destructive focus:bg-destructive/10"
                    >
                       <Trash2 className="size-4" /> Delete Rule
                    </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  </div>
);
}

function InlineMatchCount({ 
  rule, 
  tenantId, 
  entityType 
}: { 
  rule: RoutingRule; 
  tenantId: string; 
  entityType: string;
}) {
  const [shouldFetch, setShouldFetch] = useState(false);

  const searchConditions = useMemo(() => {
    const stripPrefixes = (node: RoutingCondition): RoutingCondition => {
      const newNode = { ...node };
      if ('field' in newNode && newNode.field && newNode.field.includes('.')) {
        newNode.field = newNode.field.split('.').pop() || newNode.field;
      }
      if ('children' in newNode && newNode.children) {
        newNode.children = newNode.children.map(stripPrefixes);
      }
      return newNode;
    };
    return rule.conditions ? stripPrefixes(rule.conditions) : null;
  }, [rule.conditions]);

  const { data: entities, isLoading, isError } = useQueryEntitiesByRule({
    tenantId,
    entityType,
    conditions: searchConditions,
    enabled: shouldFetch,
  });

  if (isError) return <Activity className="size-3.5 text-rose-500 opacity-50" />;

  if (shouldFetch && entities !== undefined) {
    return (
      <Badge 
        variant="secondary" 
        className="h-7 rounded-full px-2.5 font-mono text-[10px] bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5 animate-in zoom-in-95 duration-300"
      >
        <Users className="size-3" />
        <span className="font-bold">{entities.count.toLocaleString()}</span>
        <span className="opacity-60 font-medium whitespace-nowrap">Matches</span>
      </Badge>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isLoading}
      onClick={() => setShouldFetch(true)}
      className="h-7 text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-primary/5 hover:text-primary transition-all text-muted-foreground/60"
    >
      {isLoading ? (
        <Loader2 className="size-3 animate-spin" />
      ) : (
        <>
          <BarChart2 className="size-3" />
          Analyze
        </>
      )}
    </Button>
  );
}

function ConditionSummaryNode({ node, depth = 0 }: { node: RoutingCondition; depth?: number }) {
  if (isConditionLeaf(node)) {
    const parts = node.field.split('.');
    const entity = parts.length > 1 ? parts[0] : null;
    const attr = parts.length > 1 ? parts[1] : node.field;
    
    return (
      <span className="inline-flex items-center gap-1 rounded-lg border bg-background px-2 py-0.5 text-[10px] shadow-sm font-medium hover:border-primary/50 transition-colors cursor-default group/leaf">
        {entity && (
          <Badge variant="outline" className="h-3.5 px-1 text-[8px] font-mono bg-primary/5 uppercase border-primary/20">
            {entity}
          </Badge>
        )}
        <span className="text-foreground font-bold">{attr || "..."}</span>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">{node.operator.replace('_', ' ')}</span>
        <span className="text-primary font-bold px-1 rounded bg-primary/5">
          {String(node.value || "...")}
        </span>
      </span>
    );
  }

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-1.5 rounded-xl border p-1.5 transition-all",
      depth === 0 ? "border-transparent" : "border-dashed border-muted bg-muted/5 shadow-inner"
    )}>
      <Badge variant="secondary" className={cn(
        "h-5 text-[9px] font-black uppercase tracking-widest",
        node.operator === "AND" ? "bg-indigo-500/10 text-indigo-600" : "bg-amber-500/10 text-amber-600"
      )}>
        {node.operator}
      </Badge>
      <div className="flex flex-wrap items-center gap-1.5">
        {node.children.map((child, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <ConditionSummaryNode node={child} depth={depth + 1} />
            {idx < node.children.length - 1 && (
              <span className="text-[10px] font-black text-muted-foreground/30 px-0.5">
                {node.operator}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
