import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AnthropicCredential, AnthropicModel } from "../domain/anthropic.types";
import type { AnthropicConfigDraft } from "../state/anthropic-config.state";
import { AnthropicModelSelector } from "./anthropic-model-selector";
import { VariableSelect } from "@/features/variables/components/variable-select";

interface AnthropicConfigFormProps {
  draft: AnthropicConfigDraft;
  credentials: AnthropicCredential[];
  models: AnthropicModel[];
  modelsLoading: boolean;
  onDraftChange: (patch: Partial<AnthropicConfigDraft>) => void;
  onConnectAccount: () => void;
  onTestConnection: () => void;
  onTestPrompt: () => void;
  testingConnection: boolean;
  testingPrompt: boolean;
  promptPreview?: string;
  modelLoadError?: string;
}

const SECTION_LABEL_CLASS = "text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1";
const TASK_OPTIONS = [
  { value: "chat_completion", label: "Create chat completion" },
  { value: "generate_variables", label: "Generate variables" },
];

export function AnthropicConfigForm({
  draft,
  credentials,
  models,
  modelsLoading,
  onDraftChange,
  onConnectAccount,
  onTestConnection,
  onTestPrompt,
  testingConnection,
  testingPrompt,
  promptPreview,
  modelLoadError,
}: AnthropicConfigFormProps) {
  const currentTask = draft.mode || undefined;

  const handleTaskChange = (val: string) => {
    onDraftChange({ mode: val as any, model: "" });
  };

  const isChatCompletion = draft.mode === "chat_completion";
  const isGenerateVariables = draft.mode === "generate_variables";

  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* Account Selection */}
      <div className="space-y-2">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Account</Label>
        {credentials.length > 0 ? (
          <div className="flex gap-2">
            <Select value={draft.credentialId || "__none"} onValueChange={(value) => onDraftChange({ credentialId: value === "__none" ? "" : value, model: "" })}>
              <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50 h-9 text-sm">
                <SelectValue placeholder="Select Anthropic account" />
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

          {draft.mode && (
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>Model</Label>
              <AnthropicModelSelector
                value={draft.model}
                onValueChange={(value) => onDraftChange({ model: value })}
                models={models}
                isLoading={modelsLoading}
                disabled={!draft.credentialId}
              />
              {modelLoadError && <p className="text-[10px] text-destructive mt-1">{modelLoadError}</p>}
            </div>
          )}

          {isGenerateVariables && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Prompt</Label>
              <Textarea value={draft.prompt} onChange={(e) => onDraftChange({ prompt: e.target.value })} rows={4} className="bg-background" />
            </div>
          )}

          {isChatCompletion && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="messages" className="border rounded-lg bg-background">
                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Messages</AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  {(draft.messages ?? []).map((m, i) => (
                    <div key={i} className="space-y-2 p-3 border rounded-md relative bg-muted/20">
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive z-10" onClick={() => onDraftChange({ messages: draft.messages!.filter((_, idx) => idx !== i) })}>
                        <Trash2 className="size-3" />
                      </Button>
                      <Select value={m.role} onValueChange={(val) => { const newMsgs = [...draft.messages!]; newMsgs[i].role = val; onDraftChange({ messages: newMsgs }); }}>
                        <SelectTrigger className="w-32 h-8 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="assistant">Assistant</SelectItem>
                          <SelectItem value="dialogue">Dialogue</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {m.role === "dialogue" ? (
                        <div className="space-y-2 pt-1">
                          <Input placeholder="Dialogue variable (e.g. {{session.history}})" value={m.dialogueVariableId ?? ""} onChange={(e) => { const newMsgs = [...draft.messages!]; newMsgs[i].dialogueVariableId = e.target.value; onDraftChange({ messages: newMsgs }); }} />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Starts by</span>
                            <Select value={m.startsBy ?? "user"} onValueChange={(val: any) => { const newMsgs = [...draft.messages!]; newMsgs[i].startsBy = val; onDraftChange({ messages: newMsgs }); }}>
                              <SelectTrigger className="h-8 bg-background"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="assistant">Assistant</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ) : (
                        <Textarea placeholder="Content" value={m.content ?? ""} onChange={(e) => { const newMsgs = [...draft.messages!]; newMsgs[i].content = e.target.value; onDraftChange({ messages: newMsgs }); }} rows={2} className="bg-background text-sm mt-1" />
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => onDraftChange({ messages: [...(draft.messages ?? []), { role: "user", content: "" }] })}>+ Add Message</Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                        <Select value={v.type ?? "string"} onValueChange={(val: any) => { const newVars = [...draft.variablesToExtract!]; newVars[i].type = val; onDraftChange({ variablesToExtract: newVars }); }}>
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

          {/* Advanced Settings */}
          {isChatCompletion && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced" className="border rounded-lg bg-background">
                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Advanced settings</AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Temperature</Label>
                      <Input type="number" min={0} max={1} step={0.1} value={draft.temperature ?? ""} onChange={(e) => onDraftChange({ temperature: e.target.value ? Number(e.target.value) : undefined })} placeholder="1" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Max Tokens</Label>
                      <Input type="number" min={1} value={draft.maxTokens ?? ""} onChange={(e) => onDraftChange({ maxTokens: e.target.value ? Number(e.target.value) : undefined })} placeholder="1024" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">System Prompt</Label>
                    <Textarea rows={3} value={draft.systemPrompt} onChange={(e) => onDraftChange({ systemPrompt: e.target.value })} placeholder="You are a helpful assistant." />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Save Response */}
          {isChatCompletion && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="save" className="border rounded-lg bg-background">
                <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Save response</AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Result Variable</Label>
                      <VariableSelect 
                        value={draft.resultVariable} 
                        onValueChange={(val: string) => onDraftChange({ resultVariable: val })} 
                        placeholder="anthropic_response" 
                      />
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

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="send-to-user" className="text-xs cursor-pointer">Send response to user automatically</Label>
                    <Switch id="send-to-user" checked={draft.sendResponseToUser} onCheckedChange={(c) => onDraftChange({ sendResponseToUser: c })} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Fallback Text (Optional)</Label>
                    <Input value={draft.fallbackText} onChange={(e) => onDraftChange({ fallbackText: e.target.value })} placeholder="Action failed." />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Preview Button */}
          {isChatCompletion && (
            <div className="mt-2 flex flex-col gap-3">
              <Button variant="outline" size="sm" onClick={onTestPrompt} disabled={!draft.credentialId || !draft.model || (!draft.messages || draft.messages.length === 0) || testingPrompt} className="self-start gap-1.5 h-8">
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
