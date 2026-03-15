import type { Campaign, RecipientStats, NpsData } from "../types";

export function exportCampaignCsv(
    campaign: Campaign,
    stats: RecipientStats,
    nps?: NpsData
): void {
    const lines: string[] = [];

    lines.push("Campaign Analytics Export");
    lines.push("");

    // Overview
    lines.push("CAMPAIGN OVERVIEW");
    lines.push("Field,Value");
    lines.push(`Campaign Name,${escCsv(campaign.name)}`);
    lines.push(`Campaign ID,${campaign.id}`);
    lines.push(`Status,${campaign.status}`);
    lines.push(`Execution Mode,${campaign.scheduleTime ? 'Scheduled' : 'Immediate'}`);
    lines.push(`Created,${campaign.createdAt}`);
    lines.push(`Total Recipients,${stats.total}`);
    lines.push("");

    // Analytics Summary
    lines.push("ANALYTICS SUMMARY");
    lines.push("Metric,Count,Percentage,Description");
    const rows: Array<[string, number, string]> = [
        ["Total Recipients", stats.total, "Total contacts in campaign"],
        ["Initiated", stats.initiated, "Ready for sending"],
        ["Messages Sent", stats.sent, "Successfully pushed to Meta"],
        ["Delivered", stats.delivered, "Confirmed delivered"],
        ["Opened", stats.opened, "Message opened by recipient"],
        ["Started", stats.started, "Began bot flow"],
        ["Completed", stats.completed, "Finished bot flow"],
        ["Failed", stats.failed, "Failed to send"],
    ];

    for (const [label, value, desc] of rows) {
        const pct = stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : "0.0";
        lines.push(`${label},${value},${pct}%,${escCsv(desc)}`);
    }
    lines.push("");

    // Conversion Rates
    lines.push("CONVERSION RATES");
    lines.push("Metric,Value,Formula");
    const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : "0.0";
    const openRate = stats.delivered > 0 ? ((stats.opened / stats.delivered) * 100).toFixed(1) : "0.0";
    const completionRate = stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : "0.0";
    lines.push(`Delivery Rate,${deliveryRate}%,Delivered / Sent`);
    lines.push(`Open Rate,${openRate}%,Opened / Delivered`);
    lines.push(`Completion Rate,${completionRate}%,Completed / Total`);
    lines.push("");

    // NPS
    if (nps) {
        lines.push("NPS ANALYSIS");
        lines.push("Metric,Value");
        lines.push(`NPS Score,${nps.score ?? "N/A"}`);
        lines.push(`Response Rate,${nps.responseRate.toFixed(1)}%`);
        lines.push(`Promoters,${nps.promoters}`);
        lines.push(`Passives,${nps.passives}`);
        lines.push(`Detractors,${nps.detractors}`);
        lines.push("");
        lines.push("NPS Distribution");
        lines.push("Score,Count");
        Object.entries(nps.distribution).forEach(([score, count]) => {
            lines.push(`${score},${count}`);
        });
    }

    // Download
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const sanitized = campaign.name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const shortId = campaign.id.slice(0, 8);
    const ts = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${sanitized}_${shortId}_analytics_${ts}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function escCsv(val: string): string {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
}
