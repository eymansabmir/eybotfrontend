import { useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [configOpen, setConfigOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [draft, setDraft] = useState<ElevenLabsConfigDraft>(() => toDraft(data));

  const credentialsQuery = useElevenLabsCredentials(DEFAULT_ORG_ID);

  const selectedCredentialId = configOpen && draft.credentialId ? draft.credentialId : undefined;
  const modelsQuery = useElevenLabsModels(DEFAULT_ORG_ID, selectedCredentialId);
  const voicesQuery = useElevenLabsVoices(DEFAULT_ORG_ID, selectedCredentialId);
  const testCredential = useTestElevenLabsCredential();

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

  const openConfig = () => {
    setDraft(toDraft(data));
    setConfigOpen(true);
  };

  const handleNodeClick = () => {
    // Prevent accidental re-open/reset while any dialog is currently open.
    if (configOpen || credentialsOpen) return;
    openConfig();
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
    setConfigOpen(false);
    toast.success("ElevenLabs node updated");
  };

  const isConfigured = !!data.credentialId && !!data.voiceId;

  return (
    <div
      onClick={handleNodeClick}
      className={cn(
        "group relative flex min-w-40 max-w-[240px] cursor-pointer rounded-lg border bg-background p-3 transition-all hover:shadow-md",
        selected ? "border-primary ring-1 ring-primary" : "border-border shadow-sm",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="size-2 border-2 border-background bg-muted-foreground !transition-transform group-hover:scale-125"
      />

      <div className="flex w-full flex-col gap-2">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 shrink-0 rounded bg-gray-100 p-1 dark:bg-zinc-800">
            <ElevenLabsLogo className="size-3.5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={cn(
              "truncate text-sm font-medium",
              isConfigured ? "text-foreground" : "text-muted-foreground"
            )}>
              {isConfigured ? "Convert text to speech" : "Configure..."}
            </p>
          </div>
        </div>

        {isConfigured && data.resultVariable && (
          <div className="flex items-center gap-1.5 overflow-hidden border-t pt-2">
            <span className="shrink-0 text-[10px] font-medium italic text-muted-foreground">Set</span>
            <span className="truncate rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              {data.resultVariable}
            </span>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        className="size-2 border-2 border-background bg-primary !transition-transform group-hover:scale-125"
      />

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className="flex max-h-[85vh] max-w-sm flex-col overflow-hidden p-0"
        >
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="flex items-center gap-2">
               <ElevenLabsLogo className="size-5" />
               ElevenLabs
            </DialogTitle>
            <DialogDescription>
              Configure the speech generation parameters.
            </DialogDescription>
          </DialogHeader>
          
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
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
          
          <div className="flex justify-end border-t px-5 py-3">
            <Button onClick={onSaveConfig} size="sm" className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="size-3.5" />
              Save config
            </Button>
          </div>

        </DialogContent>
      </Dialog>

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

