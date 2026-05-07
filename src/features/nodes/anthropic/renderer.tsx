import { useState, useReducer, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DEFAULT_ORG_ID } from "@/features/integrations/anthropic/domain/anthropic.constants";
import { useAnthropicCredentials, useAnthropicModels, useTestAnthropicCredential, useTestAnthropicPrompt } from "@/features/integrations/anthropic/hooks/use-anthropic-integration";
import { AnthropicConfigForm } from "@/features/integrations/anthropic/presentation/anthropic-config-form";
import { createAnthropicConfigDraft, anthropicConfigReducer } from "@/features/integrations/anthropic/state/anthropic-config.state";
import { AnthropicCredentialsDialog } from "@/features/integrations/anthropic/presentation/anthropic-credentials-dialog";
import { AnthropicLogo } from "./logo";
import type { AnthropicNodeData } from "./schema";
import { anthropicNode } from "./index";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function AnthropicNodeRenderer({ id, data, selected }: NodeProps & { data: AnthropicNodeData }) {
  const { setNodes } = useReactFlow();
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [draft, dispatch] = useReducer(anthropicConfigReducer, createAnthropicConfigDraft(data));

  useEffect(() => {
    if (selected) {
      dispatch({ type: "reset", payload: createAnthropicConfigDraft(data) });
      setPreviewText("");
    }
  }, [selected, data]);

  const modelActionMode = draft.mode ? draft.mode : undefined;
  const modelsCredentialId = draft.mode ? draft.credentialId : undefined;
  const credentialsQuery = useAnthropicCredentials(DEFAULT_ORG_ID);
  const modelsQuery = useAnthropicModels(DEFAULT_ORG_ID, modelsCredentialId, modelActionMode);

  const testCredential = useTestAnthropicCredential(DEFAULT_ORG_ID);
  const previewPrompt = useTestAnthropicPrompt();

  const updateNodeData = (newData: Partial<AnthropicNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    if (!draft.credentialId) {
      toast.error("Select an Anthropic account");
      return;
    }

    if (!draft.mode) {
      toast.error("Select a task");
      return;
    }

    if (!draft.resultVariable.trim()) {
      toast.error("Result variable is required");
      return;
    }

    if (!draft.model.trim()) {
      toast.error("Select a model");
      return;
    }

    if (draft.mode === "chat_completion" && (!draft.messages || draft.messages.length === 0)) {
      toast.error("At least one message is required for chat completion");
      return;
    }

    if (draft.mode === "generate_variables" && (!draft.prompt.trim() || !draft.variablesToExtract?.length)) {
      toast.error("Prompt and at least one variable are required for generate variables mode");
      return;
    }

    const newData: Partial<AnthropicNodeData> = {
      ...draft,
      mode: draft.mode,
      resultVariable: draft.resultVariable.trim(),
    };

    updateNodeData(newData);
    toast.success("Anthropic node updated");
  };

  const onTestConnection = async () => {
    if (!draft.credentialId || draft.credentialId === "__none") {
      toast.error("Select an account first");
      return;
    }
    try {
      const result = await testCredential.mutateAsync(draft.credentialId);
      if (result.ok) toast.success("Connection successful");
      else toast.error(result.errorMessage ?? "Connection failed");
    } catch {
      toast.error("Connection test failed");
    }
  };

  const onTestPrompt = async () => {
    try {
      const result = await previewPrompt.mutateAsync({
        orgId: DEFAULT_ORG_ID,
        credentialId: draft.credentialId,
        model: draft.model,
        messages: draft.messages,
        prompt: draft.prompt,
        systemPrompt: draft.systemPrompt,
      });
      setPreviewText(result.content);
    } catch (err) {
      toast.error(toErrorMessage(err));
    }
  };

  return (
    <NodeFrame
        selected={selected}
        icon={<AnthropicLogo className="size-4" />}
        title="Anthropic"
        popoverTitle="Configure Anthropic"
        description={anthropicNode.config.description}
        summary={data.mode ? data.mode.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Configure..."}
        showPopover={selected}
        popoverClassName="w-[380px]"
        compactBody={
            (data.resultVariable || (data.mode === 'generate_variables' && data.variablesToExtract?.length)) && (
                <div className="text-[10px] text-[var(--ey-yellow)] tracking-wide font-bold mt-1 max-w-full truncate">
                    ➔ @{data.mode === 'generate_variables' && data.variablesToExtract?.length ? data.variablesToExtract[0].name + (data.variablesToExtract.length > 1 ? ', ...' : '') : data.resultVariable}
                </div>
            )
        }
        popoverBody={
            <div className="space-y-4">
                <AnthropicConfigForm
                    draft={draft}
                    credentials={credentialsQuery.data ?? []}
                    models={modelsQuery.data ?? []}
                    modelsLoading={modelsQuery.isLoading}
                    onDraftChange={(patch) => dispatch({ type: "set", payload: patch })}
                    onConnectAccount={() => setCredentialsOpen(true)}
                    onTestConnection={onTestConnection}
                    onTestPrompt={onTestPrompt}
                    testingConnection={testCredential.isPending}
                    testingPrompt={previewPrompt.isPending}
                    promptPreview={previewText}
                    modelLoadError={
                        modelsQuery.error
                            ? toErrorMessage(modelsQuery.error)
                            : undefined
                    }
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
            <AnthropicCredentialsDialog
                orgId={DEFAULT_ORG_ID}
                open={credentialsOpen}
                onOpenChange={setCredentialsOpen}
                onCreated={(credential) => {
                    dispatch({ type: "set", payload: { credentialId: credential.id } });
                }}
            />
        }
    />
  );
}
