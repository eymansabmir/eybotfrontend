import { useState, useReducer, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { useOpenAICredentials, useOpenAIModels, useOpenAIAssistants, useOpenAIVoiceModels, useTestOpenAICredential, useTestOpenAIPrompt } from "@/features/integrations/openai/hooks/use-openai-integration";
import { OpenAIConfigForm } from "@/features/integrations/openai/presentation/openai-config-form";
import { createOpenAIConfigDraft, openAIConfigReducer } from "@/features/integrations/openai/state/openai-config.state";
import { hasValidOpenAIChatCompletionInput } from "@/features/integrations/openai/domain/chat-completion-validation";
import { isValidAssistantThreadIdInput } from "@/features/integrations/openai/domain/assistant-thread-id-validation";
import { OpenAICredentialsDialog } from "@/features/integrations/openai/presentation/openai-credentials-dialog";
import { OpenAILogo } from "./logo";
import type { OpenAINodeData } from "./schema";
import { openAINode } from "./index";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function OpenAINodeRenderer({ id, data, selected }: NodeProps & { data: OpenAINodeData }) {
  const { setNodes } = useReactFlow();
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [draft, dispatch] = useReducer(openAIConfigReducer, createOpenAIConfigDraft(data));

  // Sync draft when selected
  useEffect(() => {
    if (selected) {
      dispatch({ type: "reset", payload: createOpenAIConfigDraft(data) });
      setPreviewText("");
    }
  }, [selected, data]);

  const modelActionMode = draft.mode && draft.mode !== "voice" ? draft.mode : undefined;
  const modelsCredentialId = draft.mode && draft.mode !== "voice" ? draft.credentialId : undefined;
  const credentialsQuery = useOpenAICredentials(DEFAULT_ORG_ID);
  const modelsQuery = useOpenAIModels(DEFAULT_ORG_ID, modelsCredentialId, modelActionMode);
  const assistantsQuery = useOpenAIAssistants(DEFAULT_ORG_ID, draft.credentialId);
  const voiceQueries = {
    modelsQuery: useOpenAIVoiceModels(
      DEFAULT_ORG_ID,
      draft.credentialId,
      draft.mode === "voice" ? draft.voiceAction : undefined,
    ),
  };

  const testCredential = useTestOpenAICredential(DEFAULT_ORG_ID);
  const previewPrompt = useTestOpenAIPrompt();

  const updateNodeData = (newData: Partial<OpenAINodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    if (!draft.credentialId) {
      toast.error("Select an OpenAI account");
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

    if (draft.mode !== "assistant" && !draft.model.trim()) {
      toast.error("Select a model");
      return;
    }

    if (draft.mode === "chat_completion") {
      if (!hasValidOpenAIChatCompletionInput(draft)) {
        toast.error("At least one non-empty message is required for chat completion");
        return;
      }
    }

    if (draft.mode === "voice" && draft.voiceAction === "create_speech" && !draft.prompt.trim()) {
      toast.error("Text input is required for speech generation");
      return;
    }

    if (draft.mode === "voice" && draft.voiceAction === "create_transcription" && !draft.audioUrl.trim()) {
      toast.error("Audio URL is required for transcription");
      return;
    }

    if (draft.mode === "assistant" && (!draft.assistantId?.trim() || !draft.prompt.trim())) {
      toast.error("Assistant ID and message are required for assistant mode");
      return;
    }

    if (draft.mode === "assistant" && !isValidAssistantThreadIdInput(draft.threadId)) {
      toast.error("Thread ID must use {{session.key}} or {{contact.key}} when using template syntax");
      return;
    }

    if (draft.mode === "generate_variables" && (!draft.prompt.trim() || !draft.variablesToExtract?.length)) {
      toast.error("Prompt and at least one variable are required for generate variables mode");
      return;
    }

    if (draft.mode === "image" && !draft.prompt.trim()) {
      toast.error("Prompt is required for image generation");
      return;
    }

    const newData: Partial<OpenAINodeData> = {
      ...draft,
      mode: draft.mode,
      resultVariable: draft.resultVariable.trim(),
    };

    updateNodeData(newData);
    toast.success("OpenAI node updated");
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
      const timeoutMs =
        typeof draft.timeoutMs === "number" && Number.isFinite(draft.timeoutMs) && draft.timeoutMs > 0
          ? draft.timeoutMs
          : 20000;

      const result = await previewPrompt.mutateAsync({
        orgId: DEFAULT_ORG_ID,
        credentialId: draft.credentialId,
        model: draft.model,
        prompt: draft.prompt,
        systemPrompt: draft.systemPrompt,
        messages: draft.messages,
        temperature: draft.temperature,
        maxTokens: draft.maxTokens,
        topP: draft.topP,
        frequencyPenalty: draft.frequencyPenalty,
        presencePenalty: draft.presencePenalty,
        timeoutMs,
      });
      setPreviewText(result.content);
    } catch (err) {
      toast.error(toErrorMessage(err));
    }
  };

  return (
    <NodeFrame
        selected={selected}
        icon={<OpenAILogo className="size-4" />}
        title="OpenAI"
        popoverTitle="Configure OpenAI"
        description={openAINode.config.description}
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
                <OpenAIConfigForm
                    draft={draft}
                    credentials={credentialsQuery.data ?? []}
                    models={modelsQuery.data ?? []}
                    assistants={assistantsQuery.data ?? []}
                    voiceModels={(voiceQueries.modelsQuery.data as any) ?? []}
                    modelsLoading={modelsQuery.isLoading}
                    assistantsLoading={assistantsQuery.isLoading}
                    voiceModelsLoading={voiceQueries.modelsQuery.isLoading}
                    onDraftChange={(patch) => dispatch({ type: "set", payload: patch })}
                    onConnectAccount={() => setCredentialsOpen(true)}
                    onTestConnection={onTestConnection}
                    onTestPrompt={onTestPrompt}
                    testingConnection={testCredential.isPending}
                    testingPrompt={previewPrompt.isPending}
                    promptPreview={previewText}
                    modelLoadError={
                        modelsQuery.error || voiceQueries.modelsQuery.error
                            ? toErrorMessage(modelsQuery.error ?? voiceQueries.modelsQuery.error)
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
            <OpenAICredentialsDialog
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
