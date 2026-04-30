import { useState, useEffect } from "react";
import { Bot, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useUpsertVoiceAgent, useCredentials } from "../../../api/voice-tech-queries";
import type { VoiceAgent, IntegrationCredential } from "../../../types";

interface UpsertAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: VoiceAgent | null;
  credential?: IntegrationCredential | null;
  tenantId: string;
}

export function UpsertAgentDialog({ 
  open, 
  onOpenChange, 
  agent, 
  credential,
  tenantId 
}: UpsertAgentDialogProps) {
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [selectedCredentialId, setSelectedCredentialId] = useState("");
  
  // Only used if credential is not provided
  const { data: credentials = [] } = useCredentials(tenantId);
  
  const upsertMutation = useUpsertVoiceAgent(tenantId);

  useEffect(() => {
    if (open) {
      if (agent) {
        setName(agent.providerName || "");
        setAgentId(agent.config?.agentId || "");
        setSelectedCredentialId(agent.credentialId || "");
      } else {
        setName("");
        setAgentId("");
        setSelectedCredentialId(credential?.id || "");
      }
    }
  }, [open, agent, credential]);

  const handleSave = () => {
    const finalCredentialId = credential?.id || selectedCredentialId;
    if (!finalCredentialId) return;

    upsertMutation.mutate({
      id: agent?.id,
      tenantId,
      credentialId: finalCredentialId,
      providerName: name,
      config: { agentId },
      isActive: true,
    }, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <Bot className="size-6" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {agent ? "Edit Voice Agent" : "Add Voice Agent"}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80 mt-1">
            {agent 
              ? "Update the configuration for this AI agent." 
              : "Link a specific agent ID from your vendor to your dashboard."}
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            {!credential && (
              <div className="grid gap-2">
                <Label>Voice Vendor</Label>
                <Select 
                  value={selectedCredentialId} 
                  onValueChange={setSelectedCredentialId}
                  disabled={!!agent}
                >
                  <SelectTrigger className="rounded-xl h-11 border-border">
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {credentials.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="agent-name">Agent Label</Label>
              <Input
                id="agent-name"
                placeholder="e.g., Customer Support Bot"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl h-11 border-border"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agent-id">Provider Agent ID</Label>
              <Input
                id="agent-id"
                placeholder="Paste the ID from your provider dashboard"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="rounded-xl h-11 font-mono text-sm border-border"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!name || !agentId || (!credential && !selectedCredentialId) || upsertMutation.isPending}
            className="rounded-xl px-8"
          >
            {upsertMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Bot className="size-4 mr-2" />}
            {agent ? "Save Changes" : "Add Agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
