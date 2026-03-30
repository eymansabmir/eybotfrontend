import { useState, useReducer } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { useOpenAICredentials, useOpenAIModels, useOpenAIAssistants, useOpenAIVoiceModels, useTestOpenAICredential, useTestOpenAIPrompt } from "@/features/integrations/openai/hooks/use-openai-integration";
import { OpenAIConfigForm } from "@/features/integrations/openai/presentation/openai-config-form";
import { createOpenAIConfigDraft, openAIConfigReducer } from "@/features/integrations/openai/state/openai-config.state";
import { hasValidOpenAIChatCompletionInput } from "@/features/integrations/openai/domain/chat-completion-validation";
import { isValidAssistantThreadIdInput } from "@/features/integrations/openai/domain/assistant-thread-id-validation";
import { OpenAICredentialsDialog } from "@/features/integrations/openai/presentation/openai-credentials-dialog";
import { OpenAILogo } from "./logo";
import type { OpenAINodeData } from "./schema";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function OpenAINodeRenderer({ id, data, selected }: NodeProps & { data: OpenAINodeData }) {
  const { setNodes } = useReactFlow();
  const [configOpen, setConfigOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [draft, dispatch] = useReducer(openAIConfigReducer, createOpenAIConfigDraft(data));

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

  const openConfig = () => {
    dispatch({ type: "reset", payload: createOpenAIConfigDraft(data) });
    setPreviewText("");
    setConfigOpen(true);
  };

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
    setConfigOpen(false);
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
    <>
      <div
        onClick={openConfig}
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
            <div className="mt-0.5 shrink-0 rounded bg-zinc-100 p-1 dark:bg-zinc-800/40">
              <OpenAILogo className="size-3.5 text-black dark:text-white" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className={cn(
                "truncate text-sm font-medium",
                data.mode ? "text-foreground" : "text-muted-foreground"
              )}>
                {data.mode ? data.mode.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Configure..."}
              </p>
              {data.model && (
                <p className="truncate text-[10px] text-muted-foreground">
                  {data.model}
                </p>
              )}
            </div>
          </div>

          {(data.resultVariable || (data.mode === 'generate_variables' && data.variablesToExtract?.length)) && (
            <div className="flex flex-wrap items-center gap-1.5 overflow-hidden border-t border-border/40 pt-2">
              <span className="shrink-0 text-[10px] font-medium italic text-muted-foreground text-[8px] tracking-wider">Set</span>
              {data.mode === 'generate_variables' ? (
                data.variablesToExtract?.map((v, i) => (
                  <span key={i} className="truncate rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {v.name}
                  </span>
                ))
              ) : (
                <span className="truncate rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  {data.resultVariable}
                </span>
              )}
            </div>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          className="size-2 border-2 border-background bg-primary !transition-transform group-hover:scale-125"
        />
      </div>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-sm flex-col overflow-hidden p-0 text-foreground" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="px-5 pt-5 text-left">
            <DialogTitle className="flex items-center gap-2 text-base">
               <OpenAILogo className="size-5 text-black dark:text-white" />
               OpenAI
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select credential, model, and mode-specific options.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
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
          <div className="flex justify-end border-t border-border/50 px-5 py-3 bg-muted/20">
            <Button onClick={onSaveConfig} size="sm" className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
               <Save className="size-3.5" />
               Save config
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <OpenAICredentialsDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={(credential) => {
          dispatch({ type: "set", payload: { credentialId: credential.id } });
        }}
      />
    </>
  );
}
