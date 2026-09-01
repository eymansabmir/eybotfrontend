import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  name: string;
  description: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  current: number;
  onStepSelect?: (index: number) => void;
}

export function WizardStepper({ steps, current, onStepSelect }: WizardStepperProps) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = current === index;
        const isCompleted = current > index;
        return (
          <li key={step.id}>
            <button
              type="button"
              disabled={!onStepSelect || index > current}
              onClick={() => onStepSelect?.(index)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                isActive && "border-primary bg-card shadow-sm",
                isCompleted && "border-border bg-card",
                !isActive && !isCompleted && "border-border/60 bg-card/40 opacity-60",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-emerald-500 text-white",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className={cn("block text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {step.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{step.description}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
