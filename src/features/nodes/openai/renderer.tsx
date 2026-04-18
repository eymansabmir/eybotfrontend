import { useState, useReducer, useEffect } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
                      <OpenAILogo className="size-4" />
                  </div>
                  <span className="text-sm font-semibold truncate text-foreground leading-none pr-1">OpenAI</span>
              </div>

              <div className="min-w-0 flex flex-col mt-0.5">
                  <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {data.mode ? data.mode.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : "Configure..."}
                        </span>
                    </div>
                  
                  {(data.resultVariable || (data.mode === 'generate_variables' && data.variablesToExtract?.length)) && (
                      <div className="text-[10px] text-[var(--ey-yellow)] tracking-wide font-bold mt-1 max-w-full truncate">
                          ➔ @{data.mode === 'generate_variables' && data.variablesToExtract?.length ? data.variablesToExtract[0].name + (data.variablesToExtract.length > 1 ? ', ...' : '') : data.resultVariable}
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
                      <OpenAILogo className="size-4 text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure OpenAI</span>
                  </div>
              </div>
              
              <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar p-4 text-foreground">
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

      {/* Global Credentials Dialog (renders outside popover correctly via Portal implicitly if Dialog handles it, or just floats) */}
      <OpenAICredentialsDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={(credential) => {
          dispatch({ type: "set", payload: { credentialId: credential.id } });
        }}
      />
    </div>
  );
}
