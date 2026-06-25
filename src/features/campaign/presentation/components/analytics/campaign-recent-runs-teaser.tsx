import { format } from "date-fns";
import { Activity, ArrowRight, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCampaignBatches } from "../../../api/campaign-queries";
import type { AnalyticsSection } from "../../../lib/campaign-analytics-metrics";

const TEASER_LIMIT = 3;

interface CampaignRecentRunsTeaserProps {
    campaignId: string;
    campaignName: string;
    returnTab?: AnalyticsSection;
    onViewAllRuns: () => void;
}

export function CampaignRecentRunsTeaser({
    campaignId,
    campaignName,
    returnTab = "overview",
    onViewAllRuns,
}: CampaignRecentRunsTeaserProps) {
    const navigate = useNavigate();
    const { data: fetchedBatches = [], isLoading } = useCampaignBatches(campaignId);
    const batches = [...fetchedBatches]
        .sort((a, b) => b.launchedAt.getTime() - a.launchedAt.getTime())
        .slice(0, TEASER_LIMIT);

    if (isLoading && batches.length === 0) {
        return <div className="animate-pulse h-40 bg-muted rounded-2xl border border-border" />;
    }

    if (fetchedBatches.length === 0) {
        return null;
    }

    const openBatchAnalytics = (batchId: string) => {
        navigate({
            to: "/campaign/$id/analytics/batch/$versionId",
            params: { id: campaignId, versionId: batchId },
            search: { tab: returnTab },
        });
    };

    return (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Recent Runs</h3>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={onViewAllRuns}>
                    View all
                    <ArrowRight className="size-3.5" />
                </Button>
            </div>
            <div className="divide-y divide-border">
                {batches.map((batch) => {
                    const stats = batch.analytics ?? {
                        total: batch.targetCount,
                        sent: batch.successCount,
                        delivered: 0,
                        opened: 0,
                        started: 0,
                        completed: 0,
                        failed: batch.failedCount,
                    };

                    return (
                        <button
                            key={batch.id}
                            type="button"
                            onClick={() => openBatchAnalytics(batch.id)}
                            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/30 transition-colors group"
                        >
                            <div className="bg-background border border-border p-2 rounded-lg text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors shrink-0">
                                <Calendar className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                    {campaignName} - Run {batch.versionNumber ?? "—"}
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="size-3" />
                                    {format(batch.launchedAt, "MMM dd, yyyy · hh:mm a")}
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                                <span>
                                    <span className="font-semibold text-foreground tabular-nums">
                                        {stats.total.toLocaleString()}
                                    </span>{" "}
                                    recipients
                                </span>
                                <span>
                                    <span className="font-semibold text-foreground tabular-nums">
                                        {stats.completed.toLocaleString()}
                                    </span>{" "}
                                    completed
                                </span>
                            </div>
                            <div className="shrink-0">
                                {batch.status === "success" && (
                                    <CheckCircle2 className="size-4 text-green-500" />
                                )}
                                {batch.status === "failed" && <XCircle className="size-4 text-red-500" />}
                                {batch.status === "running" && (
                                    <div className="size-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
