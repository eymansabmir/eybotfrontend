import { useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    useCampaignPolling,
    useCampaignAnalytics,
    useCampaignBatches,
    useCampaignRenudges,
} from "../../api/campaign-queries";
import { exportCampaignCsv } from "../../api/campaign-export";
import type { CampaignAnalyticsDateFilter } from "../../types";
import type { AnalyticsSection } from "../../lib/campaign-analytics-metrics";

import { CampaignStatusBadge } from "../components/campaign-status-badge";
import { CampaignDetailNav } from "../components/campaign-detail-nav";
import { CampaignAnalyticsOverview } from "../components/analytics/campaign-analytics-overview";
import { CampaignAnalyticsDateFilterBar } from "../components/analytics/campaign-analytics-date-filter";
import { CampaignAnalyticsScopeBanner } from "../components/analytics/campaign-analytics-scope-banner";
import { CampaignBatchTable } from "../components/analytics/campaign-batch-table";
import { CampaignRecentRunsTeaser } from "../components/analytics/campaign-recent-runs-teaser";
import { CustomApiIngestProgressCard } from "../components/analytics/custom-api-ingest-progress";
import { RenudgeHistoryTable } from "../components/analytics/renudge-history-table";
import { CampaignRecipientsTable } from "../components/analytics/campaign-recipients-table";

export function CampaignAnalyticsPage() {
    const { id } = useParams({ strict: false });
    const navigate = useNavigate();
    const { tab: section } = useSearch({ strict: false }) as { tab: AnalyticsSection };
    const [dateFilter, setDateFilter] = useState<CampaignAnalyticsDateFilter>({});

    const { data: campaign, isLoading: isLoadingCampaign } = useCampaignPolling(id ?? "", true);
    const { data: analyticsData, isLoading: isLoadingAnalytics } = useCampaignAnalytics(id, dateFilter);
    const { data: batches = [] } = useCampaignBatches(id ?? "");
    const { data: renudges = [] } = useCampaignRenudges(id ?? "");

    const setSection = (tab: AnalyticsSection) => {
        navigate({
            to: "/campaign/$id/analytics",
            params: { id: id as string },
            search: { tab },
        });
    };

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

    const hasDateFilter = Boolean(dateFilter.startDate || dateFilter.endDate);

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-background/50 hover:bg-background shadow-sm shrink-0"
                            onClick={() => navigate({ to: "/campaign" })}
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <h1 className="text-2xl font-black text-foreground tracking-tight truncate">
                                    {campaign.name}
                                </h1>
                                <CampaignStatusBadge status={campaign.status} />
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Campaign Analytics
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <CampaignAnalyticsDateFilterBar
                            value={dateFilter}
                            onChange={setDateFilter}
                            variant="inline"
                        />
                        <Button
                            variant="outline"
                            className="gap-2 rounded-xl border-dashed hover:border-solid hover:bg-primary/5 hover:text-primary transition-all shadow-sm shrink-0"
                            onClick={() => exportCampaignCsv(campaign, stats, undefined)}
                        >
                            <Download className="size-4" />
                            <span className="hidden sm:inline">Download Report</span>
                        </Button>
                    </div>
                </div>
            </div>

            <CampaignDetailNav campaignId={id as string} active="analytics" />

            <Tabs
                value={section}
                onValueChange={(value) => setSection(value as AnalyticsSection)}
                className="gap-6"
            >
                <TabsList variant="line" className="w-full justify-start border-b border-border rounded-none pb-0 h-auto">
                    <TabsTrigger value="overview" className="rounded-none px-4 py-2.5">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="runs" className="rounded-none px-4 py-2.5">
                        Runs{batches.length > 0 && ` (${batches.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="follow-ups" className="rounded-none px-4 py-2.5">
                        Follow-ups{renudges.length > 0 && ` (${renudges.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="recipients" className="rounded-none px-4 py-2.5">
                        Recipients
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-0">
                    <CampaignAnalyticsScopeBanner dateFilter={dateFilter} scope="filtered" />

                    {campaign.dataSourceId === "CUSTOM_API" && !hasDateFilter && (
                        <CustomApiIngestProgressCard campaign={campaign} />
                    )}

                    <CampaignAnalyticsOverview stats={stats} failureBreakdown={stats.failureBreakdown} />

                    <CampaignRecentRunsTeaser
                        campaignId={id as string}
                        campaignName={campaign.name}
                        returnTab={section}
                        onViewAllRuns={() => setSection("runs")}
                    />
                </TabsContent>

                <TabsContent value="runs" className="space-y-6 mt-0">
                    <CampaignAnalyticsScopeBanner dateFilter={dateFilter} scope="lifetime" />
                    <CampaignBatchTable
                        campaignId={id as string}
                        campaignName={campaign.name}
                        returnTab={section}
                    />
                </TabsContent>

                <TabsContent value="follow-ups" className="space-y-6 mt-0">
                    <CampaignAnalyticsScopeBanner dateFilter={dateFilter} scope="lifetime" />
                    <RenudgeHistoryTable campaignId={id as string} />
                </TabsContent>

                <TabsContent value="recipients" className="space-y-6 mt-0">
                    <CampaignAnalyticsScopeBanner dateFilter={dateFilter} scope="filtered" />
                    <CampaignRecipientsTable
                        campaignId={id as string}
                        startDate={dateFilter.startDate}
                        endDate={dateFilter.endDate}
                    />
                </TabsContent>
            </Tabs>
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
            <Skeleton className="h-10 w-full max-w-md rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
        </div>
    );
}
