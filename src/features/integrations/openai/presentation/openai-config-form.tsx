import { Plus, TestTube2, MessageSquare, Volume2, Mic, Settings } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { OpenAICredential, OpenAIModel, OpenAITestConnectionResult, OpenAIVoiceModel } from "../domain/openai.types";
import type { OpenAIConfigDraft } from "../state/openai-config.state";
import { OpenAIModelSelector } from "./openai-model-selector";
import { OpenAIStatusPanel } from "./openai-status-panel";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

function ActionCard({ title, description, icon, isSelected, onClick }: ActionCardProps) {
  return (
    <div
      role="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all hover:bg-accent cursor-pointer",
        isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card"
      )}
    >
      <div
        className={cn(
          "rounded-lg p-2.5",
          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

interface OpenAIConfigFormProps {
  draft: OpenAIConfigDraft;
  credentials: OpenAICredential[];
  models: OpenAIModel[];
  voiceModels: OpenAIVoiceModel[];
  modelsLoading: boolean;
  voiceModelsLoading: boolean;
  lastTestResult?: OpenAITestConnectionResult | null;
  onDraftChange: (patch: Partial<OpenAIConfigDraft>) => void;
  onConnectAccount: () => void;
  onTestConnection: () => void;
  onTestPrompt: () => void;
  testingConnection: boolean;
  testingPrompt: boolean;
  promptPreview?: string;
  modelLoadError?: string;
}

export function OpenAIConfigForm({
  draft,
  credentials,
  models,
  voiceModels,
  modelsLoading,
  voiceModelsLoading,
  lastTestResult,
  onDraftChange,
  onConnectAccount,
  onTestConnection,
  onTestPrompt,
  testingConnection,
  testingPrompt,
  promptPreview,
  modelLoadError,
}: OpenAIConfigFormProps) {
  const selectedCredential = credentials.find((item) => item.id === draft.credentialId);

  const openAIModelOptions = draft.mode === "voice"
    ? voiceModels.map((item) => ({ id: item.id, ownedBy: item.ownedBy }))
    : models;
  const openAIModelLoading = draft.mode === "voice" ? voiceModelsLoading : modelsLoading;

  const isAgent = draft.mode === "agent";
  const isSpeech = draft.mode === "voice" && draft.voiceAction === "create_speech";
  const isTranscription = draft.mode === "voice" && draft.voiceAction === "create_transcription";

  const onSelectAction = (action: "agent" | "create_speech" | "create_transcription") => {
    if (action === "agent") {
      onDraftChange({ mode: "agent", model: "" });
    } else {
      onDraftChange({ mode: "voice", voiceAction: action, model: "" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Account Connection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">1. Account Details</Label>
            <p className="text-xs text-muted-foreground">Select or connect your OpenAI account</p>
          </div>
          {!draft.credentialId && (
            <Button variant="outline" size="sm" onClick={onConnectAccount} className="h-8 gap-1.5">
              <Plus className="size-3.5" />
              Add Account
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <Select
            value={draft.credentialId}
            onValueChange={(value) => onDraftChange({ credentialId: value, model: "" })}
          >
            <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50">
              <SelectValue placeholder="Select OpenAI Account" />
            </SelectTrigger>
            <SelectContent>
              {credentials.map((credential) => (
                <SelectItem key={credential.id} value={credential.id}>
                  {credential.name}
                </SelectItem>
              ))}
              <div className="p-2 border-t mt-1">
                <Button 
                   variant="ghost" 
                   size="sm" 
                   className="w-full justify-start text-xs font-medium text-primary hover:text-primary hover:bg-primary/5" 
                   onClick={(e) => {
                     e.preventDefault();
                     onConnectAccount();
                   }}
                >
                  <Plus className="size-3 mr-2" />
                  Add New Account
                </Button>
              </div>
            </SelectContent>
          </Select>

          {draft.credentialId && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <OpenAIStatusPanel credential={selectedCredential} lastTestResult={lastTestResult} />
              <Button
                variant="secondary"
                size="sm"
                onClick={onTestConnection}
                disabled={testingConnection}
                className="gap-1.5 ml-auto"
              >
                <TestTube2 className="size-3.5" />
                {testingConnection ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Action Selection */}
      {draft.credentialId && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-base font-semibold">2. Choose Action</Label>
              <p className="text-xs text-muted-foreground">What do you want OpenAI to do?</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ActionCard
                title="Chat Completion"
                description="Generate intelligent responses from prompt"
                icon={<MessageSquare className="size-5" />}
                isSelected={isAgent}
                onClick={() => onSelectAction("agent")}
              />
              <ActionCard
                title="Text to Speech"
                description="Convert text into lifelike spoken audio"
                icon={<Volume2 className="size-5" />}
                isSelected={isSpeech}
                onClick={() => onSelectAction("create_speech")}
              />
              <ActionCard
                title="Transcription"
                description="Transcribe audio into text"
                icon={<Mic className="size-5" />}
                isSelected={isTranscription}
                onClick={() => onSelectAction("create_transcription")}
              />
            </div>
          </div>

          {/* Step 3: Configuration */}
          {(isAgent || isSpeech || isTranscription) && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">3. Configuration</Label>
                  <p className="text-xs text-muted-foreground">Configure your selected action parameters</p>
                </div>

                <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model</Label>
                    <OpenAIModelSelector
                      value={draft.model}
                      onValueChange={(value) => onDraftChange({ model: value })}
                      models={openAIModelOptions}
                      isLoading={openAIModelLoading}
                      disabled={!draft.credentialId}
                    />
                    {modelLoadError && <p className="text-xs text-destructive mt-1">{modelLoadError}</p>}
                  </div>

                  {isSpeech && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voice</Label>
                      <Select value={draft.voice ?? "alloy"} onValueChange={(value) => onDraftChange({ voice: value })}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select voice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alloy">alloy (Neutral)</SelectItem>
                          <SelectItem value="ash">ash (Gentle)</SelectItem>
                          <SelectItem value="ballad">ballad (Expressive)</SelectItem>
                          <SelectItem value="coral">coral (Clear)</SelectItem>
                          <SelectItem value="sage">sage (Warm)</SelectItem>
                          <SelectItem value="verse">verse (Dynamic)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {!isTranscription && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {isAgent ? "Prompt Template" : "Text to Convert"}
                      </Label>
                      <Textarea
                        rows={isAgent ? 5 : 4}
                        value={draft.prompt}
                        onChange={(e) => onDraftChange({ prompt: e.target.value })}
                        placeholder={
                          isAgent
                            ? "Summarize this: {{session.last_user_message}}"
                            : "Convert this text to speech"
                        }
                        className="resize-y bg-background"
                      />
                    </div>
                  )}

                  {isTranscription && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audio URL</Label>
                        <Input
                          value={draft.audioUrl}
                          onChange={(e) => onDraftChange({ audioUrl: e.target.value })}
                          placeholder="{{session.audio_url}} or https://storage.googleapis.com/bucket/file.mp3"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transcription Prompt (Optional)</Label>
                        <Textarea
                          rows={3}
                          value={draft.systemPrompt}
                          onChange={(e) => onDraftChange({ systemPrompt: e.target.value })}
                          placeholder="Focus on specific vocabulary or punctuation rules..."
                          className="resize-y bg-background"
                        />
                      </div>
                    </>
                  )}

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="advanced" className="border rounded-lg overflow-hidden shrink-0 shadow-sm bg-muted/20">
                      <AccordionTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm hover:no-underline hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 font-semibold">
                          <Settings className="size-4" />
                          Advanced Settings & Output
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 space-y-5 border-t bg-card">
                        {isAgent && (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Temperature</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={2}
                                  step={0.1}
                                  value={draft.temperature ?? ""}
                                  onChange={(e) => onDraftChange({ temperature: e.target.value ? Number(e.target.value) : undefined })}
                                  placeholder="0.7"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Tokens</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={draft.maxTokens ?? ""}
                                  onChange={(e) => onDraftChange({ maxTokens: e.target.value ? Number(e.target.value) : undefined })}
                                  placeholder="1000"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Prompt</Label>
                              <Textarea
                                rows={3}
                                value={draft.systemPrompt}
                                onChange={(e) => onDraftChange({ systemPrompt: e.target.value })}
                                placeholder="You are a helpful assistant."
                                className="bg-background"
                              />
                            </div>
                          </>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Result Variable</Label>
                            <Input
                              value={draft.resultVariable}
                              onChange={(e) => onDraftChange({ resultVariable: e.target.value })}
                              placeholder={isAgent ? "openai_response" : "voice_output"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scope</Label>
                            <Select
                              value={draft.resultScope}
                              onValueChange={(value) => onDraftChange({ resultScope: value as "session" | "contact" })}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="session">Session</SelectItem>
                                <SelectItem value="contact">Contact</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {isAgent && (
                          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-background">
                            <Label htmlFor="send-to-user" className="text-sm font-medium cursor-pointer">
                              Send response to user automatically
                            </Label>
                            <Switch
                              id="send-to-user"
                              checked={draft.sendResponseToUser}
                              onCheckedChange={(checked) => onDraftChange({ sendResponseToUser: checked })}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fallback Text (Optional)</Label>
                          <Input
                            value={draft.fallbackText}
                            onChange={(e) => onDraftChange({ fallbackText: e.target.value })}
                            placeholder="Sorry, I could not process this right now."
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {isAgent && (
                    <div className="mt-4 flex flex-col gap-3 border-t pt-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={onTestPrompt}
                        disabled={!draft.credentialId || !draft.model || !draft.prompt || testingPrompt}
                        className="w-full sm:w-auto self-start gap-1.5"
                      >
                        <MessageSquare className="size-3.5" />
                        {testingPrompt ? "Evaluating Response..." : "Preview Response"}
                      </Button>

                      {promptPreview && (
                        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preview Result</Label>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{promptPreview}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

