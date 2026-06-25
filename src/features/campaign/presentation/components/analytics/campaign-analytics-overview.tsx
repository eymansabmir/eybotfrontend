import { useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    Users,
    Mail,
    Eye,
    CheckCircle2,
    Send,
    PlayCircle,
    XCircle,
} from "lucide-react";
import type { FailureBreakdown, RecipientStats } from "../../../types";
import { resolveCampaignMetricValues } from "../../../lib/campaign-analytics-metrics";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { CampaignFunnelStrip } from "./campaign-funnel-strip";
import { FailureBreakdownTable } from "./failure-breakdown-table";
import { MetricCard, RateCard } from "./metric-card";

interface CampaignAnalyticsOverviewProps {
    stats: RecipientStats;
    failureBreakdown?: FailureBreakdown;
}

export function CampaignAnalyticsOverview({ stats, failureBreakdown }: CampaignAnalyticsOverviewProps) {
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [failuresOpen, setFailuresOpen] = useState(false);

    const {
        sent,
        delivered,
        read,
        started,
        failed,
        deliveryRate,
        openRate,
        completionRate,
        useVerified,
    } = resolveCampaignMetricValues(stats);

    const funnelSteps = [
        { label: "Recipients", value: stats.total, color: "#3b82f6" },
        { label: "Sent", value: sent, color: "#22c55e" },
        { label: "Delivered", value: delivered, color: "#a855f7" },
        { label: "Opened", value: read, color: "#f97316" },
        { label: "Started", value: started, color: "#6366f1" },
        { label: "Completed", value: stats.completed, color: "#14b8a6" },
    ];

    const hasFailures = failureBreakdown && failureBreakdown.byCode.length > 0;

    return (
        <div className="space-y-6">
            <CampaignFunnelStrip steps={funnelSteps} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Recipients"
                    value={stats.total}
                    total={stats.total}
                    icon={Users}
                    color="#3b82f6"
                    description="Targeted contacts in scope"
                />
                <MetricCard
                    title="Delivered"
                    value={delivered}
                    total={stats.total}
                    icon={Mail}
                    color="#a855f7"
                    description={useVerified ? "Confirmed via webhook" : "Received by user devices"}
                />
                <MetricCard
                    title="Opened"
                    value={read}
                    total={stats.total}
                    icon={Eye}
                    color="#f97316"
                    description="Read by recipients"
                />
                <MetricCard
                    title="Completed Flow"
                    value={stats.completed}
                    total={stats.total}
                    icon={CheckCircle2}
                    color="#14b8a6"
                    description="Users reached end of campaign"
                />
            </div>

            {hasFailures && (
                <Collapsible open={failuresOpen} onOpenChange={setFailuresOpen}>
                    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full h-auto justify-between rounded-none px-5 py-4 hover:bg-muted/30"
                            >
                                <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                                    <XCircle className="size-4 text-red-500" />
                                    Failure Breakdown
                                    <span className="text-xs font-medium normal-case tracking-normal text-muted-foreground">
                                        ({failureBreakdown!.byCode.reduce((sum, r) => sum + r.count, 0).toLocaleString()} total)
                                    </span>
                                </span>
                                {failuresOpen ? (
                                    <ChevronDown className="size-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                )}
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="px-5 pb-5">
                                <FailureBreakdownTable failureBreakdown={failureBreakdown!} embedded />
                            </div>
                        </CollapsibleContent>
                    </div>
                </Collapsible>
            )}

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full h-auto justify-between rounded-none px-5 py-4 hover:bg-muted/30"
                        >
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Advanced Metrics
                            </span>
                            {advancedOpen ? (
                                <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="px-5 pb-5 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <RateCard
                                    title="Delivery Efficiency"
                                    rate={deliveryRate}
                                    color="#a855f7"
                                    formula="Delivered / Total Sent"
                                />
                                <RateCard
                                    title="Message Engagement"
                                    rate={openRate}
                                    color="#f97316"
                                    formula="Opened / Total Delivered"
                                />
                                <RateCard
                                    title="Campaign Success"
                                    rate={completionRate}
                                    color="#14b8a6"
                                    formula="Completed / Total Recipients"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard
                                    title="Messages Sent"
                                    value={sent}
                                    total={stats.total}
                                    icon={Send}
                                    color="#22c55e"
                                    description="Successfully pushed to gateway"
                                />
                                <MetricCard
                                    title="Conversation Started"
                                    value={started}
                                    total={stats.total}
                                    icon={PlayCircle}
                                    color="#6366f1"
                                    description="Users who replied to the bot"
                                />
                                <MetricCard
                                    title="Failed / Bounced"
                                    value={failed}
                                    total={stats.total}
                                    icon={XCircle}
                                    color="#ef4444"
                                    description={
                                        useVerified
                                            ? "Mapped from BSP delivery errors"
                                            : "Errors and delivery failures"
                                    }
                                />
                            </div>
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>
        </div>
    );
}
