import { PIPELINE_STAGES } from "../../../data/workflow.mock";
import type { CampaignStatus } from "../../../types";
import { cn } from "@/lib/utils";

interface CampaignPipelineProps {
  counts: Partial<Record<CampaignStatus | "all", number>>;
  active: CampaignStatus | "all";
  onChange: (stage: CampaignStatus | "all") => void;
}

export function CampaignPipeline({ counts, active, onChange }: CampaignPipelineProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PIPELINE_STAGES.map((stage, index) => {
        const count = counts[stage.id] ?? 0;
        const isActive = active === stage.id;
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => onChange(stage.id)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "border-primary bg-primary/10 font-semibold text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50",
            )}
          >
            {index > 0 && stage.id !== "paused" ? (
              <span className="hidden text-[10px] text-muted-foreground/50 sm:inline">→</span>
            ) : null}
            {stage.label}
            <span className="tabular-nums text-xs text-muted-foreground">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
