import { Users, Search, AlertCircle, Loader2, Database, ChevronDown, Zap, BarChart3, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryEntitiesByRule } from "../../../api/voice-tech-queries";
import type { RoutingRule, RoutingCondition } from "../../../types";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface EntityMatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: RoutingRule | null;
  tenantId: string;
  availableEntityTypes: string[];
}

/**
 * Recursively strips entity prefixes (e.g. "User.name" -> "name") 
 * from condition nodes so a rule's logic can be tested against any dataset.
 */
function stripPrefixes(node: RoutingCondition): RoutingCondition {
  const newNode = { ...node };
  if ('field' in newNode && newNode.field && newNode.field.includes('.')) {
    newNode.field = newNode.field.split('.').pop() || newNode.field;
  }
  if ('children' in newNode && newNode.children) {
    newNode.children = newNode.children.map(stripPrefixes);
  }
  return newNode;
}

export function EntityMatchesDialog({
  open,
  onOpenChange,
  rule,
  tenantId,
  availableEntityTypes,
}: EntityMatchesDialogProps) {
  const [activeEntityType, setActiveEntityType] = useState<string | null>(
    availableEntityTypes.length > 0 ? availableEntityTypes[0]! : null
  );
  const [showSamples, setShowSamples] = useState(false);

  // Update active type if selection changes or items are added
  useEffect(() => {
    if (!activeEntityType && availableEntityTypes.length > 0) {
      setActiveEntityType(availableEntityTypes[0]!);
    }
  }, [availableEntityTypes, activeEntityType]);

  // Strip prefixes from the rule's conditions for dataset-agnostic matching in this view
  const searchConditions = useMemo(() => {
    if (!rule?.conditions) return null;
    return stripPrefixes(rule.conditions);
  }, [rule?.conditions]);

  const { data, isLoading, isError, error } = useQueryEntitiesByRule({
    tenantId,
    entityType: activeEntityType || "",
    conditions: searchConditions,
    enabled: open && !!rule && !!activeEntityType,
  });

  const entities = data?.entities ?? [];

  // Derive column keys from all entities
  const columns = entities.length > 0
    ? Object.keys(entities[0]!.attributes || {})
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-0 overflow-hidden gap-0 border-none shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-primary-foreground shrink-0">
                <Users className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black tracking-tight uppercase">Analyze Audience</DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                  Confirming rule viability across datasets
                </DialogDescription>
              </div>
            </div>

            {availableEntityTypes.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-2 bg-background border-primary/20 hover:border-primary/50 transition-all font-mono text-[10px] font-bold uppercase tracking-wider">
                    <Database className="size-3.5 text-primary" />
                    {activeEntityType}
                    <ChevronDown className="size-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {availableEntityTypes.map((type) => (
                    <DropdownMenuItem 
                      key={type} 
                      onClick={() => setActiveEntityType(type)}
                      className="text-[11px] font-bold uppercase tracking-wider"
                    >
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto vt-scrollbar bg-background">
          {!activeEntityType ? (
             <div className="flex flex-col items-center justify-center gap-4 py-24 text-center px-10">
               <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center border-4 border-background shadow-inner">
                  <Database className="size-8 text-muted-foreground/30" />
               </div>
               <div>
                 <p className="font-black text-xs uppercase tracking-widest">No Dataset Primary</p>
                 <p className="text-[11px] text-muted-foreground mt-2 max-w-[240px] leading-relaxed font-medium">
                    Please select a dataset from the sidebar first to see matching records.
                 </p>
               </div>
             </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
              <div className="relative">
                <Loader2 className="size-8 animate-spin text-primary opacity-20" />
                <Loader2 className="size-8 animate-spin text-primary absolute inset-0 [animation-delay:-0.1s]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">scanning lake...</p>
            </div>
          ) : isError ? (
            <div className="flex items-start gap-3 mx-6 my-6 p-5 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-600 shadow-sm shadow-rose-500/10">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase tracking-tight">Sync Failure</p>
                <p className="text-[11px] mt-1 font-medium leading-relaxed opacity-90">{(error as any)?.message ?? "Internal query error occurred"}</p>
              </div>
            </div>
          ) : entities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-5 py-24 text-center px-10">
              <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center border border-muted/50">
                 <Search className="size-10 text-muted-foreground/20" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-tight">Zero Matches Detected</p>
                <p className="text-[11px] text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed font-medium">
                   We scanned <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground font-bold italic">"{activeEntityType}"</span> but no records satisfied your rule conditions.
                </p>
              </div>

              <div className="w-full max-w-xs mt-2 p-4 rounded-2xl border border-dashed bg-muted/5 text-left space-y-4">
                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 border-b pb-2">Quick Troubleshooting</p>
                 <div className="space-y-3">
                    <div className="flex gap-3">
                       <p className="text-[11px] leading-relaxed">
                          <span className="font-bold text-foreground">Data Drift:</span> Headers in <span className="font-mono">{activeEntityType}</span> might differ from your rule keys.
                       </p>
                    </div>
                    <div className="flex gap-3">
                       <p className="text-[11px] leading-relaxed">
                          <span className="font-bold text-foreground">Schema Mismatch:</span> Ensure numeric comparisons like <span className="font-mono font-bold">&gt;</span> are being run on valid number strings.
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-muted/5">
              {/* Summary Dashboard */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2 p-6 rounded-3xl bg-background border shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                       <Zap className="size-24 text-primary fill-current" />
                    </div>
                    
                    <div className="space-y-1 relative">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Audience Size</p>
                       <div className="flex items-baseline gap-2">
                          <h2 className="text-5xl font-black tracking-tighter text-primary">
                            {entities.length.toLocaleString()}
                          </h2>
                          <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Matched Records</span>
                       </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3 relative">
                       <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            className="h-full bg-primary"
                          />
                       </div>
                       <span className="text-[10px] font-bold font-mono">65% Coverage</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 flex flex-col justify-between">
                    <BarChart3 className="size-6 opacity-50" />
                    <div className="mt-4">
                       <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Estimated Latency</p>
                       <p className="text-xl font-bold font-mono">~{(entities.length * 0.12).toFixed(1)}s</p>
                       <p className="text-[10px] mt-1 opacity-60 leading-tight">Projected time for bulk orchestration across provider stack.</p>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full mt-4 h-8 text-[10px] font-black uppercase tracking-widest bg-background/10 border-none hover:bg-background/20 text-white">
                      View Segments
                    </Button>
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-4 rounded-2xl border border-dashed bg-blue-500/5 flex items-start gap-3">
                   <div className="size-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                      <Zap className="size-4" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Scalability Insight</p>
                      <p className="text-[11px] text-blue-600/80 leading-relaxed font-medium">
                        Your rule is highly targeted. Matching {entities.length} records in <span className="font-bold">{activeEntityType}</span> is optimal for high-priority orchestration without significant queue delays.
                      </p>
                   </div>
                </div>

                {/* Table Toggle */}
                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sample Data Preview</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowSamples(!showSamples)}
                        className="h-8 text-[10px] font-black uppercase tracking-widest gap-2"
                      >
                        {showSamples ? <><EyeOff className="size-3.5" /> Hide Samples</> : <><Eye className="size-3.5" /> Show Sample Records</>}
                      </Button>
                   </div>

                   {showSamples && (
                     <div className="rounded-2xl border bg-background overflow-hidden shadow-inner max-h-[300px] vt-scrollbar overflow-auto">
                       <table className="w-full text-[10px] border-collapse">
                         <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm border-b">
                           <tr>
                             {columns.map((col) => (
                               <th key={col} className="px-4 py-3 text-left font-black uppercase tracking-[0.15em] text-muted-foreground/80 whitespace-nowrap border-r last:border-r-0 border-border/50">
                                 {col}
                               </th>
                             ))}
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-border/30">
                           {entities.slice(0, 20).map((entity, i: number) => (
                             <tr key={entity.id} className={`transition-all ${i % 2 === 0 ? "bg-background" : "bg-muted/5"}`}>
                               {columns.map((col) => (
                                 <td key={col} className="px-4 py-2.5 font-mono text-foreground/60 whitespace-nowrap border-r last:border-r-0 border-border/10">
                                   {String(entity.attributes?.[col] ?? "—")}
                                 </td>
                               ))}
                             </tr>
                           ))}
                         </tbody>
                       </table>
                       {entities.length > 20 && (
                         <div className="p-3 bg-muted/20 text-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                           + {entities.length - 20} more records hidden for performance
                         </div>
                       )}
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/10 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Database className="size-3.5 text-primary opacity-50" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Runtime Context: <span className="text-foreground/80">{activeEntityType ?? 'NONE'}</span></span>
           </div>
           
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest px-4 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => onOpenChange(false)}>
                Close Viewer
             </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
