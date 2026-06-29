import type { RecipientStats } from "../types";

export type AnalyticsSection = "overview" | "engagement" | "runs" | "follow-ups" | "recipients";

export const ANALYTICS_TAB_VALUES: AnalyticsSection[] = [
    "overview",
    "engagement",
    "runs",
    "follow-ups",
    "recipients",
];

export function parseAnalyticsTab(tab: unknown): AnalyticsSection {
    if (typeof tab === "string" && ANALYTICS_TAB_VALUES.includes(tab as AnalyticsSection)) {
        return tab as AnalyticsSection;
    }
    return "overview";
}

export function resolveCampaignMetricValues(stats: RecipientStats) {
    const verified = stats.verified;
    const useVerified = stats.analyticsSource === "verified" && Boolean(verified);

    const breakdownFailed =
        stats.failureBreakdown?.byCode.reduce((sum, row) => sum + row.count, 0) ?? 0;

    const sent = useVerified && verified ? verified.sent : stats.sent;
    const delivered = useVerified && verified ? verified.delivered : stats.delivered;
    const read = useVerified && verified ? verified.read : (stats.opened ?? stats.read ?? 0);
    const started = useVerified && verified ? verified.replied : (stats.started ?? stats.replied ?? 0);
    const failed = Math.max(
        useVerified && verified ? verified.failed : stats.failed,
        breakdownFailed,
    );

    const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
    const openRate = delivered > 0 ? (read / delivered) * 100 : 0;
    const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

    return {
        sent,
        delivered,
        read,
        started,
        failed,
        deliveryRate,
        openRate,
        completionRate,
        useVerified,
    };
}
