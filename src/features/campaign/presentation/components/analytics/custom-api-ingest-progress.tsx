import { Database, Loader2 } from "lucide-react";
import type { Campaign, CustomApiIngestPhase } from "../../../types";
import { getCustomApiIngestProgress } from "../../../lib/custom-api-ingest-progress";

interface CustomApiIngestProgressCardProps {
    campaign: Campaign;
}

function phaseLabel(phase: CustomApiIngestPhase): string {
    switch (phase) {
        case "starting":
            return "Starting…";
        case "fetching":
            return "Fetching pages";
        case "dispatching":
            return "Dispatching messages";
        case "finished":
            return "Import complete";
        default:
            return "Waiting";
    }
}

export function CustomApiIngestProgressCard({ campaign }: CustomApiIngestProgressCardProps) {
    const progress = getCustomApiIngestProgress(campaign);
    if (!progress) return null;

    const rangeLabel = progress.configuredEndPage != null
        ? `p.${progress.startPage}–${progress.configuredEndPage}`
        : `from p.${progress.startPage}`;

    const currentPageLabel =
        progress.currentPage > 0
            ? `Page ${progress.currentPage}`
            : progress.isActive
              ? `Starting…`
              : "Idle";

    const showBar = progress.pageProgressPct != null && progress.isActive;

    return (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] px-3 py-2.5">
            {progress.isActive ? (
                <Loader2 className="size-4 text-primary animate-spin shrink-0" />
            ) : (
                <Database className="size-4 text-primary shrink-0" />
            )}

            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-foreground truncate">
                        Custom API · {phaseLabel(progress.phase)}
                    </span>
                    <span className="text-muted-foreground shrink-0 tabular-nums">{currentPageLabel}</span>
                </div>

                {showBar ? (
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500 rounded-full"
                                style={{ width: `${progress.pageProgressPct}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-semibold tabular-nums text-primary shrink-0 w-8 text-right">
                            {progress.pageProgressPct!.toFixed(0)}%
                        </span>
                    </div>
                ) : (
                    <p className="text-[10px] text-muted-foreground truncate">
                        {rangeLabel}
                        {progress.ingestedThisRun > 0 && ` · ${progress.ingestedThisRun.toLocaleString()} ingested`}
                    </p>
                )}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground shrink-0 border-l border-border/60 pl-3">
                <span className="tabular-nums">
                    <span className="font-bold text-foreground">{progress.ingestedThisRun.toLocaleString()}</span> new
                </span>
                {progress.pagesInRange != null && (
                    <span className="tabular-nums">
                        {progress.pagesFetched}/{progress.pagesInRange} pg
                    </span>
                )}
            </div>
        </div>
    );
}
