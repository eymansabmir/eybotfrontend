import { format } from "date-fns";
import { Info } from "lucide-react";
import type { CampaignAnalyticsDateFilter } from "../../../types";

interface CampaignAnalyticsScopeBannerProps {
    dateFilter: CampaignAnalyticsDateFilter;
    scope: "filtered" | "lifetime";
}

export function CampaignAnalyticsScopeBanner({ dateFilter, scope }: CampaignAnalyticsScopeBannerProps) {
    const hasDateFilter = Boolean(dateFilter.startDate || dateFilter.endDate);

    if (scope === "filtered" && hasDateFilter) {
        return (
            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                <Info className="size-4 text-primary shrink-0 mt-0.5" />
                <p>
                    Metrics reflect recipients added
                    {dateFilter.startDate && ` from ${format(new Date(dateFilter.startDate), "MMM d, yyyy")}`}
                    {dateFilter.endDate && ` to ${format(new Date(dateFilter.endDate), "MMM d, yyyy")}`}.
                </p>
            </div>
        );
    }

    if (scope === "lifetime" && hasDateFilter) {
        return (
            <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                <Info className="size-4 shrink-0 mt-0.5" />
                <p>Run and follow-up history covers the full campaign lifetime (not limited by the date filter).</p>
            </div>
        );
    }

    return null;
}
