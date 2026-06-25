import {
    Users,
    Send,
    Mail,
    Eye,
    PlayCircle,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import type { FailureBreakdown, RecipientStats, VerifiedFunnel } from "../../../types";
import { MetricCard, RateCard } from "./metric-card";

interface CampaignAnalyticsDashboardProps {
    stats: RecipientStats;
    failureBreakdown?: FailureBreakdown;
}

export function CampaignAnalyticsDashboard({ stats, failureBreakdown }: CampaignAnalyticsDashboardProps) {
    const verified = stats.verified;
    const analyticsSource = stats.analyticsSource;
    const useVerified = analyticsSource === "verified" && verified;

    const sentValue = useVerified ? verified!.sent : stats.sent;
    const deliveredValue = useVerified ? verified!.delivered : stats.delivered;
    const readValue = useVerified ? verified!.read : (stats.opened ?? stats.read ?? 0);
    const startedValue = useVerified ? verified!.replied : (stats.started ?? stats.replied ?? 0);
    const failedValue = useVerified ? verified!.failed : stats.failed;

    const deliveryRate = sentValue > 0 ? (deliveredValue / sentValue) * 100 : 0;
    const openRate = deliveredValue > 0 ? (readValue / deliveredValue) * 100 : 0;
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

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
        </div>
    );
}

export function resolveAnalyticsStats(stats: RecipientStats & { verified?: VerifiedFunnel }) {
    return stats;
}
