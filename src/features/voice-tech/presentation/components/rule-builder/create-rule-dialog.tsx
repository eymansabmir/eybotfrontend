import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Smartphone } from "lucide-react";
import { StepperSidebar, type StepConfig } from "@/features/campaign/presentation/components/wizard/stepper-sidebar";
import { ConditionBuilder } from "./condition-builder";
import { ProviderBadge } from "../shared/provider-badge";
import type { 
  LogicalOperator, 
  RoutingCondition, 
  EntityAttribute, 
  VoiceProvider,
  RoutingRuleAction
} from "../../../types";
import { VOICE_PROVIDERS } from "../../../types";

const STEPS: StepConfig[] = [
  { title: "Define Conditions", description: "Who should this rule apply to?" },
  { title: "Choose Action", description: "Select the voice provider and agent" },
  { title: "Set Priority", description: "Order this rule in the routing stack" },
];

interface CreateRoutingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributes: EntityAttribute[];
  onSave: (rule: any) => void;
  isSaving?: boolean;
}

export function CreateRoutingRuleDialog({ 
  open, 
  onOpenChange, 
  attributes,
  onSave,
  isSaving = false
}: CreateRoutingRuleDialogProps) {
  const [step, setStep] = useState(0);
  const prevIsSaving = useRef(isSaving);

  // ── Form State ──────────────────────────────────────────────────
  const [conditions, setConditions] = useState<{ operator: LogicalOperator; children: RoutingCondition[] }>({
    operator: "AND",
    children: [{ field: "", operator: "equals", value: "" }]
  });
  
  const [provider, setProvider] = useState<VoiceProvider>("elevenlabs");
  const [agentId, setAgentId] = useState("");
  const [priority, setPriority] = useState("10");
  const [isActive, setIsActive] = useState(true);

  const resetForm = useCallback(() => {
    setStep(0);
    setConditions({
      operator: "AND",
      children: [{ field: "", operator: "equals", value: "" }]
    });
    setProvider("elevenlabs");
    setAgentId("");
    setPriority("10");
    setIsActive(true);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(resetForm, 200);
  }, [onOpenChange, resetForm]);

  // Auto-close dialog when save is successful
  useEffect(() => {
    if (prevIsSaving.current === true && isSaving === false && open) {
      handleClose();
    }
    prevIsSaving.current = isSaving;
  }, [isSaving, open, handleClose]);

  const canContinue = (() => {
    if (step === 0) {
       // Deep validation of conditions could be added here
       return conditions.children.length > 0;
    }
    if (step === 1) return agentId.trim().length > 0;
    if (step === 2) return priority.trim().length > 0;
    return false;
  })();

  const handleSave = () => {
    const action: RoutingRuleAction = {
      type: "VOICE_PROVIDER",
      provider,
      agentId,
    };

    onSave({
      priority: parseInt(priority, 10),
      isActive,
      conditions,
      action,
    });
    
    // Dialog closing is handled by the parent upon success
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] md:max-w-[950px] p-0 gap-0 overflow-hidden h-[600px] md:h-[650px]">
        <div className="grid grid-cols-[280px_1fr] h-full">
          {/* Left: Stepper Sidebar */}
          <StepperSidebar steps={STEPS} currentStep={step} />

          {/* Right: Step Content */}
          <div className="flex flex-col h-full bg-background">
            <div className="flex-1 overflow-y-auto p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* STEP 0: CONDITIONS */}
                  {step === 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Match Conditions</h3>
                        <p className="text-sm text-muted-foreground">Define logic to route users to a specific voice agent.</p>
                      </div>
                      <ConditionBuilder 
                        value={conditions} 
                        attributes={attributes} 
                        onChange={setConditions} 
                      />
                    </div>
                  )}

                  {/* STEP 1: ACTION */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold">Configure Action</h3>
                        <p className="text-sm text-muted-foreground">Select where the call should be routed if conditions match.</p>
                      </div>

                      <div className="space-y-4 max-w-sm">
                         <div className="space-y-2">
                            <Label>Voice Provider</Label>
                            <Select value={provider} onValueChange={(v) => setProvider(v as VoiceProvider)}>
                               <SelectTrigger>
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                  {VOICE_PROVIDERS.map(p => (
                                     <SelectItem key={p} value={p}>
                                        <div className="flex items-center gap-2">
                                           <ProviderBadge provider={p} />
                                        </div>
                                     </SelectItem>
                                  ))}
                               </SelectContent>
                            </Select>
                         </div>

                         <div className="space-y-2">
                            <Label>Agent ID / Config ID</Label>
                            <div className="relative">
                               <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                               <Input 
                                  value={agentId} 
                                  onChange={(e) => setAgentId(e.target.value)}
                                  placeholder="e.g. v1-agent-abcd-1234" 
                                  className="pl-9"
                               />
                            </div>
                            <p className="text-[10px] text-muted-foreground">This ID should exist in your chosen provider's dashboard.</p>
                         </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: PRIORITY & REVIEW */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold">Priority & Status</h3>
                        <p className="text-sm text-muted-foreground">Rules are evaluated sequentially. Lower numbers have higher precedence.</p>
                      </div>

                      <div className="space-y-4 max-w-sm">
                         <div className="space-y-2">
                            <Label>Rule Priority</Label>
                            <Input 
                              type="number" 
                              value={priority} 
                              onChange={(e) => setPriority(e.target.value)}
                              min="1" 
                            />
                         </div>

                         <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                            <div className="flex-1">
                               <p className="text-sm font-semibold">Enable Rule</p>
                               <p className="text-xs text-muted-foreground">Immediately activate this routing logic after saving.</p>
                            </div>
                            <Button 
                               variant={isActive ? "default" : "outline"}
                               size="sm"
                               onClick={() => setIsActive(!isActive)}
                            >
                               {isActive ? "ACTIVE" : "DISABLED"}
                            </Button>
                         </div>
                      </div>

                      </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-8 py-4 flex items-center justify-between bg-muted/20">
              <p className="text-xs text-muted-foreground italic">
                Step {step + 1} of {STEPS.length}
              </p>
              <div className="flex items-center gap-2">
                {step === 0 ? (
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                ) : (
                  <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>
                )}

                {step < STEPS.length - 1 ? (
                  <Button 
                    onClick={() => setStep((s) => s + 1)} 
                    disabled={!canContinue}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSave}
                    disabled={!canContinue || isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Routing Rule"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
