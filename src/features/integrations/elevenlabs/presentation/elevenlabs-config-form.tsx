import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  modelLoadError,
  voiceLoadError,
  onDraftChange,
  onConnectAccount,
  onTestConnection,
  testingConnection,
}: ElevenLabsConfigFormProps) {
  const voiceLabelById = new Map(
    voices.map((voice) => {
      const details = [voice.description, voice.category]
        .filter((value): value is string => Boolean(value && value.trim().length > 0))
        .join(", ");

      return [voice.id, details ? `${voice.name} - ${details}` : voice.name];
    }),
  );

  const modelLabelById = new Map(
    models.map((model) => [model.id, model.name?.trim() ? model.name : model.id]),
  );

  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* Account Selection */}
      <div className="space-y-2">
        <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Account</Label>
        {credentials.length > 0 ? (
          <div className="flex gap-2">
            <Select 
              value={draft.credentialId || "__none"} 
              onValueChange={(value) => {
                if (value === "__connect_new") {
                  onConnectAccount();
                  return;
                }

                onDraftChange({ credentialId: value === "__none" ? "" : value, modelId: "", voiceId: "" });
              }}
            >
              <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50 h-9 text-sm">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Select an account</SelectItem>
                {credentials.map((credential) => (
                  <SelectItem key={credential.id} value={credential.id}>
                    {credential.name}
                  </SelectItem>
                ))}
                <SelectItem value="__connect_new">+ Connect new account</SelectItem>
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
        <div className="space-y-6 flex flex-col fade-in animate-in">
          <div className="space-y-2">
            <Select value="convert_text_to_speech" disabled>
              <SelectTrigger className="w-full bg-background font-medium focus:ring-0">
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="convert_text_to_speech">Convert text to speech</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Text</Label>
            <Textarea
              rows={4}
              value={draft.text}
              onChange={(e) => onDraftChange({ text: e.target.value })}
              placeholder="Enter the text to convert to speech"
              className="resize-y bg-background font-normal"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Voice</Label>
            <Select
              value={draft.voiceId || "__none"}
              onValueChange={(value) => onDraftChange({ voiceId: value === "__none" ? "" : value })}
              disabled={voicesLoading}
            >
              <SelectTrigger className="bg-background font-normal h-10">
                <SelectValue placeholder={voicesLoading ? "Loading voices..." : "Select a voice"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Select a voice</SelectItem>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voiceLabelById.get(voice.id) ?? voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {voiceLoadError && <p className="text-xs text-destructive mt-1">{voiceLoadError}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Model</Label>
            <Select
              value={draft.modelId || "__none"}
              onValueChange={(value) => onDraftChange({ modelId: value === "__none" ? "" : value })}
              disabled={modelsLoading}
            >
              <SelectTrigger className="bg-background font-normal h-10">
                <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select a model"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Select a model</SelectItem>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {modelLabelById.get(model.id) ?? model.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {modelLoadError && <p className="text-xs text-destructive mt-1">{modelLoadError}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Save audio URL in variable</Label>
            <Input
              value={draft.resultVariable}
              onChange={(e) => onDraftChange({ resultVariable: e.target.value })}
              placeholder="Select a variable"
              className="font-normal"
            />
          </div>
        </div>
      )}
    </div>
  );
}

