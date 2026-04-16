import { Users, Search, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-0 overflow-hidden gap-0">
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
        <div className="flex-1 overflow-y-auto">
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
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center px-8">
              <Search className="size-8 text-muted-foreground/40" />
              <p className="font-semibold text-sm mt-2">No records matched</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                No records in <span className="font-mono font-medium">"{entityType}"</span> satisfy
                all conditions in this rule. Check that your CSV was uploaded to the correct category and
                that the field values match exactly.
              </p>
            </div>
          ) : (
            /* Clean flat table — all attribute keys as columns */
            <div className="overflow-auto max-h-[400px] border rounded-lg shadow-inner bg-muted/5">
              <table className="w-full text-sm border-collapse">
                <thead className="sticky top-0 z-10 bg-background shadow-sm">
                  <tr className="border-b">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 whitespace-nowrap border-r last:border-r-0"
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
                      className={`transition-colors hover:bg-primary/5 ${i % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                    >
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2.5 text-xs font-medium text-foreground/80 whitespace-nowrap border-r last:border-r-0">
                          {entity.attributes?.[col] != null
                            ? (typeof entity.attributes[col] === 'boolean' 
                                ? <Badge variant="outline" className={`text-[10px] uppercase font-bold px-1.5 h-4 ${entity.attributes[col] ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>{String(entity.attributes[col])}</Badge>
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
      </DialogContent>
    </Dialog>
  );
}
