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

const STATUS_ROWS: Array<{
    key: keyof RecipientStats;
    label: string;
    isHighlight?: "green" | "red";
}> = [
        { key: "pending", label: "Pending" },
        { key: "queued", label: "Queued" },
        { key: "initiated", label: "Initiated" },
        { key: "sent", label: "Sent" },
        { key: "delivered", label: "Delivered" },
        { key: "opened", label: "Opened" },
        { key: "started", label: "Started" },
        { key: "completed", label: "Completed", isHighlight: "green" },
        { key: "failed", label: "Failed", isHighlight: "red" },
    ];

export function StatsTable({ stats }: StatsTableProps) {
    const total = stats.total || 1;

    return (
        <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted/20">
            <div className="px-6 pt-6 pb-4">
                <h3 className="text-lg font-bold text-foreground">Detailed Statistics</h3>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[40%]">Status</TableHead>
                        <TableHead className="w-[20%] text-right">Count</TableHead>
                        <TableHead className="w-[40%]">Percentage</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {STATUS_ROWS.map((row) => {
                        const value = stats[row.key];
                        const pct = ((value / total) * 100).toFixed(1);

                        return (
                            <TableRow
                                key={row.key}
                                className={cn(
                                    row.isHighlight === "red" && value > 0 && "bg-red-50/50 dark:bg-red-950/20",
                                    row.isHighlight === "green" && value > 0 && "bg-green-50/50 dark:bg-green-950/20"
                                )}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "size-2 rounded-full",
                                                row.isHighlight === "green" ? "bg-green-500" :
                                                    row.isHighlight === "red" ? "bg-red-500" : "bg-muted-foreground/30"
                                            )}
                                        />
                                        {row.label}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right tabular-nums font-medium">
                                    {value.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 flex-1 max-w-32 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    row.isHighlight === "green" ? "bg-green-500" :
                                                        row.isHighlight === "red" ? "bg-red-500" : "bg-muted-foreground/40"
                                                )}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-sm tabular-nums text-muted-foreground w-14 text-right">
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
