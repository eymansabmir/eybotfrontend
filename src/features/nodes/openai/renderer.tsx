import { useReducer, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
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
import type { OpenAINodeData } from "./schema";
import { OpenAILogo } from "./logo";

export function OpenAINodeRenderer({ id, data, selected }: NodeProps & { data: OpenAINodeData }) {
  const { setNodes } = useReactFlow();
  const [configOpen, setConfigOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
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
    setConfigOpen(true);
  };

  const updateNodeData = (newData: Partial<OpenAINodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    if (!draft.credentialId || !draft.model || !draft.resultVariable) {
      toast.error("Account, model and result variable are required");
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
      if (result.ok) toast.success("Connection successful");
      else toast.error(result.errorMessage ?? "Connection failed");
    } catch {
      toast.error("Connection test failed");
    }
  };

  const onTestPrompt = async () => {
    if (!draft.credentialId || !draft.model || !draft.prompt) {
      toast.error("Account, model and prompt are required for preview");
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

  const isConfigured = !!data.credentialId && !!data.model;
  
  const getActionLabel = () => {
    if (!isConfigured) return "Configure...";
    switch(data.mode) {
      case "chat_completion": return "Create chat completion";
      case "assistant": return "Ask Assistant";
      case "generate_variables": return "Generate variables";
      case "image": return "Create image";
      case "voice": return data.voiceAction === "create_speech" ? "Create speech" : "Create transcription";
      default: return "OpenAI";
    }
  };

  return (
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
          <div className="mt-0.5 shrink-0 rounded bg-gray-100 p-1 dark:bg-zinc-800">
            <OpenAILogo className="size-3.5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={cn(
              "truncate text-sm font-medium",
              isConfigured ? "text-foreground" : "text-muted-foreground"
            )}>
              {getActionLabel()}
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
        <DialogContent className="flex max-h-[85vh] max-w-sm flex-col overflow-hidden p-0">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="flex items-center gap-2">
               <OpenAILogo className="size-5" />
               OpenAI
            </DialogTitle>
            <DialogDescription>
              Configure the OpenAI parameters.
            </DialogDescription>
          </DialogHeader>
          
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <OpenAIConfigForm
              draft={draft}
              credentials={credentialsQuery.data ?? []}
              models={modelsQuery.data ?? []}
              assistants={assistantsQuery.data ?? []}
              voiceModels={voiceQueries.modelsQuery.data ?? []}
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
              modelLoadError={modelsQuery.error ? "Failed to load models" : undefined}
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

