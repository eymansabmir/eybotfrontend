import { Link } from "@tanstack/react-router";
import { BarChart3, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignDetailNavProps {
    campaignId: string;
    active: "analytics" | "audit-logs";
}

const TABS = [
    { key: "analytics" as const, label: "Analytics", icon: BarChart3, to: "/campaign/$id/analytics" },
    { key: "audit-logs" as const, label: "Audit Logs", icon: ScrollText, to: "/campaign/$id/audit-logs" },
];

export function CampaignDetailNav({ campaignId, active }: CampaignDetailNavProps) {
    return (
        <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-muted/30 p-1 w-fit">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = active === tab.key;
                return (
                    <Link
                        key={tab.key}
                        to={tab.to}
                        params={{ id: campaignId }}
                        className={cn(
                            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                            isActive
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <Icon className="size-4" />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
