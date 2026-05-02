import { useNavigate, useSearch } from "@tanstack/react-router";
import { 
  Bot, 
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AgentForm } from "../components/shared/agent-form";
import { useVoiceAgents } from "../../api/voice-tech-queries";

const ORG_ID = "tenant-ey-001";

export function CreateAgentPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/voice-tech/agents/create" }) as any;
  const credentialId = search.credentialId;
  const editId = search.edit;
  const returnTo = search.returnTo || "/voice-tech/vendors";

  const { data: agents = [] } = useVoiceAgents(ORG_ID);
  const editingAgent = editId ? agents.find(a => a.id === editId) : null;

  const handleSuccess = () => {
    navigate({ to: returnTo });
  };

  const handleCancel = () => {
    navigate({ to: returnTo });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
          <Bot className="size-3.5" />
          Agent Management
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCancel}
            className="rounded-full bg-card border border-border shadow-sm hover:bg-muted shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              ORCHESTRATOR <span className="mx-2 text-muted-foreground/30">›</span> AGENTS <span className="mx-2 text-muted-foreground/30">›</span> {editingAgent ? "EDIT AGENT" : "NEW AGENT"}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground mt-0.5">
              {editingAgent ? "Edit Voice Agent" : "Configure AI Agent"}
            </h1>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground max-w-2xl mt-2 ml-14">
          {editingAgent 
            ? "Update the behavioral parameters and provider mapping for your AI voice entity."
            : "Deploy a new AI agent instance by linking your provider's unique identifier."}
        </p>
      </div>


      {/* ── Form Card ─────────────────────────────────────── */}
      <Card className="border-border shadow-sm overflow-hidden rounded-2xl bg-card">
        <CardContent className="p-8">
          <AgentForm 
            onSuccess={handleSuccess} 
            onCancel={handleCancel} 
            agent={editingAgent}
            fixedCredentialId={credentialId}
            tenantId={ORG_ID}
          />
        </CardContent>
      </Card>
    </div>
  );
}
