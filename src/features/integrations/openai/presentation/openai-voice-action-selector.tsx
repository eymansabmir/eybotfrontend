import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OpenAIVoiceActionMode } from "../domain/openai.types";

interface OpenAIVoiceActionSelectorProps {
  value: OpenAIVoiceActionMode;
  onChange: (value: OpenAIVoiceActionMode) => void;
}

export function OpenAIVoiceActionSelector({ value, onChange }: OpenAIVoiceActionSelectorProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Voice action</Label>
      <Select value={value} onValueChange={(v) => onChange(v as OpenAIVoiceActionMode)}>
        <SelectTrigger>
          <SelectValue placeholder="Choose action" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="create_speech">Create speech (TTS)</SelectItem>
          <SelectItem value="create_transcription">Create transcription (STT)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
