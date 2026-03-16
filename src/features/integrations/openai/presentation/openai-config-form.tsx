import { Plus, TestTube2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { OpenAICredential, OpenAIModel, OpenAITestConnectionResult, OpenAIVoiceModel } from "../domain/openai.types";
import type { OpenAIConfigDraft } from "../state/openai-config.state";
import { OpenAIModelSelector } from "./openai-model-selector";
import { OpenAIStatusPanel } from "./openai-status-panel";
import { OpenAIVoiceActionSelector } from "./openai-voice-action-selector";

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
  const selectedModeLabel = draft.mode === "agent" ? "Agent" : "Voice";

  const openAIModelOptions = draft.mode === "voice"
    ? voiceModels.map((item) => ({ id: item.id, ownedBy: item.ownedBy }))
    : models;
  const openAIModelLoading = draft.mode === "voice" ? voiceModelsLoading : modelsLoading;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-3">
        <Label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">Mode</Label>
        <Select
          value={draft.mode}
          onValueChange={(value) =>
            onDraftChange({
              mode: value as "agent" | "voice",
              model: "",
              voiceAction: value === "voice" ? draft.voiceAction : "create_speech",
            })
          }
        >
          <SelectTrigger className="bg-muted/40">
            <SelectValue placeholder="Select mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="voice">Voice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border p-3">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Credential</Label>
          <Button variant="outline" size="sm" onClick={onConnectAccount} className="h-8 gap-1.5">
            <Plus className="size-3.5" />
            Add OpenAI account
          </Button>
        </div>
        <Select
          value={draft.credentialId}
          onValueChange={(value) => onDraftChange({ credentialId: value, model: "" })}
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

      <OpenAIModelSelector
        value={draft.model}
        onValueChange={(value) => onDraftChange({ model: value })}
        models={openAIModelOptions}
        isLoading={openAIModelLoading}
        disabled={!draft.credentialId}
      />
      {modelLoadError ? <p className="text-xs text-destructive">{modelLoadError}</p> : null}

      {draft.mode === "voice" ? (
        <OpenAIVoiceActionSelector
          value={draft.voiceAction}
          onChange={(value) => onDraftChange({ voiceAction: value, model: "" })}
        />
      ) : null}

      {draft.mode === "voice" && draft.voiceAction === "create_speech" ? (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Voice</Label>
          <Select value={draft.voice ?? "alloy"} onValueChange={(value) => onDraftChange({ voice: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alloy">alloy</SelectItem>
              <SelectItem value="ash">ash</SelectItem>
              <SelectItem value="ballad">ballad</SelectItem>
              <SelectItem value="coral">coral</SelectItem>
              <SelectItem value="sage">sage</SelectItem>
              <SelectItem value="verse">verse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {draft.mode === "agent" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Temperature</Label>
            <Input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={draft.temperature ?? ""}
              onChange={(e) => onDraftChange({ temperature: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Max tokens</Label>
            <Input
              type="number"
              min={1}
              value={draft.maxTokens ?? ""}
              onChange={(e) => onDraftChange({ maxTokens: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
        </div>
      ) : null}

      {draft.mode === "agent" ? (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System prompt</Label>
          <Textarea
            rows={3}
            value={draft.systemPrompt}
            onChange={(e) => onDraftChange({ systemPrompt: e.target.value })}
            placeholder="You are a helpful assistant."
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {draft.mode === "agent"
            ? "Prompt"
            : draft.voiceAction === "create_speech"
              ? "Speech input"
              : "Transcription instruction"}
        </Label>
        <Textarea
          rows={draft.mode === "agent" ? 5 : 4}
          value={draft.prompt}
          onChange={(e) => onDraftChange({ prompt: e.target.value })}
          placeholder={
            draft.mode === "agent"
              ? "Summarize this: {{session.last_user_message}}"
              : draft.voiceAction === "create_speech"
                ? "Convert this text to speech"
                : "Transcribe the latest audio input"
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Result variable</Label>
          <Input
            value={draft.resultVariable}
            onChange={(e) => onDraftChange({ resultVariable: e.target.value })}
            placeholder={draft.mode === "agent" ? "openai_response" : "voice_output"}
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

      {draft.mode === "agent" ? (
        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <Label htmlFor="send-to-user" className="text-xs">
            Send response to user automatically
          </Label>
          <Switch
            id="send-to-user"
            checked={draft.sendResponseToUser}
            onCheckedChange={(checked) => onDraftChange({ sendResponseToUser: checked })}
          />
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fallback text (optional)</Label>
        <Input
          value={draft.fallbackText}
          onChange={(e) => onDraftChange({ fallbackText: e.target.value })}
          placeholder="Sorry, I could not process this right now."
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
        {draft.mode === "agent" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onTestPrompt}
            disabled={!draft.credentialId || !draft.model || !draft.prompt || testingPrompt}
          >
            {testingPrompt ? "Running..." : "Test prompt"}
          </Button>
        ) : null}
      </div>

      {promptPreview && draft.mode === "agent" ? (
        <div className="space-y-1.5 rounded-xl border border-border bg-muted/20 p-3">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preview response</Label>
          <p className="whitespace-pre-wrap text-sm">{promptPreview}</p>
        </div>
      ) : null}

      <p className="text-[11px] text-muted-foreground">
        Selected mode: {selectedModeLabel}
      </p>

      <OpenAIStatusPanel credential={selectedCredential} lastTestResult={lastTestResult} />
    </div>
  );
}
