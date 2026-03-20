import { Plus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type { OpenAICredential, OpenAIModel, OpenAIVoiceModel, OpenAIAssistant } from "../domain/openai.types";
import type { OpenAIConfigDraft } from "../state/openai-config.state";
import { OpenAIModelSelector } from "./openai-model-selector";

interface OpenAIConfigFormProps {
  draft: OpenAIConfigDraft;
  credentials: OpenAICredential[];
  models: OpenAIModel[];
  assistants: OpenAIAssistant[];
  voiceModels: OpenAIVoiceModel[];
  modelsLoading: boolean;
  assistantsLoading: boolean;
  voiceModelsLoading: boolean;
  onDraftChange: (patch: Partial<OpenAIConfigDraft>) => void;
  onConnectAccount: () => void;
  onTestConnection: () => void;
  onTestPrompt: () => void;
  testingConnection: boolean;
  testingPrompt: boolean;
  promptPreview?: string;
  modelLoadError?: string;
}

const TASK_OPTIONS = [
  { value: "chat_completion", label: "Create chat completion" },
  { value: "assistant", label: "Ask Assistant" },
  { value: "generate_variables", label: "Generate variables" },
  { value: "create_speech", label: "Create speech" },
  { value: "create_transcription", label: "Create transcription" },
  { value: "image", label: "Create image" },
];

export function OpenAIConfigForm({
  draft,
  credentials,
  models,
  assistants,
  voiceModels,
  modelsLoading,
  assistantsLoading,
  voiceModelsLoading,
  onDraftChange,
  onConnectAccount,
  modelLoadError,
}: OpenAIConfigFormProps) {
  const openAIModelOptions = draft.mode === "voice"
    ? voiceModels.map((item) => ({ id: item.id, ownedBy: item.ownedBy }))
    : models;
  const openAIModelLoading = draft.mode === "voice" ? voiceModelsLoading : modelsLoading;

  const currentTask = draft.mode === "voice" ? draft.voiceAction : draft.mode;

  const handleTaskChange = (val: string) => {
    if (val === "create_speech" || val === "create_transcription") {
      onDraftChange({ mode: "voice", voiceAction: val, model: "" });
    } else {
      onDraftChange({ mode: val as any, model: "" });
    }
  };

  const isChatCompletion = draft.mode === "chat_completion";
  const isAssistant = draft.mode === "assistant";
  const isGenerateVariables = draft.mode === "generate_variables";
  const isImage = draft.mode === "image";
  const isSpeech = draft.mode === "voice" && draft.voiceAction === "create_speech";
  const isTranscription = draft.mode === "voice" && draft.voiceAction === "create_transcription";

  return (
    <div className="flex flex-col gap-4">
      {/* Account Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</Label>
        <Select value={draft.credentialId} onValueChange={(value) => onDraftChange({ credentialId: value, model: "" })}>
          <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50 h-9">
            <SelectValue placeholder="Connect an account..." />
          </SelectTrigger>
          <SelectContent>
            {credentials.map((credential) => (
              <SelectItem key={credential.id} value={credential.id}>{credential.name}</SelectItem>
            ))}
            <div className="p-1 border-t mt-1">
              <Button variant="ghost" size="sm" className="w-full justify-start text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/5 h-8" onClick={(e) => { e.preventDefault(); onConnectAccount(); }}>
                <Plus className="size-3 mr-2" />
                Add New Account
              </Button>
            </div>
          </SelectContent>
        </Select>
      </div>

      {draft.credentialId && (
        <>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</Label>
            <Select value={currentTask} onValueChange={handleTaskChange}>
              <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50 h-9">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {TASK_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2 border-t">
            {!isAssistant && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Model</Label>
                <OpenAIModelSelector
                  value={draft.model}
                  onValueChange={(value) => onDraftChange({ model: value })}
                  models={openAIModelOptions}
                  isLoading={openAIModelLoading}
                  disabled={!draft.credentialId}
                />
                {modelLoadError && <p className="text-xs text-destructive mt-1">{modelLoadError}</p>}
              </div>
            )}

            {isAssistant && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Assistant</Label>
                  <Select value={draft.assistantId ?? ""} onValueChange={(val) => onDraftChange({ assistantId: val })}>
                    <SelectTrigger className="bg-background h-9">
                      <SelectValue placeholder={assistantsLoading ? "Loading..." : "Select an assistant"} />
                    </SelectTrigger>
                    <SelectContent>
                      {assistants.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name ?? a.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Message</Label>
                  <Textarea value={draft.prompt ?? ""} onChange={(e) => onDraftChange({ prompt: e.target.value })} placeholder="Your message..." rows={3} className="bg-background text-xs resize-none" />
                </div>
              </div>
            )}

            {(isChatCompletion || isGenerateVariables) && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Prompt</Label>
                <Textarea value={draft.prompt} onChange={(e) => onDraftChange({ prompt: e.target.value })} rows={4} className="bg-background text-xs resize-none" placeholder="Enter prompt..." />
              </div>
            )}

            {isSpeech && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Voice</Label>
                  <Select value={draft.voice ?? "alloy"} onValueChange={(value) => onDraftChange({ voice: value })}>
                    <SelectTrigger className="w-full bg-background h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["alloy", "echo", "fable", "onyx", "nova", "shimmer"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Input</Label>
                  <Textarea rows={4} value={draft.prompt} onChange={(e) => onDraftChange({ prompt: e.target.value })} className="bg-background text-xs resize-none" placeholder="Text to speech..." />
                </div>
              </>
            )}

            {isTranscription && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Audio URL</Label>
                <Input value={draft.audioUrl} onChange={(e) => onDraftChange({ audioUrl: e.target.value })} placeholder="{{audio_url}}" className="bg-background h-9 text-xs" />
              </div>
            )}

            {isImage && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Prompt</Label>
                <Textarea rows={3} value={draft.prompt} onChange={(e) => onDraftChange({ prompt: e.target.value })} className="bg-background text-xs resize-none" placeholder="Image description..." />
              </div>
            )}

            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs font-medium text-muted-foreground">Save audio in variable</Label>
              <Input value={draft.resultVariable} onChange={(e) => onDraftChange({ resultVariable: e.target.value })} placeholder="openai_response" className="bg-background h-8 text-xs" />
            </div>

            {/* Advanced Settings with Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="options" className="border-none">
                <AccordionTrigger className="px-0 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline">Options</AccordionTrigger>
                <AccordionContent className="px-0 space-y-4">
                  {(isChatCompletion || isAssistant) && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">System Prompt</Label>
                      <Textarea rows={3} value={draft.systemPrompt} onChange={(e) => onDraftChange({ systemPrompt: e.target.value })} placeholder="You are a helpful assistant." className="text-xs" />
                    </div>
                  )}
                  {isChatCompletion && (
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="send-to-user" className="text-xs cursor-pointer">Automatically send to user</Label>
                      <Switch id="send-to-user" checked={draft.sendResponseToUser} onCheckedChange={(c) => onDraftChange({ sendResponseToUser: c })} />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
}

