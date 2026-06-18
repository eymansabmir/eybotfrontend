import { useNavigate, useParams } from "@tanstack/react-router";
import {
    ArrowLeft,
    Download,
    Users,
    Send,
    Mail,
    Eye,
    PlayCircle,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useCampaignPolling, useCampaignAnalytics } from "../../api/campaign-queries";
import { exportCampaignCsv } from "../../api/campaign-export";

import { CampaignStatusBadge } from "../components/campaign-status-badge";
import { CampaignDetailNav } from "../components/campaign-detail-nav";
import { MetricCard, RateCard } from "../components/analytics/metric-card";
// import { ConversionFunnel } from "../components/analytics/conversion-funnel";
// import { StatsTable } from "../components/analytics/stats-table";
import { CampaignBatchTable } from "../components/analytics/campaign-batch-table";
import { RenudgeHistoryTable } from "../components/analytics/renudge-history-table";

export function CampaignAnalyticsPage() {
    const { id } = useParams({ strict: false });
    const navigate = useNavigate();

    const { data: campaign, isLoading: isLoadingCampaign } = useCampaignPolling(id ?? "", true);
    const { data: analyticsData, isLoading: isLoadingAnalytics } = useCampaignAnalytics(id);

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

    // Prefer the verified, webhook-derived funnel when the analytics pipeline is on.
    const verified = (stats as typeof stats & { verified?: import("../../types").VerifiedFunnel }).verified;
    const failureBreakdown = (stats as typeof stats & { failureBreakdown?: import("../../types").FailureBreakdown }).failureBreakdown;
    const sentValue = verified?.sent ?? stats.sent;
    const deliveredValue = verified?.delivered ?? stats.delivered;
    const readValue = verified?.read ?? stats.opened;
    const failedValue = verified?.failed ?? stats.failed;

    const deliveryRate = sentValue > 0 ? (deliveredValue / sentValue) * 100 : 0;
    const openRate = deliveredValue > 0 ? (readValue / deliveredValue) * 100 : 0;
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    // const funnelSteps = [
    //     { label: "Total", value: stats.total, color: "#3b82f6" },
    //     { label: "Initiated", value: stats.initiated, color: "#6366f1" },
    //     { label: "Sent", value: stats.sent, color: "#22c55e" },
    //     { label: "Delivered", value: stats.delivered, color: "#a855f7" },
    //     { label: "Opened", value: stats.opened, color: "#f97316" },
    //     { label: "Started", value: stats.started, color: "#ec4899" },
    //     { label: "Completed", value: stats.completed, color: "#14b8a6" },
    // ];

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header */}
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
                            Campaign ID: <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded ml-1">{campaign.id}</span>
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

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RateCard title="Delivery Efficiency" rate={deliveryRate} color="#a855f7" formula="Delivered / Total Sent" />
                <RateCard title="Message Engagement" rate={openRate} color="#f97316" formula="Opened / Total Delivered" />
                <RateCard title="Campaign Success" rate={completionRate} color="#14b8a6" formula="Completed / Total Recipients" />
            </div>


            {/* Detailed Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Recipients" value={stats.total} total={stats.total} icon={Users} color="#3b82f6" description="Targeted contacts in campaign" />
                <MetricCard title="Messages Sent" value={sentValue} total={stats.total} icon={Send} color="#22c55e" description="Successfully pushed to gateway" />
                <MetricCard title="Delivered" value={deliveredValue} total={stats.total} icon={Mail} color="#a855f7" description={verified ? "Confirmed via webhook" : "Received by user devices"} />
                <MetricCard title="Opened" value={readValue} total={stats.total} icon={Eye} color="#f97316" description="Read by recipients" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Conversation Started" value={stats.started} total={stats.total} icon={PlayCircle} color="#6366f1" description="Users who replied to the bot" />
                <MetricCard title="Completed Flow" value={stats.completed} total={stats.total} icon={CheckCircle2} color="#ec4899" description="Users reached end of campaign" />
                {/* <MetricCard title="Current Queue" value={stats.pending + stats.queued} total={stats.total} icon={Clock} color="#94a3b8" description="Pending/Queued for execution" /> */}
                <MetricCard title="Failed / Bounced" value={failedValue} total={stats.total} icon={XCircle} color="#ef4444" description={verified ? "Mapped from BSP delivery errors" : "Errors and delivery failures"} />
            </div>

            {/* Failure Breakdown (verified analytics pipeline) */}
            {failureBreakdown && failureBreakdown.byCode.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <XCircle className="size-4 text-red-500" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Failure Breakdown</h2>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-border/50">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold">Category</th>
                                    <th className="px-4 py-2 text-left font-semibold">Code</th>
                                    <th className="px-4 py-2 text-left font-semibold">Reason</th>
                                    <th className="px-4 py-2 text-right font-semibold">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {failureBreakdown.byCode.map((row) => (
                                    <tr key={`${row.code}-${row.reason}`} className="border-t border-border/40 hover:bg-muted/20">
                                        <td className="px-4 py-2 font-medium">{row.category ?? "Unknown"}</td>
                                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{row.code}</td>
                                        <td className="px-4 py-2 text-muted-foreground">{row.reason ?? "-"}</td>
                                        <td className="px-4 py-2 text-right font-bold tabular-nums">{row.count.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Batch Launch History Table (For Karix Rate Limits) */}
            <div className="mb-6 mt-6">
                <CampaignBatchTable campaignId={id as string} />
            </div>

            {/* Renudge History Table */}
            <div className="mb-6 mt-6">
                <RenudgeHistoryTable campaignId={id as string} />
            </div>

            {/* Core Funnel and Distribution */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12">
                    <ConversionFunnel steps={funnelSteps} />
                </div>
            </div> */}


            {/* Raw Data Table */}
            {/* <StatsTable stats={stats} /> */}
        </div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────
// Each section mirrors the real layout so there's no visual 'jump' when data loads.
function AnalyticsSkeleton() {
    return (
        <div className="space-y-8 pb-12 animate-pulse">
            {/* Header card */}
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

            {/* 3 rate cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-28 rounded" />
                            <Skeleton className="size-8 rounded-full" />
                        </div>
                        <Skeleton className="h-10 w-20 rounded-lg" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                        <Skeleton className="h-3 w-24 rounded" />
                    </div>
                ))}
            </div>

            {/* NPS placeholder */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <Skeleton className="h-5 w-32 rounded" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                </div>
            </div>

            {/* 4 metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="size-5 rounded" />
                        </div>
                        <Skeleton className="h-9 w-16 rounded-lg" />
                        <Skeleton className="h-1.5 w-full rounded-full" />
                    </div>
                ))}
            </div>

            {/* Stats table placeholder */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-3 w-56 rounded" />
                <div className="space-y-3 mt-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="flex items-center gap-4 py-2">
                            <div className="flex items-center gap-2.5 w-[45%]">
                                <Skeleton className="size-2.5 rounded-full flex-shrink-0" />
                                <Skeleton className={`h-4 rounded w-${i % 2 === 0 ? "28" : "36"}`} />
                            </div>
                            <Skeleton className="h-4 w-8 rounded ml-auto" />
                            <div className="flex items-center gap-3 w-[40%]">
                                <Skeleton className="h-1.5 flex-1 max-w-36 rounded-full" />
                                <Skeleton className="h-3 w-10 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

