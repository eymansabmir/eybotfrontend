import { Plus, TestTube2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Credential</Label>
          <Button variant="outline" size="sm" onClick={onConnectAccount} className="h-8 gap-1.5">
            <Plus className="size-3.5" />
            Add ElevenLabs account
          </Button>
        </div>
        <Select
          value={draft.credentialId}
          onValueChange={(value) => onDraftChange({ credentialId: value, modelId: "", voiceId: "" })}
        >
          <SelectTrigger className="bg-muted/40">
            <SelectValue placeholder="Select credential" />
          </SelectTrigger>
          <SelectContent>
            {credentials.map((credential) => (
              <SelectItem key={credential.id} value={credential.id}>
                {credential.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Voice</Label>
        <Select
          value={draft.voiceId}
          onValueChange={(value) => onDraftChange({ voiceId: value })}
          disabled={!draft.credentialId || voicesLoading}
        >
          <SelectTrigger>
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
        {voiceLoadError ? <p className="text-xs text-destructive">{voiceLoadError}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model (optional)</Label>
        <Select
          value={draft.modelId || "__auto"}
          onValueChange={(value) => onDraftChange({ modelId: value === "__auto" ? "" : value })}
          disabled={!draft.credentialId || modelsLoading}
        >
          <SelectTrigger>
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
        {modelLoadError ? <p className="text-xs text-destructive">{modelLoadError}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Text</Label>
        <Textarea
          rows={5}
          value={draft.text}
          onChange={(e) => onDraftChange({ text: e.target.value })}
          placeholder="Convert this message to speech: {{session.last_user_message}}"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Output format</Label>
          <Input
            value={draft.outputFormat}
            onChange={(e) => onDraftChange({ outputFormat: e.target.value })}
            placeholder="mp3_44100_128"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Timeout (ms)</Label>
          <Input
            type="number"
            min={1}
            value={draft.timeoutMs ?? ""}
            onChange={(e) => onDraftChange({ timeoutMs: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="15000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Result variable</Label>
          <Input
            value={draft.resultVariable}
            onChange={(e) => onDraftChange({ resultVariable: e.target.value })}
            placeholder="elevenlabs_audio"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Scope</Label>
          <Select
            value={draft.resultScope}
            onValueChange={(value) => onDraftChange({ resultScope: value as "session" | "contact" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="session">Session</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="elevenlabs-send-to-user" className="text-xs">
          Send generated audio to user automatically
        </Label>
        <Switch
          id="elevenlabs-send-to-user"
          checked={draft.sendResponseToUser}
          onCheckedChange={(checked) => onDraftChange({ sendResponseToUser: checked })}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fallback text (optional)</Label>
        <Input
          value={draft.fallbackText}
          onChange={(e) => onDraftChange({ fallbackText: e.target.value })}
          placeholder="Sorry, I could not generate audio right now."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onTestConnection}
          disabled={!draft.credentialId || testingConnection}
          className="gap-1.5"
        >
          <TestTube2 className="size-3.5" />
          {testingConnection ? "Testing..." : "Test connection"}
        </Button>
      </div>

      {lastTestResult ? (
        <p className="text-[11px] text-muted-foreground">
          {lastTestResult.ok
            ? `Connection OK (${lastTestResult.latencyMs}ms)`
            : `Connection failed: ${lastTestResult.errorMessage ?? "Unknown error"}`}
        </p>
      ) : null}

      {selectedCredential ? (
        <p className="text-[11px] text-muted-foreground">Using credential: {selectedCredential.name}</p>
      ) : null}
    </div>
  );
}
