import { useState } from "react";
import { 
  FlaskConical, 
  Send,  
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Database
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useExecuteRouting } from "../../../api/voice-tech-queries";
import { ProviderBadge } from "../shared/provider-badge";
import type { EntityAttribute } from "../../../types";
import { useEffect } from "react";

interface SimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributes: EntityAttribute[] | Record<string, EntityAttribute[]>;
  configId: string | null;
  tenantId: string;
  initialData?: Record<string, string>;
}

export function SimulationDialog({ 
  open, 
  onOpenChange, 
  attributes,
  configId,
  tenantId,
  initialData
}: SimulationDialogProps) {
  const [testData, setTestData] = useState<Record<string, string>>(initialData || {});
  const [phone, setPhone] = useState<string>("");
  
  // Sync testData when initialData is provided
  useEffect(() => {
    if (open && initialData) {
      setTestData(initialData);
      // Try to find phone in initialData
      const discoveredPhone = Object.entries(initialData).find(([k]) => 
        ['phone', 'waid', 'mobile', 'contact'].includes(k.toLowerCase())
      )?.[1];
      if (discoveredPhone) setPhone(discoveredPhone);
    }
  }, [open, initialData]);

  const executeRouting = useExecuteRouting();
  const [result, setResult] = useState<{ matchedRuleId: string | null; action: any; providerResult?: any } | null>(null);

  const handleInputChange = (key: string, value: string) => {
    setTestData(prev => ({ ...prev, [key]: value }));
  };

  const handleSimulate = async () => {
    if (!configId) return;
    
    // Cleanup empty values to avoid polluting the context
    const cleanedData = Object.fromEntries(
      Object.entries(testData).filter(([_, v]) => v.trim() !== "")
    );

    const payload = {
      tenantId,
      routingConfigId: configId,
      attributes: cleanedData,
      phone: phone || undefined,
      executeProvider: !!phone // Only execute if phone is provided
    };

    try {
      const resp = await executeRouting.mutateAsync(payload as any);
      setResult(resp);
    } catch (e) {
      console.error("Simulation failed", e);
    }
  };

  const reset = () => {
    setTestData({});
    setPhone("");
    setResult(null);
  };

  const hasAttributes = Array.isArray(attributes) 
    ? attributes.length > 0 
    : Object.keys(attributes).length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) reset();
      onOpenChange(v);
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[88vh] overflow-y-auto vt-scrollbar">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
             <div className="size-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
                <FlaskConical className="size-4" />
             </div>
             <DialogTitle>Routing Simulation</DialogTitle>
          </div>
          <DialogDescription>
            Enter sample attributes and a target phone number to test your routing logic and trigger a live test call.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Phone Target */}
          <div className="p-3 rounded-xl bg-muted/30 border border-dashed space-y-2">
             <Label htmlFor="sim-phone" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">
                Live Test Number (Optional)
             </Label>
             <Input 
                id="sim-phone"
                placeholder="+1234567890" 
                className="h-9 font-mono text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
             />
             <p className="text-[10px] text-muted-foreground pl-1">
                If provided, a real call will be initiated if a rule matches.
             </p>
          </div>

          {/* Input Form */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Test Payload</h4>
             <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {!hasAttributes ? (
                  <div className="py-8 text-center border-2 border-dashed rounded-xl bg-muted/30">
                     <p className="text-xs text-muted-foreground">No attributes found. Ingest some data first.</p>
                  </div>
                ) : Array.isArray(attributes) ? (
                  <div className="grid grid-cols-2 gap-4">
                     {attributes.map(attr => (
                        <div key={attr.key} className="space-y-1.5">
                        <Label htmlFor={`sim-${attr.key}`} className="text-xs font-semibold">{attr.key}</Label>
                        <Input 
                           id={`sim-${attr.key}`}
                           placeholder={`Value...`} 
                           className="h-8 text-xs font-mono"
                           value={testData[attr.key] || ""}
                           onChange={(e) => handleInputChange(attr.key, e.target.value)}
                        />
                        </div>
                     ))}
                  </div>
                ) : (
                  Object.entries(attributes).map(([entity, attrs]) => (
                     <div key={entity} className="space-y-3 p-3 rounded-xl border border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2 mb-1">
                           <div className="size-5 rounded bg-primary/10 grid place-items-center text-primary">
                              <Database className="size-3" />
                           </div>
                           <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">{entity} Dataset</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           {attrs.map(attr => {
                              const fullKey = `${entity}.${attr.key}`;
                              return (
                                 <div key={fullKey} className="space-y-1.5">
                                    <Label htmlFor={`sim-${fullKey}`} className="text-xs font-semibold">{attr.key}</Label>
                                    <Input 
                                       id={`sim-${fullKey}`}
                                       placeholder={`Value...`} 
                                       className="h-8 text-xs font-mono"
                                       value={testData[fullKey] || ""}
                                       onChange={(e) => handleInputChange(fullKey, e.target.value)}
                                    />
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  ))
                )}
             </div>
          </div>

          {/* Result Area */}
          {result ? (
            result.matchedRuleId ? (
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 animate-in fade-in slide-in-from-top-2">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                       <CheckCircle2 className="size-4 text-green-600" />
                       <span className="text-sm font-bold text-green-700">Winner Identified</span>
                    </div>
                    <Badge className="bg-green-600 text-white border-none shadow-sm">MATCH FOUND</Badge>
                 </div>
                 
                 <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-green-700/60 uppercase">Incoming Call</p>
                       <p className="text-xs font-mono truncate">{Object.keys(testData).length} params</p>
                    </div>
                    
                    <ArrowRight className="size-4 text-green-400" />
  
                    <div className="space-y-2">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-green-700/60 uppercase">Selected Provider</p>
                          <ProviderBadge provider={result.action.voiceProvider} />
                       </div>
                    </div>
                 </div>

                 {phone && (
                   <div className="mt-4 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Send className="size-3 text-emerald-600" />
                         <span className="text-[10px] font-bold text-emerald-700 uppercase">Live Call Triggered</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">{phone}</span>
                   </div>
                 )}
  
                 <div className="mt-4 pt-4 border-t border-green-500/10 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-green-700/60">Resolved by Rule ID:</span>
                    <span className="text-[10px] font-mono text-green-700 bg-green-500/10 px-1.5 py-0.5 rounded uppercase">{result.matchedRuleId.split('-')[0]}...</span>
                 </div>
              </div>
            ) : (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 animate-in fade-in slide-in-from-top-2">
                 <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="size-4 text-yellow-600" />
                    <span className="text-sm font-bold text-yellow-700">No Rule Matches</span>
                 </div>
                 <p className="text-xs text-yellow-600 leading-relaxed">
                   None of your defined rules match this input. The system would use the <strong>Default Fallback</strong> provider list.
                 </p>
              </div>
            )
          ) : executeRouting.isPending ? (
            <div className="py-12 border rounded-xl bg-muted/40 animate-pulse grid place-items-center">
               <div className="flex items-center gap-3">
                  <FlaskConical className="size-5 text-primary animate-bounce" />
                  <span className="text-sm font-medium text-muted-foreground">Evaluating logic rules...</span>
               </div>
            </div>
          ) : executeRouting.isError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex gap-3 text-destructive">
               <AlertCircle className="size-5 shrink-0" />
               <div className="space-y-1">
                  <p className="text-sm font-bold">Evaluation Failed</p>
                  <p className="text-xs opacity-80">{executeRouting.error.message}</p>
               </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={reset} className="text-xs font-bold">Clear All</Button>
          <Button 
            disabled={!configId || (Object.keys(testData).length === 0 && !phone) || executeRouting.isPending}
            onClick={handleSimulate}
            className="gap-2 shadow-sm font-bold"
          >
            <Send className="size-3.5" />
            Run Simulation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
