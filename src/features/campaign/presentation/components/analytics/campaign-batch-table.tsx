import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    Calendar,
    Activity,
    ChevronRight,
} from "lucide-react";
import { useCampaignBatches } from "../../../api/campaign-queries";
import { TablePagination } from "./table-pagination";
import type { AnalyticsSection } from "../../../lib/campaign-analytics-metrics";

interface CampaignBatchTableProps {
    campaignId: string;
    campaignName?: string;
    returnTab?: AnalyticsSection;
}

const ITEMS_PER_PAGE = 10;

function MetricCell({ value, total }: { value: number; total: number }) {
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
    return (
        <div className="font-mono text-xs">
            <div className="font-semibold text-foreground tabular-nums">{value.toLocaleString()}</div>
            <div className="text-muted-foreground tabular-nums">{pct}%</div>
        </div>
    );
}

export function CampaignBatchTable({ campaignId, campaignName, returnTab = "runs" }: CampaignBatchTableProps) {
    const navigate = useNavigate();
    const { data: fetchedBatches = [], isLoading } = useCampaignBatches(campaignId);
    const batches = [...fetchedBatches].sort((a, b) => b.launchedAt.getTime() - a.launchedAt.getTime());

    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(batches.length / ITEMS_PER_PAGE);
    const paginatedBatches = batches.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (isLoading && batches.length === 0) {
        return <div className="animate-pulse h-64 bg-muted rounded-2xl border border-border shadow-sm" />;
    }

    if (batches.length === 0) {
        return null;
    }

    const openBatchAnalytics = (batchId: string) => {
        navigate({
            to: "/campaign/$id/analytics/batch/$versionId",
            params: { id: campaignId, versionId: batchId },
            search: { tab: returnTab },
        });
    };

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Activity className="size-5 text-primary" />
                        Campaign Launch History (Runs)
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Click a run to open full analytics for that batch.
                    </p>
                </div>
                <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    Total Runs: {batches.length}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[1024px]">
                    <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-4 rounded-tl-lg">Run</th>
                            <th className="px-4 py-4">Status</th>
                            <th className="px-4 py-4">Recipients</th>
                            <th className="px-4 py-4">Sent</th>
                            <th className="px-4 py-4">Delivered</th>
                            <th className="px-4 py-4">Opened</th>
                            <th className="px-4 py-4">Started</th>
                            <th className="px-4 py-4">Completed</th>
                            <th className="px-4 py-4 rounded-tr-lg w-12" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedBatches.map((batch) => {
                            const stats = batch.analytics ?? {
                                total: batch.targetCount,
                                sent: batch.successCount,
                                delivered: 0,
                                opened: 0,
                                started: 0,
                                completed: 0,
                                failed: batch.failedCount,
                                pending: 0,
                                read: 0,
                                replied: 0,
                            };

                            return (
                                <tr
                                    key={batch.id}
                                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                                    onClick={() => openBatchAnalytics(batch.id)}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-background border border-border p-2 rounded-lg text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                                                <Calendar className="size-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                                                    {campaignName
                                                        ? `${campaignName} - Run ${batch.versionNumber ?? "—"}`
                                                        : `Run #${batch.versionNumber ?? "—"}`}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <Clock className="size-3" />
                                                    {format(batch.startedAt ?? batch.launchedAt, "MMM dd, yyyy · hh:mm a")}
                                                </div>
                                                {batch.endedAt && (
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                        <CheckCircle2 className="size-3" />
                                                        Ended {format(batch.endedAt, "MMM dd, yyyy · hh:mm a")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
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
                                        {stats.failed > 0 && (
                                            <div className="text-xs text-red-500 mt-1 font-medium">
                                                {stats.failed.toLocaleString()} failed
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <MetricCell value={stats.total} total={stats.total} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <MetricCell value={stats.sent} total={stats.total} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <MetricCell value={stats.delivered} total={stats.total} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <MetricCell value={stats.opened} total={stats.total} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <MetricCell value={stats.started} total={stats.total} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <MetricCell value={stats.completed} total={stats.total} />
                                    </td>
                                    <td className="px-4 py-4 text-muted-foreground group-hover:text-primary">
                                        <ChevronRight className="size-4" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={batches.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemLabel="runs"
            />
        </div>
    );
}
