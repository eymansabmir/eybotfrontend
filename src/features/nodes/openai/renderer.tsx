import { useReducer, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Bot, Settings2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { useOpenAICredentials, useOpenAIModels, useOpenAIAssistants, useOpenAIPreview, useTestOpenAICredential } from "@/features/integrations/openai/hooks/use-openai-integration";
import { useOpenAIVoiceMutations } from "@/features/integrations/openai/hooks/use-openai-voice";
import { OpenAICredentialsDialog } from "@/features/integrations/openai/presentation/openai-credentials-dialog";
import { OpenAIConfigForm } from "@/features/integrations/openai/presentation/openai-config-form";

import { createOpenAIConfigDraft, openAIConfigReducer } from "@/features/integrations/openai/state/openai-config.state";
import type { OpenAITestConnectionResult } from "@/features/integrations/openai/domain/openai.types";
import type { OpenAINodeData } from "./schema";

function toErrorMessage(error: unknown): string {
  const maybeServerMessage = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;
  if (typeof maybeServerMessage === "string" && maybeServerMessage.trim()) {
    return maybeServerMessage;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Failed to load models for the selected credential.";
}

export function OpenAINodeRenderer({ id, data, selected }: NodeProps & { data: OpenAINodeData }) {
  const { setNodes } = useReactFlow();
  const [configOpen, setConfigOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [lastTestResult, setLastTestResult] = useState<OpenAITestConnectionResult | null>(null);
  const [draft, dispatch] = useReducer(openAIConfigReducer, createOpenAIConfigDraft(data));

  const credentialsQuery = useOpenAICredentials(DEFAULT_ORG_ID);
  
  const modelsQuery = useOpenAIModels(
    DEFAULT_ORG_ID,
    draft.mode !== "voice" ? draft.credentialId : undefined,
    draft.mode === "voice" || draft.mode === "assistant" ? undefined : (draft.mode as any)
  );

  const assistantsQuery = useOpenAIAssistants(
    DEFAULT_ORG_ID,
    draft.mode === "assistant" ? draft.credentialId : undefined
  );

  const voiceQueries = useOpenAIVoiceMutations(
    DEFAULT_ORG_ID,
    draft.mode === "voice" ? draft.credentialId : undefined,
    draft.mode === "voice" ? draft.voiceAction : undefined,
  );
  const testCredential = useTestOpenAICredential(DEFAULT_ORG_ID);
  const previewPrompt = useOpenAIPreview();

  const openConfig = () => {
    dispatch({ type: "reset", payload: createOpenAIConfigDraft(data) });
    setPreviewText("");
    setLastTestResult(null);
    setConfigOpen(true);
  };

  const updateNodeData = (newData: Partial<OpenAINodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    if (!draft.credentialId || !draft.model || !draft.resultVariable) {
      toast.error("Credential, model and result variable are required");
      return;
    }

    if (draft.mode === "chat_completion" && !draft.prompt) {
      toast.error("Prompt is required in chat completion mode");
      return;
    }

    if (draft.mode === "voice" && draft.voiceAction === "create_speech" && (!draft.prompt || !draft.voice)) {
      toast.error("Speech input and voice are required for create speech");
      return;
    }

    if (draft.mode === "voice" && draft.voiceAction === "create_transcription" && !draft.audioUrl.trim()) {
      toast.error("Audio URL is required for create transcription");
      return;
    }

    updateNodeData(draft);
    setConfigOpen(false);
    toast.success("OpenAI node updated");
  };

  const onTestConnection = async () => {
    if (!draft.credentialId) {
      toast.error("Select an OpenAI credential first");
      return;
    }

    try {
      const result = await testCredential.mutateAsync(draft.credentialId);
      setLastTestResult(result);
      if (result.ok) toast.success("Connection successful");
      else toast.error(result.errorMessage ?? "Connection failed");
    } catch {
      toast.error("Connection test failed");
    }
  };

  const onTestPrompt = async () => {
    if (!draft.credentialId || !draft.model || !draft.prompt) {
      toast.error("Credential, model and prompt are required for preview");
      return;
    }
    try {
      const response = await previewPrompt.mutateAsync({
        orgId: DEFAULT_ORG_ID,
        credentialId: draft.credentialId,
        model: draft.model,
        messages: [
          ...(draft.systemPrompt ? [{ role: "system" as const, content: draft.systemPrompt }] : []),
          { role: "user" as const, content: draft.prompt },
        ],
        temperature: draft.temperature,
        maxTokens: draft.maxTokens,
      });
      setPreviewText(response.content);
      toast.success("Preview generated");
    } catch {
      toast.error("Prompt preview failed");
    }
  };


  const modelLoadError = draft.mode === "voice"
    ? (voiceQueries.modelsQuery.error ? toErrorMessage(voiceQueries.modelsQuery.error) : undefined)
    : (modelsQuery.error ? toErrorMessage(modelsQuery.error) : undefined);

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
        className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
      />

      <div 
        className="flex flex-col w-full min-h-16"
        onDoubleClick={openConfig}
      >
        {/* Node Header */}
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-3 py-2">
          <Bot className="size-4 text-primary" />
          <span className="text-xs font-semibold text-foreground tracking-wide">
            {data.mode === "voice" ? "ElevenLabs" : "OpenAI"}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto size-5 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              openConfig();
            }}
          >
            <Settings2 className="size-3 text-muted-foreground" />
          </Button>
        </div>

        {/* Node Body (Mimicking OpenAINodeBody) */}
        <div className="flex flex-col gap-2 p-3">
          <p className="truncate text-sm text-foreground/80">
            {data.mode === "chat_completion" ? "Create chat completion" :
             data.mode === "assistant" ? "Ask Assistant" :
             data.mode === "generate_variables" ? "Generate variables" :
             data.mode === "image" ? "Create image" :
             data.mode === "voice" ? (data.voiceAction === "create_speech" ? "Create speech" : "Create transcription") :
             "Configure..."}
          </p>
          
          {data.resultVariable && (
            <div className="flex w-fit items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 shadow-sm text-xs font-medium text-muted-foreground">
              <Save className="size-3" />
              <span className="truncate max-w-[120px]">{data.resultVariable}</span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
      />

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden p-0">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6">Configure OpenAI node</DialogTitle>
            <DialogDescription className="px-6">
              Select credential, model, and mode-specific options for runtime execution.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <OpenAIConfigForm
              draft={draft}
              credentials={credentialsQuery.data ?? []}
              models={modelsQuery.data ?? []}
              assistants={assistantsQuery.data ?? []}
              voiceModels={voiceQueries.modelsQuery.data ?? []}
              modelsLoading={modelsQuery.isLoading}
              assistantsLoading={assistantsQuery.isLoading}
              voiceModelsLoading={voiceQueries.modelsQuery.isLoading}
              lastTestResult={lastTestResult}
              onDraftChange={(patch) => dispatch({ type: "set", payload: patch })}
              onConnectAccount={() => setCredentialsOpen(true)}
              onTestConnection={onTestConnection}
              onTestPrompt={onTestPrompt}
              testingConnection={testCredential.isPending}
              testingPrompt={previewPrompt.isPending}
              promptPreview={previewText}
              modelLoadError={modelLoadError}
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

      <OpenAICredentialsDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={(credential) => {
          dispatch({
            type: "set",
            payload: { credentialId: credential.id, model: "" },
          });
        }}
      />
    </div>
  );
}
