import { Plus, TestTube2, Settings } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import type {
  ElevenLabsCredential,
  ElevenLabsModel,
  ElevenLabsTestConnectionResult,
  ElevenLabsVoice,
} from "../domain/elevenlabs.types";

export interface ElevenLabsConfigDraft {
  credentialId: string;
  voiceId: string;
  text: string;
  modelId: string;
  outputFormat: string;
  timeoutMs?: number;
  resultVariable: string;
  resultScope: "session" | "contact";
  sendResponseToUser: boolean;
  fallbackText: string;
}

interface ElevenLabsConfigFormProps {
  draft: ElevenLabsConfigDraft;
  credentials: ElevenLabsCredential[];
  models: ElevenLabsModel[];
  voices: ElevenLabsVoice[];
  modelsLoading: boolean;
  voicesLoading: boolean;
  lastTestResult?: ElevenLabsTestConnectionResult | null;
  modelLoadError?: string;
  voiceLoadError?: string;
  onDraftChange: (patch: Partial<ElevenLabsConfigDraft>) => void;
  onConnectAccount: () => void;
  onTestConnection: () => void;
  testingConnection: boolean;
}

export function ElevenLabsConfigForm({
  draft,
  credentials,
  models,
  voices,
  modelsLoading,
  voicesLoading,
  lastTestResult,
  modelLoadError,
  voiceLoadError,
  onDraftChange,
  onConnectAccount,
  onTestConnection,
  testingConnection,
}: ElevenLabsConfigFormProps) {
  const selectedCredential = credentials.find((item) => item.id === draft.credentialId);

  return (
    <div className="space-y-8">
      {/* Step 1: Account Connection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">1. Account Details</Label>
            <p className="text-xs text-muted-foreground">Select or connect your ElevenLabs account</p>
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
            onValueChange={(value) => onDraftChange({ credentialId: value, modelId: "", voiceId: "" })}
          >
            <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50">
              <SelectValue placeholder="Select ElevenLabs Account" />
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
            <div className="mt-4 flex flex-col gap-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  {lastTestResult ? (
                    <p className="text-xs font-medium text-muted-foreground">
                      Status: {lastTestResult.ok ? (
                        <span className="text-emerald-500">Connected ({lastTestResult.latencyMs}ms)</span>
                      ) : (
                        <span className="text-destructive">Failed: {lastTestResult.errorMessage ?? "Unknown error"}</span>
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Using credential: {selectedCredential?.name}</p>
                  )}
                </div>
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
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Configuration */}
      {draft.credentialId && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-base font-semibold">2. Configuration</Label>
              <p className="text-xs text-muted-foreground">Configure the speech synthesis parameters</p>
            </div>

            <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voice</Label>
                  <Select
                    value={draft.voiceId}
                    onValueChange={(value) => onDraftChange({ voiceId: value })}
                    disabled={voicesLoading}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder={voicesLoading ? "Loading voices..." : "Select voice"} />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {voiceLoadError && <p className="text-xs text-destructive mt-1">{voiceLoadError}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Model (Optional)</Label>
                  <Select
                    value={draft.modelId || "__auto"}
                    onValueChange={(value) => onDraftChange({ modelId: value === "__auto" ? "" : value })}
                    disabled={modelsLoading}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder={modelsLoading ? "Loading models..." : "Auto-select default model"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__auto">Auto-select default model</SelectItem>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name || model.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {modelLoadError && <p className="text-xs text-destructive mt-1">{modelLoadError}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text</Label>
                <Textarea
                  rows={5}
                  value={draft.text}
                  onChange={(e) => onDraftChange({ text: e.target.value })}
                  placeholder="Convert this message to speech: {{session.last_user_message}}"
                  className="resize-y bg-background"
                />
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced" className="border rounded-lg overflow-hidden shrink-0 shadow-sm bg-muted/20">
                  <AccordionTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm hover:no-underline hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 font-semibold">
                      <Settings className="size-4" />
                      Advanced Settings & Output
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 space-y-5 border-t bg-card">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output format</Label>
                        <Input
                          value={draft.outputFormat}
                          onChange={(e) => onDraftChange({ outputFormat: e.target.value })}
                          placeholder="mp3_44100_128"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeout (ms)</Label>
                        <Input
                          type="number"
                          min={1}
                          value={draft.timeoutMs ?? ""}
                          onChange={(e) => onDraftChange({ timeoutMs: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="15000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Result Variable</Label>
                        <Input
                          value={draft.resultVariable}
                          onChange={(e) => onDraftChange({ resultVariable: e.target.value })}
                          placeholder="elevenlabs_audio"
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

                    <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-background">
                      <Label htmlFor="elevenlabs-send-to-user" className="text-sm font-medium cursor-pointer">
                        Send generated audio to user automatically
                      </Label>
                      <Switch
                        id="elevenlabs-send-to-user"
                        checked={draft.sendResponseToUser}
                        onCheckedChange={(checked) => onDraftChange({ sendResponseToUser: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fallback Text (Optional)</Label>
                      <Input
                        value={draft.fallbackText}
                        onChange={(e) => onDraftChange({ fallbackText: e.target.value })}
                        placeholder="Sorry, I could not generate audio right now."
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
