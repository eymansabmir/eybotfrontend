import {
    CheckCircle2,
    Clock,
    Mail,
    MailCheck,
    MessageSquare,
    Send,
    XCircle,
} from "lucide-react";
import type { RecipientStatus } from "../../../types";

const STATUS_CONFIG: Record<
    RecipientStatus,
    { label: string; className: string; icon: typeof CheckCircle2 }
> = {
    pending: {
        label: "Pending",
        className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        icon: Clock,
    },
    sent: {
        label: "Sent",
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        icon: Send,
    },
    delivered: {
        label: "Delivered",
        className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        icon: Mail,
    },
    read: {
        label: "Read",
        className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
        icon: MailCheck,
    },
    replied: {
        label: "Replied",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        icon: MessageSquare,
    },
    completed: {
        label: "Completed",
        className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
        icon: CheckCircle2,
    },
    failed: {
        label: "Failed",
        className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        icon: XCircle,
    },
};

export function RecipientStatusBadge({ status }: { status: RecipientStatus }) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    const Icon = config.icon;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.className}`}
        >
            <Icon className="size-3.5" />
            {config.label}
        </span>
    );
}
