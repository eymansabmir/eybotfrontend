import { useEffect, useMemo, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { AudioWaveform, Plus, Save, Settings2 } from "lucide-react";
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
import type { ElevenLabsTestConnectionResult } from "@/features/integrations/elevenlabs/domain/elevenlabs.types";
import { IntegrationShell } from "@/features/integrations/presentation/integration-shell";

import type { ElevenLabsNodeData } from "./schema";

function toErrorMessage(error: unknown): string {
  const maybeServerMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (typeof maybeServerMessage === "string" && maybeServerMessage.trim()) {
    return maybeServerMessage;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Failed to load data for the selected credential.";
}

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
  const [lastTestResult, setLastTestResult] = useState<ElevenLabsTestConnectionResult | null>(null);
  const [draft, setDraft] = useState<ElevenLabsConfigDraft>(() => toDraft(data));

  const credentialsQuery = useElevenLabsCredentials(DEFAULT_ORG_ID);
  const hasValidDraftCredential = useMemo(
    () => (credentialsQuery.data ?? []).some((item) => item.id === draft.credentialId),
    [credentialsQuery.data, draft.credentialId],
  );
  const selectedCredentialId =
    draft.credentialId && (credentialsQuery.isLoading || hasValidDraftCredential)
      ? draft.credentialId
      : undefined;
  const modelsQuery = useElevenLabsModels(DEFAULT_ORG_ID, selectedCredentialId);
  const voicesQuery = useElevenLabsVoices(DEFAULT_ORG_ID, selectedCredentialId);
  const testCredential = useTestElevenLabsCredential();

  useEffect(() => {
    if (!selectedCredentialId) {
      return;
    }

    console.log("STEP 1: UI triggered", {
      orgId: DEFAULT_ORG_ID,
      credentialId: selectedCredentialId,
      source: "ElevenLabsNodeRenderer",
      action: "load_models_and_voices",
    });
  }, [selectedCredentialId]);

  const selectedCredential = useMemo(
    () => credentialsQuery.data?.find((item) => item.id === data.credentialId),
    [credentialsQuery.data, data.credentialId],
  );

  const openConfig = () => {
    setDraft(toDraft(data));
    setLastTestResult(null);
    setConfigOpen(true);
  };

  const updateNodeData = (newData: Partial<ElevenLabsNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    if (!draft.credentialId || !draft.voiceId || !draft.text || !draft.resultVariable) {
      toast.error("Credential, voice, text and result variable are required");
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

  const onTestConnection = async () => {
    if (!draft.credentialId) {
      toast.error("Select an ElevenLabs credential first");
      return;
    }

    try {
      const result = await testCredential.mutateAsync({
        orgId: DEFAULT_ORG_ID,
        credentialId: draft.credentialId,
      });
      setLastTestResult(result);
      if (result.ok) toast.success("Connection successful");
      else toast.error(result.errorMessage ?? "Connection failed");
    } catch {
      toast.error("Connection test failed");
    }
  };

  return (
    <div
      className={cn(
        "group relative min-w-72.5 rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
        selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm transition-transform hover:scale-125"
      />

      <IntegrationShell
        title="ElevenLabs"
        subtitle={data.voiceId ? `Voice: ${data.voiceId}` : "Configure voice and text-to-speech options"}
        icon={<AudioWaveform className="size-4" />}
        actions={
          <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={openConfig}>
            <Settings2 className="size-3.5" />
            Configure...
          </Button>
        }
        className="border-0 shadow-none"
      >
        <div className="space-y-3">
          {data.credentialId ? (
            <p className="text-xs text-muted-foreground">
              {selectedCredential ? `Credential: ${selectedCredential.name}` : "Credential configured"}
            </p>
          ) : (
            <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => setCredentialsOpen(true)}>
              <Plus className="size-4" />
              Add ElevenLabs account
            </Button>
          )}
        </div>
      </IntegrationShell>

      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        className="h-4 w-4 border-2 border-background bg-primary shadow-sm transition-transform hover:scale-125"
      />

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden p-0">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6">Configure ElevenLabs node</DialogTitle>
            <DialogDescription className="px-6">
              Select credential, voice, and runtime output options for speech generation.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <ElevenLabsConfigForm
              draft={draft}
              credentials={credentialsQuery.data ?? []}
              models={modelsQuery.data ?? []}
              voices={voicesQuery.data ?? []}
              modelsLoading={modelsQuery.isLoading}
              voicesLoading={voicesQuery.isLoading}
              lastTestResult={lastTestResult}
              modelLoadError={modelsQuery.error ? toErrorMessage(modelsQuery.error) : undefined}
              voiceLoadError={voicesQuery.error ? toErrorMessage(voicesQuery.error) : undefined}
              onDraftChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
              onConnectAccount={() => setCredentialsOpen(true)}
              onTestConnection={onTestConnection}
              testingConnection={testCredential.isPending}
            />
          </div>
          <div className="flex justify-end border-t px-6 py-4">
            <Button onClick={onSaveConfig} className="gap-1.5">
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
