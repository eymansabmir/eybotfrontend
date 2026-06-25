import { Database, Loader2 } from "lucide-react";
import type { Campaign, CustomApiIngestPhase } from "../../../types";
import { getCustomApiIngestProgress } from "../../../lib/custom-api-ingest-progress";
import { cn } from "@/lib/utils";

interface CustomApiIngestProgressCardProps {
    campaign: Campaign;
}

function phaseLabel(phase: CustomApiIngestPhase): string {
    switch (phase) {
        case "starting":
            return "Starting API fetch…";
        case "fetching":
            return "Fetching pages from external API";
        case "dispatching":
            return "Pages fetched — sending messages";
        case "finished":
            return "API import complete for this run";
        default:
            return "Waiting to start";
    }
}

export function CustomApiIngestProgressCard({ campaign }: CustomApiIngestProgressCardProps) {
    const progress = getCustomApiIngestProgress(campaign);
    if (!progress) return null;

    const rangeLabel = progress.configuredEndPage != null
        ? `pages ${progress.startPage}–${progress.configuredEndPage}`
        : `from page ${progress.startPage}`;

    const currentPageLabel =
        progress.currentPage > 0
            ? `Page ${progress.currentPage}`
            : progress.isActive
              ? `Starting at page ${progress.startPage}…`
              : "Not started";

    const targetPagesLabel =
        progress.pagesInRange != null
            ? `${progress.pagesFetched} / ${progress.pagesInRange} pages in range`
            : progress.apiTotalPages != null
              ? `${progress.pagesFetched} pages fetched (API total: ${progress.apiTotalPages})`
              : `${progress.pagesFetched} pages fetched`;

    const showBar = progress.pageProgressPct != null && progress.isActive;

    return (
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                        {progress.isActive ? (
                            <Loader2 className="size-4 text-primary animate-spin" />
                        ) : (
                            <Database className="size-4 text-primary" />
                        )}
                        Custom API Ingest
                    </h3>
                    <p className="text-xs text-muted-foreground">{phaseLabel(progress.phase)}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black tabular-nums text-primary">{currentPageLabel}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                        Configured: {rangeLabel}
                    </div>
                </div>
            </div>

            {showBar && (
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{targetPagesLabel}</span>
                        <span className="font-semibold tabular-nums">{progress.pageProgressPct!.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                            style={{ width: `${progress.pageProgressPct}%` }}
                        />
                    </div>
                </div>
            )}

            <div className={cn("mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs")}>
                <Stat label="New recipients" value={progress.ingestedThisRun.toLocaleString()} />
                <Stat
                    label="Max records"
                    value={progress.maxRecords != null ? progress.maxRecords.toLocaleString() : "No limit"}
                />
                <Stat
                    label="Page size"
                    value={progress.pageSize != null ? progress.pageSize.toLocaleString() : "—"}
                />
                <Stat
                    label="API total pages"
                    value={progress.apiTotalPages != null ? progress.apiTotalPages.toLocaleString() : "—"}
                />
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border/60 bg-background/60 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
            <div className="font-bold tabular-nums text-foreground mt-0.5">{value}</div>
        </div>
    );
}
