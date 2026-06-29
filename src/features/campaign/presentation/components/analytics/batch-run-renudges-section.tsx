import { format } from "date-fns";
import { Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RenudgeForBatch } from "../../../types";

function formatDelay(minutes: number) {
    if (minutes >= 60) {
        return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
}

interface BatchRunRenudgesSectionProps {
    renudges: RenudgeForBatch[];
}

export function BatchRunRenudgesSection({ renudges }: BatchRunRenudgesSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Repeat className="size-5 text-primary" />
                    Follow-up Renudges
                </h3>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {renudges.length} for this run
                </span>
            </div>

            {renudges.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
                    No follow-up renudges for this run.
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Launched</th>
                                <th className="px-4 py-3 font-medium">Delay</th>
                                <th className="px-4 py-3 font-medium">Bot Flow</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Delivery Stats</th>
                                <th className="px-4 py-3 font-medium">Yes / No</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {renudges.map((renudge) => (
                                <tr key={renudge.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                                        {format(new Date(renudge.createdAt), "MMM dd, yyyy · hh:mm a")}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-xs">
                                        {formatDelay(renudge.delayMinutes)}
                                        <span className="block text-muted-foreground">after interaction</span>
                                    </td>
                                    <td className="px-4 py-3">{renudge.bot?.name || "Unknown Bot"}</td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={renudge.status === "stopped" ? "secondary" : "default"}
                                            className={`capitalize ${renudge.status === "completed" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                                        >
                                            {renudge.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-muted-foreground">
                                                Sent:{" "}
                                                <span className="text-foreground">{renudge.sentCount.toLocaleString()}</span>
                                            </span>
                                            <span className="text-rose-500">Failed: {renudge.failedCount.toLocaleString()}</span>
                                            <span className="text-emerald-500">
                                                Delivered: {renudge.deliveredCount.toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3 font-mono text-xs">
                                            <span className="text-emerald-500">{renudge.yesCount.toLocaleString()} Yes</span>
                                            <span className="text-rose-500">{renudge.noCount.toLocaleString()} No</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
