import { useState } from "react";
import { Repeat } from "lucide-react";
import { useCampaignRenudges } from "../../../api/campaign-queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TablePagination } from "./table-pagination";

const ITEMS_PER_PAGE = 10;

export function RenudgeHistoryTable({ campaignId }: { campaignId: string }) {
    const { data: renudges = [], isLoading } = useCampaignRenudges(campaignId);
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);

    const stopRenudge = async (renudgeId: string) => {
        try {
            await apiClient.post(`/campaigns/${campaignId}/renudges/${renudgeId}/stop`);
            toast.success("Renudge stopped successfully");
            queryClient.invalidateQueries({ queryKey: ["campaign-renudges", campaignId] });
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to stop renudge");
        }
    };

    if (isLoading) return null;
    if (renudges.length === 0) return null;

    const totalPages = Math.ceil(renudges.length / ITEMS_PER_PAGE);
    const paginatedRenudges = renudges.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Repeat className="size-5 text-primary" />
                    Follow-up Renudges
                </h3>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {renudges.length} total
                </span>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">Delay</th>
                            <th className="px-4 py-3 font-medium">Bot Flow</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Delivery Stats</th>
                            <th className="px-4 py-3 font-medium">Positive / Negative Responses</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedRenudges.map((renudge) => (
                            <tr key={renudge.id} className="hover:bg-muted/10 transition-colors">
                                <td className="px-4 py-3 font-medium text-xs">
                                    {renudge.delayMinutes >= 60
                                        ? `${Math.floor(renudge.delayMinutes / 60)}h ${renudge.delayMinutes % 60}m`
                                        : `${renudge.delayMinutes}m`}
                                    <span className="block text-muted-foreground">after interaction</span>
                                </td>
                                <td className="px-4 py-3">
                                    {renudge.bot?.name || "Unknown Bot"}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        variant={renudge.status === "pending" || renudge.status === "stopped" ? "secondary" : "default"}
                                        className={`capitalize ${renudge.status === "completed" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
                                    >
                                        {renudge.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted-foreground">Sent: <span className="text-foreground">{renudge.sentCount.toLocaleString()}</span></span>
                                        <span className="text-rose-500">Failed: {renudge.failedCount?.toLocaleString() || 0}</span>
                                        <span className="text-emerald-500">Delivered: {renudge.deliveredCount.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3 font-mono">
                                        <span className="text-emerald-500">{renudge.yesCount.toLocaleString()} Yes</span>
                                        <span className="text-rose-500">{renudge.noCount.toLocaleString()} No</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {(renudge.status === "active" || renudge.status === "processing") && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => stopRenudge(renudge.id)}
                                        >
                                            Stop
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={renudges.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                    itemLabel="renudges"
                />
            </div>
        </div>
    );
}
