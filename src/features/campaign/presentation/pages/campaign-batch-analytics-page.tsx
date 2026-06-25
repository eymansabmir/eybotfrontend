import { format } from "date-fns";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useCampaign, useBatchAnalytics } from "../../api/campaign-queries";
import { exportCampaignCsv } from "../../api/campaign-export";

import { CampaignStatusBadge } from "../components/campaign-status-badge";
import { CampaignAnalyticsDashboard } from "../components/analytics/campaign-analytics-dashboard";
import { CampaignRecipientsTable } from "../components/analytics/campaign-recipients-table";
import type { AnalyticsSection } from "../../lib/campaign-analytics-metrics";

export function CampaignBatchAnalyticsPage() {
    const { id, versionId } = useParams({ strict: false });
    const navigate = useNavigate();
    const { tab: returnTab } = useSearch({ strict: false }) as { tab: AnalyticsSection };

    const { data: campaign, isLoading: isLoadingCampaign } = useCampaign(id ?? "");
    const { data: batchData, isLoading: isLoadingBatch } = useBatchAnalytics(id, versionId);

    if (isLoadingCampaign || isLoadingBatch || !campaign || !batchData) {
        return (
            <div className="space-y-8 pb-12 animate-pulse">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        );
    }

    const { batch, analytics } = batchData;
    const stats = analytics;
    const batchTitle = `${campaign.name} - Run ${batch.versionNumber}`;

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-background/50 hover:bg-background shadow-sm"
                        onClick={() =>
                            navigate({
                                to: "/campaign/$id/analytics",
                                params: { id: id as string },
                                search: { tab: returnTab },
                            })
                        }
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-foreground tracking-tight">
                                {batchTitle}
                            </h1>
                            <CampaignStatusBadge status={campaign.status} />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Batch Analytics · {format(new Date(batch.launchedAt), "MMM dd, yyyy · hh:mm a")}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 rounded-xl"
                        onClick={() => exportCampaignCsv(campaign, stats, undefined)}
                    >
                        <Download className="size-4" />
                        Download Report
                    </Button>
                </div>
            </div>

            <CampaignAnalyticsDashboard stats={stats} />

            <CampaignRecipientsTable campaignId={id as string} versionId={versionId as string} />
        </div>
    );
}
