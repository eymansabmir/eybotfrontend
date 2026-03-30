import { useEffect, useMemo } from "react";
import { Plus, MessageSquare, Trash2, Wrench } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { OpenAICredential, OpenAIModel, OpenAIVoiceModel, OpenAIAssistant } from "../domain/openai.types";
import { isReliableTextModel, usesMaxCompletionTokensParam } from "../domain/openai-model-capabilities";
import { hasValidOpenAIChatCompletionInput } from "../domain/chat-completion-validation";
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

const SECTION_LABEL_CLASS = "text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1";
type ChatMessage = NonNullable<OpenAIConfigDraft["messages"]>[number];
type ChatRole = ChatMessage["role"];
type VariableType = Exclude<NonNullable<NonNullable<OpenAIConfigDraft["variablesToExtract"]>[number]["type"]>, undefined>;

const TASK_OPTIONS = [
  { value: "chat_completion", label: "Create chat completion" },
  { value: "assistant", label: "Ask Assistant" },
  { value: "generate_variables", label: "Generate variables" },
  { value: "create_speech", label: "Create speech" },
  { value: "create_transcription", label: "Create transcription" },
  { value: "image", label: "Create image" },
];


const MESSAGE_ROLES: Array<{ value: ChatRole; label: string }> = [
  { value: "system", label: "System" },
  { value: "user", label: "User" },
  { value: "assistant", label: "Assistant" },
  { value: "dialogue", label: "Dialogue (Variable)" },
];

interface MessageCardProps {
  message: ChatMessage;
  onUpdate: (patch: Partial<ChatMessage>) => void;
  onRemove: () => void;
}

function MessageCard({ message, onUpdate, onRemove }: MessageCardProps) {
  return (
    <div className="group relative flex flex-col gap-2 rounded-xl border bg-muted/20 p-3 transition-colors hover:bg-muted/30 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={message.role}
            onValueChange={(val) => onUpdate({ role: val as ChatRole })}
          >
            <SelectTrigger className="h-7 w-32.5 bg-background text-[10px] font-bold uppercase tracking-wider border-none shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESSAGE_ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value} className="text-[10px] uppercase tracking-wider font-semibold">
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
          onClick={onRemove}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
      <Textarea
        value={message.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder={message.role === "dialogue" ? "{{session.dialogue_history}}" : "Message content..."}
        rows={message.role === "dialogue" ? 1 : 2}
        className="min-h-0 bg-background/50 text-sm resize-none py-2 border-dashed focus-visible:ring-1 focus-visible:ring-primary/30"
      />
    </div>
  );
}

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
  onTestConnection,
  onTestPrompt,
  testingConnection,
  testingPrompt,
  promptPreview,
  modelLoadError,
}: OpenAIConfigFormProps) {
  const openAIModelOptions = useMemo(() => {
    if (!draft.mode) {
      return [];
    }

    const isSpeech = draft.mode === "voice" && draft.voiceAction === "create_speech";
    const isTranscription = draft.mode === "voice" && draft.voiceAction === "create_transcription";

    if (isSpeech) {
      return voiceModels
        .filter((item) => item.mode === "create_speech")
        .map((item) => ({ id: item.id, ownedBy: item.ownedBy }));
    }
    
    if (isTranscription) {
      const transcriptionModels = voiceModels
        .filter((item) => item.mode === "create_transcription")
        .map((item) => ({ id: item.id, ownedBy: item.ownedBy }));

      const whisperOnly = transcriptionModels.filter((m) => m.id.toLowerCase().includes("whisper"));
      return whisperOnly.length > 0 ? whisperOnly : transcriptionModels;
    }

    if (draft.mode === "image") {
      return models.filter((m) => {
        const id = m.id.toLowerCase();
        return id.includes("dall-e") || id.includes("gpt-image");
      });
    }

    // chat_completion, assistant, generate_variables
    return models.filter((m) => isReliableTextModel(m.id));
  }, [draft.mode, draft.voiceAction, models, voiceModels]);

  const openAIModelLoading = draft.mode === "voice" ? voiceModelsLoading : modelsLoading;

  const currentTask = draft.mode === "voice" ? draft.voiceAction : draft.mode || undefined;

  const handleTaskChange = (val: string) => {
    if (val === "create_speech") {
      onDraftChange({ mode: "voice", voiceAction: "create_speech", model: "", sendResponseToUser: true });
    } else if (val === "create_transcription") {
      onDraftChange({ mode: "voice", voiceAction: "create_transcription", model: "whisper-1" });
    } else if (val === "image") {
      onDraftChange({ mode: "image", model: "", imageSize: "1024x1024" });
    } else if (val === "chat_completion") {
      onDraftChange({ mode: "chat_completion", model: "" });
    } else if (val === "assistant" || val === "generate_variables") {
      onDraftChange({ mode: val, model: "" });
    } else {
      onDraftChange({ mode: "chat_completion", model: "" });
    }
  };

  const isChatCompletion = draft.mode === "chat_completion";
  const isAssistant = draft.mode === "assistant";
  const isGenerateVariables = draft.mode === "generate_variables";
  const isImage = draft.mode === "image";
  const isSpeech = draft.mode === "voice" && draft.voiceAction === "create_speech";
  const isTranscription = draft.mode === "voice" && draft.voiceAction === "create_transcription";
  const usesCompletionTokens = usesMaxCompletionTokensParam(draft.model);

  useEffect(() => {
    if (isTranscription && draft.model !== "whisper-1") {
      onDraftChange({ model: "whisper-1" });
    }
  }, [isTranscription, draft.model, onDraftChange]);

  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* Account Selection */}
      <div className="space-y-2">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Account</Label>
        {credentials.length > 0 ? (
          <div className="flex gap-2">
            <Select value={draft.credentialId || "__none"} onValueChange={(value) => onDraftChange({ credentialId: value === "__none" ? "" : value, model: "" })}>
              <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50 h-9 text-sm">
                <SelectValue placeholder="Select OpenAI account" />
              </SelectTrigger>
              <SelectContent>
                {credentials.map((credential) => (
                  <SelectItem key={credential.id} value={credential.id}>{credential.name}</SelectItem>
                ))}
                <div className="p-1 border-t mt-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/5 h-8" onClick={(e) => { e.preventDefault(); onConnectAccount(); }}>
                    <Plus className="size-3 mr-2" />
                    Connect new
                  </Button>
                </div>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 whitespace-nowrap"
              disabled={!draft.credentialId || draft.credentialId === "__none" || testingConnection}
              onClick={onTestConnection}
            >
              {testingConnection ? "Testing..." : "Test"}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-9 gap-2 text-xs border-dashed"
            onClick={(e) => { e.preventDefault(); onConnectAccount(); }}
          >
            <Plus className="size-3" />
            Connect new account
          </Button>
        )}
      </div>

      {draft.credentialId && (
        <>
          <div className="space-y-1.5">
            <Label className={SECTION_LABEL_CLASS}>Task</Label>
            <Select value={currentTask} onValueChange={handleTaskChange}>
              <SelectTrigger className="w-full bg-background h-9 text-sm">
                <SelectValue placeholder="Select task" />
              </SelectTrigger>
              <SelectContent>
                {TASK_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {draft.mode && !isAssistant && !isTranscription && (
            <div className="space-y-1.5">
              {!(isChatCompletion || isGenerateVariables || isImage || isSpeech) && (
                <Label className={SECTION_LABEL_CLASS}>Model</Label>
              )}
              <OpenAIModelSelector
                value={draft.model}
                onValueChange={(value) => {
                  const isOldDallE3 = draft.model.toLowerCase().includes("dall-e-3");
                  const isNewDallE3 = value.toLowerCase().includes("dall-e-3");
                  const patch: Partial<OpenAIConfigDraft> = { model: value };
                  
                  if (draft.mode === "image" && isOldDallE3 !== isNewDallE3) {
                    patch.imageSize = isNewDallE3 ? "1024x1024" : "512x512";
                    patch.imageQuality = isNewDallE3 ? "standard" : undefined;
                  }
                  onDraftChange(patch);
                }}
                models={openAIModelOptions}
                isLoading={openAIModelLoading}
                disabled={!draft.credentialId}
              />
              {modelLoadError && <p className="text-[10px] text-destructive mt-1">{modelLoadError}</p>}
            </div>
          )}

          {isAssistant && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Assistant ID</Label>
                <Select value={draft.assistantId ?? ""} onValueChange={(val) => onDraftChange({ assistantId: val })}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={assistantsLoading ? "Loading..." : "Select an assistant"} />
                  </SelectTrigger>
                  <SelectContent>
                    {assistants.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name ?? a.id} ({a.model})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Thread ID (Variable)</Label>
                <Input value={draft.threadId ?? ""} onChange={(e) => onDraftChange({ threadId: e.target.value })} placeholder="{{session.thread_id}}" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Message</Label>
                <Textarea value={draft.prompt ?? ""} onChange={(e) => onDraftChange({ prompt: e.target.value })} placeholder="Your message..." rows={3} className="bg-background" />
              </div>
            </div>
          )}

          
          {isChatCompletion && (
            <div className="space-y-3">
              <Label className={SECTION_LABEL_CLASS}>Messages</Label>
              <div className="flex flex-col gap-3">
                {(draft.messages ?? []).map((msg, i) => (
                  <MessageCard
                    key={i}
                    message={msg}
                    onUpdate={(patch) => {
                      const newMsgs = [...(draft.messages ?? [])];
                      newMsgs[i] = { ...newMsgs[i], ...patch };
                      onDraftChange({ messages: newMsgs });
                    }}
                    onRemove={() => {
                      const newMsgs = (draft.messages ?? []).filter((_, idx) => idx !== i);
                      onDraftChange({ messages: newMsgs });
                    }}
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed h-10 gap-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all shadow-sm"
                  onClick={() => onDraftChange({ messages: [...(draft.messages ?? []), { role: "user", content: "" }] })}
                >
                  <Plus className="size-3" />
                  Add Message
                </Button>
              </div>
            </div>
          )}

          {isChatCompletion && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="tools" className="border rounded-xl bg-background overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:no-underline flex gap-2 justify-start hover:bg-muted/10 transition-colors">
                  <Wrench className="size-3.5" />
                  Tools / Functions
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  {(draft.tools ?? []).map((tool, i) => (
                    <div key={i} className="space-y-3 p-4 border rounded-xl relative bg-muted/10 border-dashed">
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive transition-colors" onClick={() => onDraftChange({ tools: draft.tools!.filter((_, idx) => idx !== i) })}>
                        <Trash2 className="size-3.5" />
                      </Button>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Function Name</Label>
                        <Input placeholder="e.g. get_weather" className="h-9 bg-background shadow-none" value={tool.function.name} onChange={(e) => {
                          const newTools = [...draft.tools!];
                          newTools[i] = { ...newTools[i], function: { ...newTools[i].function, name: e.target.value } };
                          onDraftChange({ tools: newTools });
                        }} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Parameters (JSON)</Label>
                        <Textarea placeholder='{ "type": "object", "properties": { ... } }' value={typeof tool.function.parameters === 'string' ? tool.function.parameters : JSON.stringify(tool.function.parameters ?? {}, null, 2)} onChange={(e) => {
                          const newTools = [...draft.tools!];
                          newTools[i] = { ...newTools[i], function: { ...newTools[i].function, parameters: e.target.value } };
                          onDraftChange({ tools: newTools });
                        }} className="font-mono text-xs bg-background/50 shadow-none border-dashed" rows={4} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full h-9 border-dashed text-xs gap-2" onClick={() => onDraftChange({ tools: [...(draft.tools ?? []), { type: "function", function: { name: "", parameters: "" } }] })}>
                    <Plus className="size-3" />
                    Add New Tool
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {isGenerateVariables && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Message Template</Label>
              <Textarea value={draft.prompt} onChange={(e) => onDraftChange({ prompt: e.target.value })} rows={4} className="bg-background" />
            </div>
          )}


          {isGenerateVariables && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="variables" className="border rounded-lg bg-background">
                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Variables to extract</AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  {(draft.variablesToExtract ?? []).map((v, i) => (
                    <div key={i} className="space-y-2 p-3 border rounded-md relative bg-muted/20">
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onDraftChange({ variablesToExtract: draft.variablesToExtract!.filter((_, idx) => idx !== i) })}>
                        <Trash2 className="size-3" />
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Name (e.g. email)" value={v.name} onChange={(e) => { const newVars = [...draft.variablesToExtract!]; newVars[i].name = e.target.value; onDraftChange({ variablesToExtract: newVars }); }} />
                        <Select value={v.type ?? "string"} onValueChange={(val) => { const newVars = [...draft.variablesToExtract!]; newVars[i].type = val as VariableType; onDraftChange({ variablesToExtract: newVars }); }}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="boolean">Boolean</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input placeholder="Description" value={v.description ?? ""} onChange={(e) => { const newVars = [...draft.variablesToExtract!]; newVars[i].description = e.target.value; onDraftChange({ variablesToExtract: newVars }); }} />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => onDraftChange({ variablesToExtract: [...(draft.variablesToExtract ?? []), { name: "", type: "string" }] })}>+ Add variable</Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {isVoiceSettings(isSpeech, isTranscription, draft, onDraftChange)}
          {isImageSettings(isImage, draft, onDraftChange)}

          {/* Assistant Functions Accordion */}
          {isAssistant && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="functions" className="border rounded-lg bg-background">
                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Functions</AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  {(draft.functions ?? []).map((f, i) => (
                    <div key={i} className="space-y-2 p-3 border rounded-md relative bg-muted/20">
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onDraftChange({ functions: draft.functions!.filter((_, idx) => idx !== i) })}>
                        <Trash2 className="size-3" />
                      </Button>
                      <Input placeholder="Function Name" value={f.name} onChange={(e) => { const newFuncs = [...draft.functions!]; newFuncs[i].name = e.target.value; onDraftChange({ functions: newFuncs }); }} />
                      <Textarea placeholder="return { result: true };" value={f.code} onChange={(e) => { const newFuncs = [...draft.functions!]; newFuncs[i].code = e.target.value; onDraftChange({ functions: newFuncs }); }} className="font-mono text-xs" rows={3} />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => onDraftChange({ functions: [...(draft.functions ?? []), { name: "", code: "return {};" }] })}>+ Add function</Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Advanced Settings */}
          {(isChatCompletion || isAssistant) && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced" className="border rounded-lg bg-background">
                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Advanced settings</AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  {isChatCompletion && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Temperature</Label>
                          <Input type="number" min={0} max={2} step={0.1} value={draft.temperature ?? ""} onChange={(e) => onDraftChange({ temperature: e.target.value ? Number(e.target.value) : undefined })} placeholder="1" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            {usesCompletionTokens ? "Max Completion Tokens" : "Max Tokens"}
                          </Label>
                          <Input type="number" min={1} value={draft.maxTokens ?? ""} onChange={(e) => onDraftChange({ maxTokens: e.target.value ? Number(e.target.value) : undefined })} placeholder="Unlimited" />
                        </div>
                      </div>

                    </>
                  )}
                  {isAssistant && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Additional Instructions</Label>
                      <Textarea rows={3} value={draft.additionalInstructions ?? ""} onChange={(e) => onDraftChange({ additionalInstructions: e.target.value })} />
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Save Response */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="save" className="border rounded-lg bg-background">
              <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Save response</AccordionTrigger>
              <AccordionContent className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Result Variable</Label>
                    <Input value={draft.resultVariable} onChange={(e) => onDraftChange({ resultVariable: e.target.value })} placeholder="openai_response" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Scope</Label>
                    <Select value={draft.resultScope} onValueChange={(value: "session" | "contact") => onDraftChange({ resultScope: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="session">Session</SelectItem>
                        <SelectItem value="contact">Contact</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(isChatCompletion || isSpeech || isTranscription || isAssistant || isImage) && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="send-to-user" className="text-xs cursor-pointer">Send response to user automatically</Label>
                    <Switch id="send-to-user" checked={draft.sendResponseToUser} onCheckedChange={(c) => onDraftChange({ sendResponseToUser: c })} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Fallback Text (Optional)</Label>
                  <Input value={draft.fallbackText} onChange={(e) => onDraftChange({ fallbackText: e.target.value })} placeholder="Action failed." />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Preview Button */}
          {isChatCompletion && (
            <div className="mt-2 flex flex-col gap-3">
              <Button variant="outline" size="sm" onClick={onTestPrompt} disabled={!draft.credentialId || !draft.model || !hasValidOpenAIChatCompletionInput(draft) || testingPrompt} className="self-start gap-1.5 h-8">
                <MessageSquare className="size-3.5" />
                {testingPrompt ? "Evaluating..." : "Preview Response"}
              </Button>
              {promptPreview && (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="whitespace-pre-wrap text-sm">{promptPreview}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function isVoiceSettings(
  isSpeech: boolean,
  isTranscription: boolean,
  draft: OpenAIConfigDraft,
  onDraftChange: (patch: Partial<OpenAIConfigDraft>) => void,
) {
  if (isSpeech) {
    return (
      <>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Voice</Label>
          <Select value={draft.voice ?? "alloy"} onValueChange={(value) => onDraftChange({ voice: value })}>
            <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["alloy", "echo", "fable", "onyx", "nova", "shimmer"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Text to Convert</Label>
          <Textarea rows={4} value={draft.prompt} onChange={(e) => onDraftChange({ prompt: e.target.value })} />
        </div>
      </>
    );
  }
  if (isTranscription) {
    return (
      <>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Audio URL</Label>
          <Input value={draft.audioUrl} onChange={(e) => onDraftChange({ audioUrl: e.target.value })} placeholder="{{session.audio_url}}" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Transcription Prompt (Optional)</Label>
          <Textarea rows={3} value={draft.systemPrompt} onChange={(e) => onDraftChange({ systemPrompt: e.target.value })} />
        </div>
      </>
    );
  }
  return null;
}

function isImageSettings(
  isImage: boolean,
  draft: OpenAIConfigDraft,
  onDraftChange: (patch: Partial<OpenAIConfigDraft>) => void,
) {
  if (!isImage) return null;

  const isDallE3 = draft.model.toLowerCase().includes("dall-e-3");
  
  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Prompt</Label>
        <Textarea rows={3} value={draft.prompt} onChange={(e) => onDraftChange({ prompt: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Size</Label>
          <Select 
            value={draft.imageSize ?? (isDallE3 ? "1024x1024" : "512x512")} 
            onValueChange={(val) => onDraftChange({ imageSize: val })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {isDallE3 ? (
                <>
                  <SelectItem value="1024x1024">1024x1024</SelectItem>
                  <SelectItem value="1024x1792">1024x1792</SelectItem>
                  <SelectItem value="1792x1024">1792x1024</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="256x256">256x256</SelectItem>
                  <SelectItem value="512x512">512x512</SelectItem>
                  <SelectItem value="1024x1024">1024x1024</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Quality</Label>
          <Select 
            value={draft.imageQuality ?? "standard"} 
            onValueChange={(val) => onDraftChange({ imageQuality: val })}
            disabled={!isDallE3}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              {isDallE3 && <SelectItem value="hd">HD</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
