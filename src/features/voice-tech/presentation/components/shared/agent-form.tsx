import { useState, useEffect } from "react";
import { Bot, Loader2, Shield } from "lucide-react";
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
import type { VoiceAgent } from "../../../types";

interface AgentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  agent?: VoiceAgent | null;
  fixedCredentialId?: string | null;
  tenantId: string;
}

export function AgentForm({ 
  onSuccess, 
  onCancel, 
  agent, 
  fixedCredentialId,
  tenantId 
}: AgentFormProps) {
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [selectedCredentialId, setSelectedCredentialId] = useState("");
  
  const { data: credentials = [] } = useCredentials(tenantId);
  const upsertMutation = useUpsertVoiceAgent(tenantId);

  useEffect(() => {
    if (agent) {
      setName(agent.providerName || "");
      setAgentId(agent.config?.agentId || "");
      setSelectedCredentialId(agent.credentialId || "");
    } else if (fixedCredentialId) {
      setSelectedCredentialId(fixedCredentialId);
    }
  }, [agent, fixedCredentialId]);

  const handleSave = () => {
    const finalCredentialId = fixedCredentialId || selectedCredentialId;
    if (!finalCredentialId) return;

    upsertMutation.mutate({
      id: agent?.id,
      tenantId,
      credentialId: finalCredentialId,
      providerName: name,
      config: { agentId },
      isActive: true,
    }, {
      onSuccess: () => onSuccess(),
    });
  };

  const isFormValid = name && agentId && (fixedCredentialId || selectedCredentialId);

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Vendor Selection (if not fixed) */}
        {!fixedCredentialId && (
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">
              Voice Vendor
            </Label>
            <Select 
              value={selectedCredentialId} 
              onValueChange={setSelectedCredentialId}
              disabled={!!agent}
            >
              <SelectTrigger className="h-11 rounded-lg bg-background border-border focus:ring-1 focus:ring-primary">
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border shadow-xl">
                {credentials.map(c => (
                  <SelectItem key={c.id} value={c.id} className="font-medium">
                    {c.name} ({c.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Agent Label */}
        <div className="space-y-2">
          <Label htmlFor="agent-name" className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">
            Agent Label
          </Label>
          <Input
            id="agent-name"
            placeholder="e.g., Customer Support Bot"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-lg bg-background border-border focus-visible:ring-1 focus-visible:ring-primary font-medium"
          />
        </div>

        {/* Provider Agent ID */}
        <div className="space-y-2">
          <Label htmlFor="agent-id" className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">
            Provider Agent ID
          </Label>
          <div className="relative">
            <Input
              id="agent-id"
              placeholder="Paste the ID from your provider dashboard"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="h-11 rounded-lg bg-background border-border focus-visible:ring-1 focus-visible:ring-primary font-mono text-sm"
            />
            <Bot className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-border flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="h-11 px-8 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          Cancel
        </Button>
        <div className="flex-1" />
        <Button
          onClick={handleSave}
          disabled={!isFormValid || upsertMutation.isPending}
          className="gap-2 h-11 px-10 rounded-lg bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {upsertMutation.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Shield className="size-4 mr-2" />}
          {agent ? "Save Changes" : "Add Agent"}
        </Button>
      </div>
    </div>
  );
}
