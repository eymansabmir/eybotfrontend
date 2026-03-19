import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OpenAIVoiceModel } from "../domain/openai.types";

interface OpenAITranscriptionFormProps {
  model: string;
  transcriptionVariableId: string;
  audioUrl: string;
  models: OpenAIVoiceModel[];
  onModelChange: (model: string) => void;
  onAudioFileChange: (file?: File) => void;
  onAudioUrlChange: (value: string) => void;
  onTranscriptionVariableChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function OpenAITranscriptionForm({
  model,
  transcriptionVariableId,
  audioUrl,
  models,
  onModelChange,
  onAudioFileChange,
  onAudioUrlChange,
  onTranscriptionVariableChange,
  onSubmit,
  disabled,
}: OpenAITranscriptionFormProps) {
  const transcriptionModels = models.filter((m) => m.mode === "create_transcription");

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Audio file</Label>
        <Input
          type="file"
          accept="audio/*"
          onChange={(e) => onAudioFileChange(e.currentTarget.files?.[0])}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Audio URL (optional)</Label>
        <Input value={audioUrl} onChange={(e) => onAudioUrlChange(e.target.value)} placeholder="https://.../audio.mp3" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Model</Label>
        <Select value={model} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {transcriptionModels.map((item) => (
              <SelectItem key={`${item.id}:${item.mode}`} value={item.id}>
                {item.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Output variable (transcription)</Label>
        <Input
          value={transcriptionVariableId}
          onChange={(e) => onTranscriptionVariableChange(e.target.value)}
          placeholder="voice_transcript"
        />
      </div>

      <Button onClick={onSubmit} disabled={disabled || !model || !transcriptionVariableId}>
        Test transcription
      </Button>
    </div>
  );
}
