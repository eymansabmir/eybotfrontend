import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DeepSeekModel } from "../domain/deepseek.types";

interface DeepSeekModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  models: DeepSeekModel[];
  isLoading: boolean;
  disabled?: boolean;
}

export function DeepSeekModelSelector({
  value,
  onValueChange,
  models,
  isLoading,
  disabled,
}: DeepSeekModelSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model</label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
        <SelectTrigger className="bg-muted/40">
          <SelectValue placeholder={isLoading ? "Loading models..." : "Select model"} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Fetching models
            </div>
          ) : (
            models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.id}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
