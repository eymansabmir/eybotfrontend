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
    Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useCampaignPolling, useCampaignAnalytics } from "../../api/campaign-queries";
import { exportCampaignCsv } from "../../api/campaign-export";

import { CampaignStatusBadge } from "../components/campaign-status-badge";
import { MetricCard, RateCard } from "../components/analytics/metric-card";
import { ConversionFunnel } from "../components/analytics/conversion-funnel";
import { NpsSection } from "../components/analytics/nps-section";
import { StatsTable } from "../components/analytics/stats-table";

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

    const nps = analyticsData?.analytics.nps ?? null;

    const deliveryRate = stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0;
    const openRate = stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0;
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    const funnelSteps = [
        { label: "Total", value: stats.total, color: "#3b82f6" },
        { label: "Initiated", value: stats.initiated, color: "#6366f1" },
        { label: "Sent", value: stats.sent, color: "#22c55e" },
        { label: "Delivered", value: stats.delivered, color: "#a855f7" },
        { label: "Opened", value: stats.opened, color: "#f97316" },
        { label: "Started", value: stats.started, color: "#ec4899" },
        { label: "Completed", value: stats.completed, color: "#14b8a6" },
    ];

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

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RateCard title="Delivery Efficiency" rate={deliveryRate} color="#a855f7" formula="Delivered / Total Sent" />
                <RateCard title="Message Engagement" rate={openRate} color="#f97316" formula="Opened / Total Delivered" />
                <RateCard title="Campaign Success" rate={completionRate} color="#14b8a6" formula="Completed / Total Recipients" />
            </div>

            {/* NPS Deep Dive */}
            <NpsSection nps={nps} isLoading={isLoadingAnalytics} />

            {/* Core Funnel and Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12">
                    <ConversionFunnel steps={funnelSteps} />
                </div>
            </div>

            {/* Detailed Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Recipients" value={stats.total} total={stats.total} icon={Users} color="#3b82f6" description="Targeted contacts in campaign" />
                <MetricCard title="Messages Sent" value={stats.sent} total={stats.total} icon={Send} color="#22c55e" description="Successfully pushed to gateway" />
                <MetricCard title="Delivered" value={stats.delivered} total={stats.total} icon={Mail} color="#a855f7" description="Received by user devices" />
                <MetricCard title="Opened" value={stats.opened} total={stats.total} icon={Eye} color="#f97316" description="Read by recipients" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Conversation Started" value={stats.started} total={stats.total} icon={PlayCircle} color="#6366f1" description="Users who replied to the bot" />
                <MetricCard title="Completed Flow" value={stats.completed} total={stats.total} icon={CheckCircle2} color="#ec4899" description="Users reached end of campaign" />
                <MetricCard title="Current Queue" value={stats.pending + stats.queued} total={stats.total} icon={Clock} color="#94a3b8" description="Pending/Queued for execution" />
                <MetricCard title="Failed / Bounced" value={stats.failed} total={stats.total} icon={XCircle} color="#ef4444" description="Errors and delivery failures" />
            </div>

            {/* Raw Data Table */}
            <StatsTable stats={stats} />
        </div>
    );
}

// ─── Loading Skeleton ────────────────────────────────────────
function AnalyticsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-md" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-7 w-48" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
            <Skeleton className="h-64 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
        </div>
    );
}
