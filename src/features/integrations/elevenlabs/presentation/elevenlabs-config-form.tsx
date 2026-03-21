import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type {
  ElevenLabsCredential,
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
  voices: ElevenLabsVoice[];
  voicesLoading: boolean;
  lastTestResult?: ElevenLabsTestConnectionResult | null;
  voiceLoadError?: string;
  onDraftChange: (patch: Partial<ElevenLabsConfigDraft>) => void;
  onConnectAccount: () => void;
  onTestConnection: () => void;
  testingConnection: boolean;
}

export function ElevenLabsConfigForm({
  draft,
  credentials,
  voices,
  voicesLoading,
  voiceLoadError,
  onDraftChange,
  onConnectAccount,
  onTestConnection,
  testingConnection,
}: ElevenLabsConfigFormProps) {
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

