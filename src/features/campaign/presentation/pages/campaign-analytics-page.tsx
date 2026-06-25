import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useCampaignPolling, useCampaignAnalytics } from "../../api/campaign-queries";
import { exportCampaignCsv } from "../../api/campaign-export";
import type { CampaignAnalyticsDateFilter } from "../../types";

import { CampaignStatusBadge } from "../components/campaign-status-badge";
import { CampaignDetailNav } from "../components/campaign-detail-nav";
import { CampaignAnalyticsDashboard } from "../components/analytics/campaign-analytics-dashboard";
import { CampaignAnalyticsDateFilterBar } from "../components/analytics/campaign-analytics-date-filter";
import { CampaignBatchTable } from "../components/analytics/campaign-batch-table";
import { CustomApiIngestProgressCard } from "../components/analytics/custom-api-ingest-progress";
import { RenudgeHistoryTable } from "../components/analytics/renudge-history-table";
import { CampaignRecipientsTable } from "../components/analytics/campaign-recipients-table";

export function CampaignAnalyticsPage() {
    const { id } = useParams({ strict: false });
    const navigate = useNavigate();
    const [dateFilter, setDateFilter] = useState<CampaignAnalyticsDateFilter>({});

    const { data: campaign, isLoading: isLoadingCampaign } = useCampaignPolling(id ?? "", true);
    const { data: analyticsData, isLoading: isLoadingAnalytics } = useCampaignAnalytics(id, dateFilter);

    if (isLoadingCampaign || !campaign || isLoadingAnalytics) {
        return <AnalyticsSkeleton />;
    }

    const stats = analyticsData?.analytics ?? {
        total: 0,
        initiated: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        started: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        queued: 0,
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-background/50 hover:bg-background shadow-sm"
                        onClick={() => navigate({ to: "/campaign" })}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-foreground tracking-tight">{campaign.name}</h1>
                            <CampaignStatusBadge status={campaign.status} />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Campaign Analytics
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 rounded-xl border-dashed hover:border-solid hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                        onClick={() => exportCampaignCsv(campaign, stats, undefined)}
                    >
                        <Download className="size-4" />
                        Download Report
                    </Button>
                </div>
            </div>

            <CampaignDetailNav campaignId={id as string} active="analytics" />

            <CampaignAnalyticsDateFilterBar value={dateFilter} onChange={setDateFilter} />

            {campaign.dataSourceId === "CUSTOM_API" && !dateFilter.startDate && !dateFilter.endDate && (
                <CustomApiIngestProgressCard campaign={campaign} />
            )}

            <CampaignAnalyticsDashboard stats={stats} failureBreakdown={stats.failureBreakdown} />

            <CampaignBatchTable campaignId={id as string} campaignName={campaign.name} />

            <RenudgeHistoryTable campaignId={id as string} />

            <CampaignRecipientsTable
                campaignId={id as string}
                startDate={dateFilter.startDate}
                endDate={dateFilter.endDate}
            />
        </div>
    );
}

function AnalyticsSkeleton() {
    return (
        <div className="space-y-8 pb-12 animate-pulse">
            <div className="flex items-center justify-between gap-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-4">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48 rounded-lg" />
                        <Skeleton className="h-3.5 w-32 rounded" />
                    </div>
                </div>
                <Skeleton className="h-9 w-36 rounded-xl" />
            </div>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        </div>
    );
}
