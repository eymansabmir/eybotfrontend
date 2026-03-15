import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { RecipientStats } from "../../../types";

interface StatsTableProps {
    stats: RecipientStats;
}

// Semantic colors tell a delivery journey story:
// Initiated (slate) → Sent (blue) → Delivered (violet) → Opened (orange)
// → Conversation Started (indigo) → Completed (emerald) / Failed (red)
// Colors are muted/400 level — not neon — to avoid visual overload.
// Row background only on terminal states (completed=green, failed=red) as before.
const STATUS_ROWS: Array<{
    key: keyof RecipientStats;
    label: string;
    description: string;
    dotColor: string;
    barColor: string;
    rowHighlight?: string;
}> = [
    {
        key: "initiated",
        label: "Initiated",
        description: "Queued and ready to send",
        dotColor: "bg-slate-400",
        barColor: "bg-slate-400",
    },
    {
        key: "sent",
        label: "Sent",
        description: "Pushed to Meta gateway",
        dotColor: "bg-blue-400",
        barColor: "bg-blue-400",
    },
    {
        key: "delivered",
        label: "Delivered",
        description: "Confirmed received on device",
        dotColor: "bg-violet-400",
        barColor: "bg-violet-400",
    },
    {
        key: "opened",
        label: "Opened",
        description: "Read by the recipient",
        dotColor: "bg-orange-400",
        barColor: "bg-orange-400",
    },
    {
        key: "started",
        label: "Conversation Started",
        description: "Replied to first bot message",
        dotColor: "bg-indigo-400",
        barColor: "bg-indigo-400",
    },
    {
        key: "completed",
        label: "Completed Flow",
        description: "Finished bot journey end-to-end",
        dotColor: "bg-emerald-500",
        barColor: "bg-emerald-500",
        rowHighlight: "bg-emerald-50/60 dark:bg-emerald-950/20",
    },
    {
        key: "failed",
        label: "Failed / Bounced",
        description: "Delivery or send error",
        dotColor: "bg-red-500",
        barColor: "bg-red-500",
        rowHighlight: "bg-red-50/60 dark:bg-red-950/20",
    },
];

export function StatsTable({ stats }: StatsTableProps) {
    const total = stats.total || 1;

    return (
        <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/20">
            <div className="px-6 pt-6 pb-2">
                <h3 className="text-lg font-bold text-foreground">Detailed Statistics</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Status breakdown across all campaign recipients
                </p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[45%]">Status</TableHead>
                        <TableHead className="w-[15%] text-right">Count</TableHead>
                        <TableHead className="w-[40%]">Distribution</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {STATUS_ROWS.map((row) => {
                        const value = stats[row.key] ?? 0;
                        const pct = ((value / total) * 100).toFixed(1);
                        const hasValue = value > 0;

                        return (
                            <TableRow
                                key={row.key}
                                className={cn(
                                    "transition-colors",
                                    hasValue && row.rowHighlight
                                )}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={cn(
                                                "size-2.5 rounded-full flex-shrink-0 transition-opacity",
                                                row.dotColor,
                                                !hasValue && "opacity-25"
                                            )}
                                        />
                                        <div>
                                            <p className={cn(
                                                "text-sm font-medium leading-tight",
                                                !hasValue && "text-muted-foreground"
                                            )}>
                                                {row.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground/60 hidden sm:block mt-0.5">
                                                {row.description}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className={cn(
                                    "text-right tabular-nums font-semibold text-sm",
                                    !hasValue ? "text-muted-foreground/40" : "text-foreground"
                                )}>
                                    {value.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 flex-1 max-w-36 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-700",
                                                    hasValue ? row.barColor : "bg-transparent"
                                                )}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-xs tabular-nums w-12 text-right",
                                            hasValue
                                                ? "text-foreground font-medium"
                                                : "text-muted-foreground/40"
                                        )}>
                                            {pct}%
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
