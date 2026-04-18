import { Users, Search, AlertCircle, Loader2, Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryEntitiesByRule } from "../../../api/voice-tech-queries";
import type { RoutingRule } from "../../../types";

interface EntityMatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: RoutingRule | null;
  tenantId: string;
  entityType: string;
}

export function EntityMatchesDialog({
  open,
  onOpenChange,
  rule,
  tenantId,
  entityType,
}: EntityMatchesDialogProps) {
  const { data: entities = [], isLoading, isError, error } = useQueryEntitiesByRule({
    tenantId,
    entityType,
    conditions: rule?.conditions ?? null,
    enabled: open && !!rule,
  });

  // Derive column keys from all entities
  const columns = entities.length > 0
    ? Object.keys(entities[0]!.attributes || {})
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0">
              <Users className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base">Matching Records</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Dataset: <span className="font-mono font-semibold text-foreground">{entityType}</span>
                {!isLoading && entities.length > 0 && (
                  <span className="ml-2 text-emerald-600 font-semibold">· {entities.length} found</span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto vt-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
              <p className="text-sm">Scanning records…</p>
            </div>
          ) : isError ? (
            <div className="flex items-start gap-3 mx-6 my-6 p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Query failed</p>
                <p className="text-xs mt-0.5 opacity-80">{(error as any)?.message ?? "Unknown error"}</p>
              </div>
            </div>
          ) : entities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-10">
              <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                 <Search className="size-8 text-muted-foreground/30" />
              </div>
              <div>
                <p className="font-bold text-base">No matches found in this dataset</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                   We scanned <span className="font-mono font-bold">"{entityType}"</span> but no records satisfied your rule conditions.
                </p>
              </div>

              <div className="w-full max-w-sm mt-4 p-4 rounded-xl border bg-muted/10 text-left space-y-3">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Troubleshooting Guide</p>
                 <div className="space-y-2">
                    <div className="flex gap-2">
                       <div className="size-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold">1</span>
                       </div>
                       <p className="text-[11px] leading-relaxed">
                          <strong>Data Synchronization:</strong> If you just added new fields, try re-uploading your CSV to the <span className="font-mono">"{entityType}"</span> category.
                       </p>
                    </div>
                    <div className="flex gap-2">
                       <div className="size-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold">2</span>
                       </div>
                       <p className="text-[11px] leading-relaxed">
                          <strong>Field Precision:</strong> Ensure the attributes in your rule match the CSV headers exactly (case-insensitive).
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            /* Clean flat table — all attribute keys as columns */
            <div className="overflow-auto max-h-[400px] border-t vt-scrollbar">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-background shadow-sm">
                  <tr className="border-b bg-muted/30">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap border-r last:border-r-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {entities.map((entity, i) => (
                    <tr
                      key={entity.id}
                      className={`transition-colors hover:bg-primary/5 ${i % 2 === 0 ? "bg-background" : "bg-muted/5 font-medium text-foreground/80"}`}
                    >
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2.5 text-[11px] font-mono whitespace-nowrap border-r last:border-r-0">
                          {entity.attributes?.[col] != null
                            ? (typeof entity.attributes[col] === 'boolean' 
                                ? <Badge variant="outline" className={`text-[9px] uppercase font-black px-1.5 h-4 ${entity.attributes[col] ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'}`}>{String(entity.attributes[col])}</Badge>
                                : String(entity.attributes[col]))
                            : <span className="text-muted-foreground/30">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Database className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target Dataset: {entityType}</span>
           </div>
           {!isLoading && entities.length > 0 && (
             <Button size="sm" variant="ghost" className="h-7 text-[10px] font-bold uppercase tracking-widest gap-2">
                <Search className="size-3" /> Find More
             </Button>
           )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
