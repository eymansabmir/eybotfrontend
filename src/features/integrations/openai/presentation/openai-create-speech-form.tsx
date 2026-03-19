import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { OpenAIVoiceModel } from "../domain/openai.types";

interface OpenAICreateSpeechFormProps {
  model: string;
  voice: string;
  textInput: string;
  saveUrlInVariableId: string;
  models: OpenAIVoiceModel[];
  onModelChange: (model: string) => void;
  onVoiceChange: (voice: string) => void;
  onTextInputChange: (value: string) => void;
  onSaveUrlVariableChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function OpenAICreateSpeechForm({
  model,
  voice,
  textInput,
  saveUrlInVariableId,
  models,
  onModelChange,
  onVoiceChange,
  onTextInputChange,
  onSaveUrlVariableChange,
  onSubmit,
  disabled,
}: OpenAICreateSpeechFormProps) {
  const speechModels = models.filter((m) => m.mode === "create_speech");

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Text input</Label>
        <Textarea value={textInput} onChange={(e) => onTextInputChange(e.target.value)} rows={4} maxLength={5000} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Voice</Label>
          <Select value={voice} onValueChange={onVoiceChange}>
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

        <div className="space-y-1.5">
          <Label className="text-xs">Model</Label>
          <Select value={model} onValueChange={onModelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {speechModels.map((item) => (
                <SelectItem key={`${item.id}:${item.mode}`} value={item.id}>
                  {item.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Output variable (URL)</Label>
        <Input
          value={saveUrlInVariableId}
          onChange={(e) => onSaveUrlVariableChange(e.target.value)}
          placeholder="voice_audio_url"
        />
      </div>

      <Button onClick={onSubmit} disabled={disabled || !model || !textInput || !saveUrlInVariableId}>
        Test voice
      </Button>
    </div>
  );
}
