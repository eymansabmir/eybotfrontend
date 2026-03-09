import { cn } from "@/lib/utils";
import type { CampaignStatus } from "../../types";
import {
    Clock,
    CalendarClock,
    RefreshCw,
    CheckCircle2,
    XCircle,
    PauseCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<
    CampaignStatus,
    { label: string; bg: string; text: string; icon: typeof Clock }
> = {
    DRAFT: {
        label: "Draft",
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-300",
        icon: Clock,
    },
    PENDING: {
        label: "Pending",
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-400",
        icon: Clock,
    },
    SCHEDULED: {
        label: "Scheduled",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-400",
        icon: CalendarClock,
    },
    RUNNING: {
        label: "Running",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-800 dark:text-orange-400",
        icon: RefreshCw,
    },
    COMPLETED: {
        label: "Completed",
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-400",
        icon: CheckCircle2,
    },
    FAILED: {
        label: "Failed",
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-400",
        icon: XCircle,
    },
    PAUSED: {
        label: "Paused",
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-700 dark:text-gray-300",
        icon: PauseCircle,
    },
};

interface CampaignStatusBadgeProps {
    status: CampaignStatus;
    className?: string;
}

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
    const Icon = config.icon;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                config.bg,
                config.text,
                className
            )}
        >
            <Icon className="size-3" />
            {config.label}
        </span>
    );
}
