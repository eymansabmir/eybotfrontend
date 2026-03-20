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
}: ElevenLabsConfigFormProps) {
  return (
    <div className="space-y-6 flex flex-col pt-2">
      <div className="space-y-2">
        <Select
          value={draft.credentialId}
          onValueChange={(value) => onDraftChange({ credentialId: value, modelId: "", voiceId: "" })}
        >
          <SelectTrigger className="w-full bg-background font-medium">
            <SelectValue placeholder="Select an account" />
          </SelectTrigger>
          <SelectContent>
            {credentials.map((credential) => (
              <SelectItem key={credential.id} value={credential.id}>
                {credential.name}
              </SelectItem>
            ))}
            <div className="p-1 border-t mt-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onConnectAccount();
                }}
              >
                Create new credentials
              </Button>
            </div>
          </SelectContent>
        </Select>
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
              value={draft.voiceId}
              onValueChange={(value) => onDraftChange({ voiceId: value })}
              disabled={voicesLoading}
            >
              <SelectTrigger className="bg-background font-normal h-10">
                <SelectValue placeholder={voicesLoading ? "Loading voices..." : "Select a voice"} />
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
            <Label className="text-sm font-medium text-foreground">Model</Label>
            <Select
              value={draft.modelId}
              onValueChange={(value) => onDraftChange({ modelId: value })}
              disabled={modelsLoading}
            >
              <SelectTrigger className="bg-background font-normal h-10">
                <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select a model"} />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name || model.id}
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

