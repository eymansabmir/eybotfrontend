import { useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, XCircle, Clock, Users, Calendar, Activity, ChevronLeft, ChevronRight } from "lucide-react";

// TODO: Replace this with real data fetched from the backend later.
// Currently returning dummy data for the UI as requested.
function fetchDummyBatchData(campaignId: string) {
    return [
        {
            id: "batch_1",
            campaignId: campaignId,
            launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
            targetCount: 2000,
            status: "success",
            successCount: 2000,
            failedCount: 0,
        },
        {
            id: "batch_2",
            campaignId: campaignId,
            launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            targetCount: 10000,
            status: "success",
            successCount: 9980,
            failedCount: 20,
        },
        {
            id: "batch_3",
            campaignId: campaignId,
            launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
            targetCount: 100000,
            status: "success",
            successCount: 99950,
            failedCount: 50,
        },
        {
            id: "batch_4",
            campaignId: campaignId,
            launchedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            targetCount: 50000,
            status: "failed",
            successCount: 10000,
            failedCount: 40000,
        },
        {
            id: "batch_5",
            campaignId: campaignId,
            launchedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            targetCount: 100,
            status: "running",
            successCount: 45,
            failedCount: 0,
        }
    ];
}

interface CampaignBatchTableProps {
    campaignId: string;
}

export function CampaignBatchTable({ campaignId }: CampaignBatchTableProps) {
    const batches = fetchDummyBatchData(campaignId).sort((a, b) => b.launchedAt.getTime() - a.launchedAt.getTime());
    
    // Simple pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(batches.length / itemsPerPage);
    const paginatedBatches = batches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Activity className="size-5 text-primary" />
                        Campaign Launch History (Batches)
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track the historical execution of this campaign across different rate-limit warmup phases.
                    </p>
                </div>
                <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    Total Batches: {batches.length}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-lg">Launch Date & Time</th>
                            <th className="px-6 py-4">Target Audience</th>
                            <th className="px-6 py-4">Delivery Status</th>
                            <th className="px-6 py-4 rounded-tr-lg">Performance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedBatches.map((batch) => (
                            <tr key={batch.id} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-background border border-border p-2 rounded-lg text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                                            <Calendar className="size-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">
                                                {format(batch.launchedAt, "MMM dd, yyyy")}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Clock className="size-3" />
                                                {format(batch.launchedAt, "hh:mm a")}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-foreground">
                                        {batch.targetCount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Recipients</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {batch.status === "success" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium border border-green-500/20">
                                            <CheckCircle2 className="size-3.5" />
                                            Success
                                        </span>
                                    )}
                                    {batch.status === "failed" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium border border-red-500/20">
                                            <XCircle className="size-3.5" />
                                            Failed
                                        </span>
                                    )}
                                    {batch.status === "running" && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-500/20">
                                            <div className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                            In Progress
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-green-600 font-medium">Sent: {batch.successCount.toLocaleString()}</span>
                                            {batch.failedCount > 0 && (
                                                <span className="text-red-500 font-medium">{batch.failedCount.toLocaleString()} fails</span>
                                            )}
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                                            <div 
                                                className="bg-green-500 h-full transition-all duration-500" 
                                                style={{ width: `${(batch.successCount / batch.targetCount) * 100}%` }}
                                            />
                                            {batch.failedCount > 0 && (
                                                <div 
                                                    className="bg-red-500 h-full transition-all duration-500" 
                                                    style={{ width: `${(batch.failedCount / batch.targetCount) * 100}%` }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/10">
                    <span className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, batches.length)}</span> of <span className="font-medium text-foreground">{batches.length}</span> batches
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
