import { useState } from "react";
import { 
  Zap, 
  Database, 
  CheckCircle2,  
  AlertTriangle,
  ChevronRight,
  PhoneCall,
  Activity
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useBulkExecuteRouting, useEntityTypes } from "../../../api/voice-tech-queries";
import { cn } from "@/lib/utils";

interface BulkCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  configId: string;
  configName: string;
  sourceEntityTypes: string[];
  onViewAnalytics?: () => void;
}

export function BulkCallDialog({ 
  open, 
  onOpenChange, 
  tenantId, 
  configId,
  configName,
  sourceEntityTypes,
  onViewAnalytics
}: BulkCallDialogProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [autoRedirect, setAutoRedirect] = useState(true);

  const [step, setStep] = useState<"select" | "processing" | "results">("select");
  const [result, setResult] = useState<{
    totalProcessed: number;
    initiated: number;
    failed: number;
    skipped: number;
    excluded: number;
  } | null>(null);

  const { data: allEntityTypes = [] } = useEntityTypes(tenantId);
  
  // Filter list to only show what's selected in the main workspace
  const entityTypes = sourceEntityTypes.length > 0 
    ? allEntityTypes.filter(t => sourceEntityTypes.includes(t.name))
    : allEntityTypes;

  const bulkExecute = useBulkExecuteRouting();

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleRun = () => {
    if (selectedTypes.length === 0) return;
    
    setStep("processing");
    bulkExecute.mutate({
      tenantId,
      routingConfigId: configId,
      entityTypes: selectedTypes
    }, {
      onSuccess: (data: any) => {
        setResult({
          totalProcessed: data.totalProcessed,
          initiated: data.initiated,
          failed: data.failed,
          skipped: data.skipped,
          excluded: data.excluded ?? 0
        });
        setStep("results");
        if (autoRedirect && onViewAnalytics) {
          setTimeout(() => {
            onViewAnalytics();
          }, 1500);
        }

      },
      onError: () => {
        setStep("select");
      }
    });
  };

  const reset = () => {
    setStep("select");
    setResult(null);
    setSelectedTypes([]);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="size-5 text-primary fill-primary/20" />
            Bulk Orchestration
          </DialogTitle>
          <DialogDescription>
            Process entities through <strong>{configName}</strong> rules.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === "select" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
                  Select Datasets to Process
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1">
                  {entityTypes.map((type) => (
                    <div 
                      key={type.id}
                      onClick={() => toggleType(type.name)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                        selectedTypes.includes(type.name)
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                          : "border-border/60 bg-background hover:border-border hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Database className={cn("size-3.5", selectedTypes.includes(type.name) ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-medium font-mono">{type.name}</span>
                      </div>
                      <Checkbox 
                        checked={selectedTypes.includes(type.name)} 
                        onCheckedChange={() => toggleType(type.name)}
                      />
                    </div>
                  ))}
                  {entityTypes.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-xl border-border/60">
                       <p className="text-xs text-muted-foreground">No datasets available.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
                 <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                    This will initiate calls for all matching entities across the selected datasets. 
                    Ensure your Voice Providers are correctly configured before proceeding.
                 </p>
              </div>

              <div className="flex items-center gap-2 px-1 pt-2">
                 <Checkbox 
                   id="auto-redirect" 
                   checked={autoRedirect} 
                   onCheckedChange={(checked) => setAutoRedirect(!!checked)}
                 />
                 <label htmlFor="auto-redirect" className="text-[11px] font-bold text-muted-foreground cursor-pointer">
                    Automatically switch to Analytics when complete
                 </label>
              </div>

            </div>
          )}

          {step === "processing" && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
               <div className="relative">
                  <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 text-primary animate-pulse" />
               </div>
               <div className="space-y-1">
                  <p className="font-bold text-lg">Orchestrating Calls</p>
                  <p className="text-xs text-muted-foreground">Fetching entities and matching rules for {selectedTypes.length} datasets...</p>
               </div>
            </div>
          )}

          {step === "results" && result && (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Scanned</span>
                     <span className="text-2xl font-black">{result.totalProcessed}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col">
                     <span className="text-[10px] font-bold text-emerald-600 uppercase mb-1 flex items-center gap-1">
                        <PhoneCall className="size-2.5" /> Initiated
                     </span>
                     <span className="text-2xl font-black text-emerald-700">{result.initiated}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col">
                     <span className="text-[10px] font-bold text-amber-600 uppercase mb-1">Excluded (Logic)</span>
                     <span className="text-2xl font-black text-amber-700">{result.excluded}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col">
                     <span className="text-[10px] font-bold text-rose-600 uppercase mb-1">Failed (Errors)</span>
                     <span className="text-2xl font-black text-rose-700">{result.failed}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border flex flex-col col-span-2">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Skipped (No Phone Number)</span>
                     <span className="text-2xl font-black">{result.skipped}</span>
                  </div>
                </div>

               <div className="rounded-xl border bg-primary/5 p-4 flex items-center justify-center gap-3">
                  <CheckCircle2 className="size-5 text-green-600" />
                  <p className="text-sm font-bold text-foreground">Orchestration Cycle Complete</p>
               </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "select" && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button 
                onClick={handleRun} 
                disabled={selectedTypes.length === 0}
                className="gap-1.5 font-bold"
              >
                Run Orchestrator
                <ChevronRight className="size-4" />
              </Button>
            </>
          )}
          {step === "results" && (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="flex-1 font-bold"
              >
                Close Summary
              </Button>
              <Button 
                onClick={onViewAnalytics} 
                className="flex-1 font-bold gap-2 bg-slate-900"
              >
                <Activity className="size-4" />
                Live Analytics
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
