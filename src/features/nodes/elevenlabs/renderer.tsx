import { useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import { elevenLabsNode } from "./index";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

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
    <NodeFrame
        selected={selected}
        icon={<ElevenLabsLogo className="size-4" />}
        title="ElevenLabs"
        popoverTitle="Configure ElevenLabs"
        description={elevenLabsNode.config.description}
        summary={isConfigured ? "Convert Text to Speech" : "Configure..."}
        showPopover={selected}
        popoverClassName="w-[380px]"
        compactBody={
            isConfigured && data.resultVariable && (
                <div className="text-[10px] text-[var(--ey-yellow)] tracking-wide font-bold mt-1 max-w-full truncate">
                    ➔ @{data.resultVariable}
                </div>
            )
        }
        popoverBody={
            <div className="space-y-4">
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
        }
        popoverFooter={
            <Button 
                onClick={onSaveConfig} 
                size="sm" 
                className="h-8 gap-1.5 font-bold shadow-sm bg-[var(--ey-yellow)] text-black hover:brightness-95 transition-all w-full"
            >
                <Save className="size-3.5" />
                Save Configuration
            </Button>
        }
        extraContent={
            <ElevenLabsCredentialsDialog
                orgId={DEFAULT_ORG_ID}
                open={credentialsOpen}
                onOpenChange={setCredentialsOpen}
                onCreated={(credential) => {
                    setDraft((prev) => ({ ...prev, credentialId: credential.id, modelId: "", voiceId: "" }));
                }}
            />
        }
    />
  );
}
