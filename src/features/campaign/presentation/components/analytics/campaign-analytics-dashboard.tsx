import {
    Users,
    Send,
    Mail,
    Eye,
    PlayCircle,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import type { RecipientStats, VerifiedFunnel } from "../../../types";
import { resolveCampaignMetricValues } from "../../../lib/campaign-analytics-metrics";
import { MetricCard, RateCard } from "./metric-card";
import { FailureBreakdownTable } from "./failure-breakdown-table";

interface CampaignAnalyticsDashboardProps {
    stats: RecipientStats;
    failureBreakdown?: RecipientStats["failureBreakdown"];
}

export function CampaignAnalyticsDashboard({ stats, failureBreakdown }: CampaignAnalyticsDashboardProps) {
    const {
        sent: sentValue,
        delivered: deliveredValue,
        read: readValue,
        started: startedValue,
        failed: failedValue,
        deliveryRate,
        openRate,
        completionRate,
        useVerified,
    } = resolveCampaignMetricValues(stats);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RateCard title="Delivery Efficiency" rate={deliveryRate} color="#a855f7" formula="Delivered / Total Sent" />
                <RateCard title="Message Engagement" rate={openRate} color="#f97316" formula="Opened / Total Delivered" />
                <RateCard title="Campaign Success" rate={completionRate} color="#14b8a6" formula="Completed / Total Recipients" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Total Recipients" value={stats.total} total={stats.total} icon={Users} color="#3b82f6" description="Targeted contacts in scope" />
                <MetricCard title="Messages Sent" value={sentValue} total={stats.total} icon={Send} color="#22c55e" description="Successfully pushed to gateway" />
                <MetricCard title="Delivered" value={deliveredValue} total={stats.total} icon={Mail} color="#a855f7" description={useVerified ? "Confirmed via webhook" : "Received by user devices"} />
                <MetricCard title="Opened" value={readValue} total={stats.total} icon={Eye} color="#f97316" description="Read by recipients" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Conversation Started" value={startedValue} total={stats.total} icon={PlayCircle} color="#6366f1" description="Users who replied to the bot" />
                <MetricCard title="Completed Flow" value={stats.completed} total={stats.total} icon={CheckCircle2} color="#ec4899" description="Users reached end of campaign" />
                <MetricCard title="Failed / Bounced" value={failedValue} total={stats.total} icon={XCircle} color="#ef4444" description={useVerified ? "Mapped from BSP delivery errors" : "Errors and delivery failures"} />
            </div>

            {failureBreakdown && failureBreakdown.byCode.length > 0 && (
                <FailureBreakdownTable failureBreakdown={failureBreakdown} />
            )}
        </div>
    );
}

export function resolveAnalyticsStats(stats: RecipientStats & { verified?: VerifiedFunnel }) {
    return stats;
}
