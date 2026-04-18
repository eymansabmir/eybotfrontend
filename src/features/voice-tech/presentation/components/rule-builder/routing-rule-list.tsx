import { 
  Play, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  XSquare,
  ArrowRight,
  Trash2,
  Copy,
  Phone,
  Users,
  MessageCircle,
} from "lucide-react";
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

interface RoutingRuleListProps {
  rules: RoutingRule[];
  onExecuteTest: (rule: RoutingRule) => void;
  onQueryEntities: (rule: RoutingRule) => void;
  onSingleCall: (rule: RoutingRule) => void;
  onBulkCall: (rule: RoutingRule) => void;
  onToggleActive: (rule: RoutingRule, active: boolean) => void;
  onDelete: (ruleId: string) => void;
}

export function RoutingRuleList({ 
  rules, 
  onExecuteTest, 
  onQueryEntities,
  onSingleCall,
  onBulkCall,
  onToggleActive,
  onDelete
}: RoutingRuleListProps) {
  const getTransport = (rule: RoutingRule): "telephony" | "whatsapp" =>
    rule.action.config?.transport === "whatsapp" ? "whatsapp" : "telephony";

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
      <div className="divide-y divide-border/60">
        {rules.sort((a, b) => a.priority - b.priority).map((rule) => {
          const transport = getTransport(rule);
          const isWhatsapp = transport === "whatsapp";
          return (
          <div key={rule.id} className="group hover:bg-muted/30 transition-all flex items-center gap-6 p-4">
            
            {/* Priority Hub */}
            <div className="flex flex-col items-center justify-center gap-1 min-w-[60px]">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Prio</span>
               <span className="text-lg font-bold font-mono tracking-tighter leading-none">{rule.priority}</span>
               <div className={`size-1.5 rounded-full mt-1 ${rule.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
            </div>

            {/* Conditions Block */}
            <div className="flex-1 min-w-0">
               <div className="flex flex-wrap gap-1.5 items-center">
                  <ConditionSummaryNode node={rule.conditions} />
               </div>
            </div>

            {/* Arrow Divider */}
            <div className="flex flex-col items-center shrink-0">
               <div className="size-8 rounded-full bg-muted/40 border flex items-center justify-center text-muted-foreground">
                  <ArrowRight className="size-4" />
               </div>
            </div>

            {/* Action Block */}
            <div className="min-w-[180px] shrink-0">
               <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 border border-border/40">
                  <ProviderBadge provider={rule.action.provider} />
                  <div className="min-w-0">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Agent ID</p>
                     <p className="text-[11px] font-mono truncate mt-1">{rule.action.agentId}</p>
                  <p className="text-[10px] mt-1 inline-flex items-center gap-1 rounded-full bg-background/70 border px-1.5 py-0.5">
                    {isWhatsapp ? <MessageCircle className="size-3 text-emerald-600" /> : <Phone className="size-3 text-indigo-600" />}
                    <span className="font-semibold">{isWhatsapp ? "WhatsApp Voice" : "Telephony"}</span>
                  </p>
                  </div>
               </div>
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
                    <DropdownMenuItem onClick={() => onExecuteTest(rule)} className="gap-2 py-2">
                      <Play className="size-4 text-emerald-500" />
                      <span className="font-medium">Run Test Simulation</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onQueryEntities(rule)} className="gap-2 py-2">
                      <Search className="size-4 text-blue-500" />
                      <span className="font-medium">View Entity Matches</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSingleCall(rule)} className="gap-2 py-2">
                      {isWhatsapp ? <MessageCircle className="size-4 text-emerald-500" /> : <Phone className="size-4 text-indigo-500" />}
                      <span className="font-medium">{isWhatsapp ? "Call WhatsApp User" : "Call Particular User"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBulkCall(rule)} className="gap-2 py-2">
                      <Users className="size-4 text-rose-500" />
                      <span className="font-medium">{isWhatsapp ? "Bulk WhatsApp Campaign" : "Bulk Call Campaign"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 py-2 text-muted-foreground">
                       <Copy className="size-4" /> Duplicate Rule
                    </DropdownMenuItem>
                    {!rule.isActive ? (
                       <DropdownMenuItem 
                         onClick={() => onToggleActive(rule, true)} 
                         className="gap-2 py-2 font-medium text-emerald-600"
                       >
                          <CheckCircle2 className="size-4" /> Activate & Start Campaign
                       </DropdownMenuItem>
                    ) : (
                       <>
                         <DropdownMenuItem 
                           onClick={() => onToggleActive(rule, true)} 
                           className="gap-2 py-2 font-medium text-emerald-600"
                         >
                            <Play className="size-4" /> Run Campaign Now
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => onToggleActive(rule, false)} 
                           className="gap-2 py-2 font-medium text-amber-600"
                         >
                            <XSquare className="size-4" /> Deactivate Rule
                         </DropdownMenuItem>
                       </>
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
  );
}

function ConditionSummaryNode({ node }: { node: RoutingCondition }) {
  if (isConditionLeaf(node)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1 text-[11px] shadow-sm font-medium">
        <span className="text-muted-foreground">{node.field}</span>
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{node.operator.replace('_', ' ')}</span>
        <span className="text-primary font-bold">{String(node.value)}</span>
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border-2 border-dashed border-muted p-1.5 bg-muted/10">
      <Badge variant="secondary" className="h-5 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary">
        {node.operator}
      </Badge>
      {node.children.map((child, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <ConditionSummaryNode node={child} />
          {idx < node.children.length - 1 && (
            <span className="text-[10px] uppercase font-black text-muted-foreground/60">{node.operator}</span>
          )}
        </div>
      ))}
    </div>
  );
}
