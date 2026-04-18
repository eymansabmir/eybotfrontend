import { useState } from "react";
import { 
  Zap, 
  Database, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle,
  ChevronRight,
  PhoneCall
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
import { Badge } from "@/components/ui/badge";
import { useBulkExecuteRouting, useEntityTypes } from "../../../api/voice-tech-queries";
import { cn } from "@/lib/utils";

interface BulkCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  configId: string;
  configName: string;
}

export function BulkCallDialog({ 
  open, 
  onOpenChange, 
  tenantId, 
  configId,
  configName 
}: BulkCallDialogProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [step, setStep] = useState<"select" | "processing" | "results">("select");
  const [result, setResult] = useState<{
    totalProcessed: number;
    initiated: number;
    failed: number;
    skipped: number;
  } | null>(null);

  const { data: entityTypes = [] } = useEntityTypes(tenantId);
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
      onSuccess: (data) => {
        setResult(data);
        setStep("results");
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
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all",
                        selectedTypes.includes(type)
                          ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                          : "border-border/60 bg-background hover:border-border hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Database className={cn("size-3.5", selectedTypes.includes(type) ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-medium font-mono">{type}</span>
                      </div>
                      <Checkbox 
                        checked={selectedTypes.includes(type)} 
                        onCheckedChange={() => toggleType(type)}
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
                     <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Processed</span>
                     <span className="text-2xl font-black">{result.totalProcessed}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex flex-col">
                     <span className="text-[10px] font-bold text-green-600 uppercase mb-1 flex items-center gap-1">
                        <PhoneCall className="size-2.5" /> Initiated
                     </span>
                     <span className="text-2xl font-black text-green-700">{result.initiated}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col">
                     <span className="text-[10px] font-bold text-red-600 uppercase mb-1">Failed Matches</span>
                     <span className="text-2xl font-black text-red-700">{result.failed}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border flex flex-col">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">No Phone / Skip</span>
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
            <Button onClick={() => onOpenChange(false)} className="w-full font-bold">Close Summary</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
