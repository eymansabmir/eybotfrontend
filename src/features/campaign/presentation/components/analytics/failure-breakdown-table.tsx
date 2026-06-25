import { XCircle } from "lucide-react";
import type { FailureBreakdown } from "../../../types";

interface FailureBreakdownTableProps {
    failureBreakdown: FailureBreakdown;
    embedded?: boolean;
}

export function FailureBreakdownTable({ failureBreakdown, embedded }: FailureBreakdownTableProps) {
    if (!failureBreakdown.byCode.length) {
        return null;
    }

    const table = (
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
    );

    if (embedded) {
        return table;
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <XCircle className="size-4 text-red-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Failure Breakdown</h2>
            </div>
            {table}
        </div>
    );
}
