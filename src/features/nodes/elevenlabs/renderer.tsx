import { useState, useEffect } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import {
  useElevenLabsCredentials,
  useElevenLabsModels,
  useElevenLabsVoices,
  useTestElevenLabsCredential,
} from "@/features/integrations/elevenlabs/hooks/use-elevenlabs-integration";
import { ElevenLabsConfigForm, type ElevenLabsConfigDraft } from "@/features/integrations/elevenlabs/presentation/elevenlabs-config-form";
import { ElevenLabsCredentialsDialog } from "@/features/integrations/elevenlabs/presentation/elevenlabs-credentials-dialog";

import type { ElevenLabsNodeData } from "./schema";
import { ElevenLabsLogo } from "./logo";

function toDraft(data: ElevenLabsNodeData): ElevenLabsConfigDraft {
  return {
    credentialId: data.credentialId ?? "",
    voiceId: data.voiceId ?? "",
    text: data.text ?? "",
    modelId: data.modelId ?? "",
    outputFormat: data.outputFormat ?? "mp3_44100_128",
    timeoutMs: data.timeoutMs,
    resultVariable: data.resultVariable ?? "elevenlabs_audio",
    resultScope: data.resultScope ?? "session",
    sendResponseToUser: data.sendResponseToUser ?? true,
    fallbackText: data.fallbackText ?? "",
  };
}

export function ElevenLabsNodeRenderer({ id, data, selected }: NodeProps & { data: ElevenLabsNodeData }) {
  const { setNodes } = useReactFlow();
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [draft, setDraft] = useState<ElevenLabsConfigDraft>(() => toDraft(data));

  const credentialsQuery = useElevenLabsCredentials(DEFAULT_ORG_ID);

  const selectedCredentialId = selected && draft.credentialId ? draft.credentialId : undefined;
  const modelsQuery = useElevenLabsModels(DEFAULT_ORG_ID, selectedCredentialId);
  const voicesQuery = useElevenLabsVoices(DEFAULT_ORG_ID, selectedCredentialId);
  const testCredential = useTestElevenLabsCredential();

  useEffect(() => {
    if (selected) {
      setDraft(toDraft(data));
    }
  }, [selected, data]);

  const onTestConnection = async () => {
    if (!draft.credentialId) {
      toast.error("Select an ElevenLabs credential first");
      return;
    }
    try {
      const result = await testCredential.mutateAsync({ 
        orgId: DEFAULT_ORG_ID, 
        credentialId: draft.credentialId 
      });
      if (result.ok) toast.success("Connection successful");
      else toast.error(result.errorMessage ?? "Connection failed");
    } catch {
      toast.error("Connection test failed");
    }
  };

  const updateNodeData = (newData: Partial<ElevenLabsNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    if (!draft.credentialId || !draft.voiceId || !draft.text || !draft.resultVariable) {
      toast.error("Account, voice, text and result variable are required");
      return;
    }

    updateNodeData({
      ...draft,
      modelId: draft.modelId || undefined,
      outputFormat: draft.outputFormat || undefined,
      timeoutMs: draft.timeoutMs,
      fallbackText: draft.fallbackText || undefined,
    });
    toast.success("ElevenLabs node updated");
  };

  const isConfigured = !!data.credentialId && !!data.voiceId;

  return (
    <div className="relative">
      {/* 1) Condensed Block Face */}
      <div
          className={cn(
              "flex flex-col justify-center relative w-[220px] min-h-[85px] rounded-xl border p-3.5 select-none transition-all cursor-pointer",
              "bg-[var(--node-bg)] border-[var(--border-dim)] hover:shadow-md",
              selected && "border-2 border-[var(--ey-yellow)] shadow-[0_0_10px_rgba(255,230,0,0.15)] -m-[1px]"
          )}
      >
          <Handle
              type="target"
              position={Position.Top}
              className="h-3 w-3 border-2 border-[var(--border-dim)] bg-background shadow-sm hover:scale-125 transition-transform"
          />

          <div className="flex flex-col gap-2.5 w-full">
              <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                      <ElevenLabsLogo className="size-4" />
                  </div>
                  <span className="text-sm font-semibold truncate text-foreground leading-none pr-1">ElevenLabs</span>
              </div>

              <div className="min-w-0 flex flex-col mt-0.5">
                  <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {isConfigured ? "Convert Text to Speech" : "Configure..."}
                        </span>
                    </div>
                  
                  {isConfigured && data.resultVariable && (
                      <div className="text-[10px] text-[var(--ey-yellow)] tracking-wide font-bold mt-1 max-w-full truncate">
                          ➔ @{data.resultVariable}
                      </div>
                  )}
              </div>
          </div>

          <Handle
              type="source"
              position={Position.Bottom}
              className="h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
          />
      </div>

      {/* 2) Popover Configuration Panel */}
      {selected && (
          <div 
              className="absolute top-0 left-[230px] w-[380px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden"
          >
              <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                      <ElevenLabsLogo className="size-4 text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure ElevenLabs</span>
                  </div>
              </div>
              
              <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar p-4 text-foreground">
                  <ElevenLabsConfigForm
                      draft={draft}
                      credentials={credentialsQuery.data ?? []}
                      models={modelsQuery.data ?? []}
                      voices={voicesQuery.data ?? []}
                      modelsLoading={modelsQuery.isLoading}
                      voicesLoading={voicesQuery.isLoading}
                      modelLoadError={modelsQuery.error ? "Failed to load models" : undefined}
                      voiceLoadError={voicesQuery.error ? "Failed to load voices" : undefined}
                      onDraftChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
                      onConnectAccount={() => setCredentialsOpen(true)}
                      onTestConnection={onTestConnection}
                      testingConnection={testCredential.isPending}
                  />
              </div>

              <div className="flex justify-end border-t border-[var(--border-dim)] px-4 py-3 bg-muted/10">
                  <Button 
                      onClick={onSaveConfig} 
                      size="sm" 
                      className="h-8 gap-1.5 font-bold shadow-sm bg-[var(--ey-yellow)] text-black hover:brightness-95 transition-all w-full"
                  >
                      <Save className="size-3.5" />
                      Save Configuration
                  </Button>
              </div>
          </div>
      )}

      {/* Global Credentials Dialog */}
      <ElevenLabsCredentialsDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={(credential) => {
          setDraft((prev) => ({ ...prev, credentialId: credential.id, modelId: "", voiceId: "" }));
        }}
      />
    </div>
  );
}

