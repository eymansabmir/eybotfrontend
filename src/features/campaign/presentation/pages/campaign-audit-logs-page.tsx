import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
    AlertCircle,
    AlertTriangle,
    Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { useCampaignPolling, useCampaignAuditLogs } from "../../api/campaign-queries";
import { CampaignStatusBadge } from "../components/campaign-status-badge";
import { CampaignDetailNav } from "../components/campaign-detail-nav";
import type { CampaignAuditLogFilter } from "../../types";

const LEVEL_STYLES: Record<string, string> = {
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const LEVEL_ICONS: Record<string, typeof Info> = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
};

const CATEGORY_OPTIONS = [
    "Queued",
    "Sent",
    "Delivered",
    "Read",
    "Dropped",
    "Not Sent",
    "Not delivered",
    "Others",
];

export function CampaignAuditLogsPage() {
    const { id } = useParams({ strict: false });
    const navigate = useNavigate();

    const [filter, setFilter] = useState<CampaignAuditLogFilter>({
        limit: 25,
        offset: 0,
    });

    const { data: campaign, isLoading: isLoadingCampaign } = useCampaignPolling(id ?? "", true);
    const { data, isLoading } = useCampaignAuditLogs(id, filter);

    const totalPages = data ? Math.ceil(data.total / (filter.limit ?? 25)) : 0;
    const currentPage = Math.floor((filter.offset ?? 0) / (filter.limit ?? 25)) + 1;

    const handlePageChange = (page: number) => {
        setFilter((prev) => ({ ...prev, offset: (page - 1) * (prev.limit ?? 25) }));
    };

    const updateFilter = (patch: Partial<CampaignAuditLogFilter>) => {
        setFilter((prev) => ({ ...prev, ...patch, offset: 0 }));
    };

    if (isLoadingCampaign || !campaign) {
        return <AuditLogsSkeleton />;
    }

    const summary = data?.summary;

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-background/50 hover:bg-background shadow-sm"
                        onClick={() => navigate({ to: "/campaign" })}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-foreground tracking-tight">{campaign.name}</h1>
                            <CampaignStatusBadge status={campaign.status} />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Delivery audit trail
                        </p>
                    </div>
                </div>
            </div>

            <CampaignDetailNav campaignId={id as string} active="audit-logs" />

            {/* Consolidated count summary */}
            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    <SummaryBadge label="Total Events" value={summary.total} />
                    <SummaryBadge label="Info" value={summary.byLevel.info ?? 0} variant="info" />
                    <SummaryBadge label="Warnings" value={summary.byLevel.warning ?? 0} variant="warning" />
                    <SummaryBadge label="Errors" value={summary.byLevel.error ?? 0} variant="error" />
                    <SummaryBadge
                        label="Failed"
                        value={summary.byStatus.failed ?? 0}
                        variant="error"
                    />
                    <SummaryBadge
                        label="Delivered"
                        value={summary.byStatus.delivered ?? 0}
                        variant="info"
                    />
                </div>
            )}

            <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm ring-1 ring-border">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
                        <Select
                            value={filter.level ?? "all"}
                            onValueChange={(v) => updateFilter({ level: v === "all" ? undefined : v })}
                        >
                            <SelectTrigger className="w-36 bg-background/50 border-border/50">
                                <Filter className="mr-2 size-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="info">Info</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filter.category ?? "all"}
                            onValueChange={(v) => updateFilter({ category: v === "all" ? undefined : v })}
                        >
                            <SelectTrigger className="w-44 bg-background/50 border-border/50">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {CATEGORY_OPTIONS.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filter.status ?? "all"}
                            onValueChange={(v) => updateFilter({ status: v === "all" ? undefined : v })}
                        >
                            <SelectTrigger className="w-40 bg-background/50 border-border/50">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="read">Read</SelectItem>
                                <SelectItem value="replied">Replied</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filter.eventType ?? "all"}
                            onValueChange={(v) => updateFilter({ eventType: v === "all" ? undefined : v })}
                        >
                            <SelectTrigger className="w-44 bg-background/50 border-border/50">
                                <SelectValue placeholder="Event Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="delivery_status">Delivery Status</SelectItem>
                                <SelectItem value="inbound">Inbound Reply</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-xl border border-border/50 bg-background/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[160px]">Time</TableHead>
                                    <TableHead className="w-[90px]">Level</TableHead>
                                    <TableHead className="w-[120px]">Category</TableHead>
                                    <TableHead className="w-[90px]">Status</TableHead>
                                    <TableHead className="w-[80px]">Code</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="w-[120px]">Message ID</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            {Array.from({ length: 7 }).map((_, j) => (
                                                <TableCell key={j}>
                                                    <Skeleton className="h-4 w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : data?.logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No audit logs yet. Enable{" "}
                                            <code className="text-xs bg-muted px-1 rounded">ANALYTICS_PIPELINE_ENABLED</code>{" "}
                                            and send campaign messages to start recording delivery events.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.logs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold">
                                                        {format(new Date(log.createdAt), "MMM d, yyyy")}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {format(new Date(log.createdAt), "HH:mm:ss")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <LevelBadge level={log.level} />
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-medium">{log.category ?? "-"}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] uppercase">
                                                    {log.status ?? "-"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                    {log.mappedErrorCode ?? log.channelErrorCode ?? "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-[280px]">
                                                <p className="text-xs text-muted-foreground truncate" title={log.reason ?? undefined}>
                                                    {log.reason ?? "-"}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className="font-mono text-[10px] text-muted-foreground truncate block max-w-[120px]"
                                                    title={log.messageId ?? undefined}
                                                >
                                                    {log.messageId ? `${log.messageId.slice(0, 12)}…` : "-"}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <p className="text-xs text-muted-foreground">
                            Showing {data?.logs.length ?? 0} of {data?.total ?? 0} events
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={currentPage === 1 || isLoading}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <div className="text-xs font-medium px-2">
                                Page {currentPage} of {Math.max(totalPages, 1)}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={currentPage >= totalPages || isLoading}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function LevelBadge({ level }: { level: string }) {
    const Icon = LEVEL_ICONS[level] ?? Info;
    return (
        <Badge
            variant="outline"
            className={cn("text-[10px] font-bold uppercase tracking-wider gap-1", LEVEL_STYLES[level] ?? "bg-muted")}
        >
            <Icon className="size-3" />
            {level}
        </Badge>
    );
}

function SummaryBadge({
    label,
    value,
    variant,
}: {
    label: string;
    value: number;
    variant?: "info" | "warning" | "error";
}) {
    const styles =
        variant === "error"
            ? "border-red-200 bg-red-50 dark:bg-red-950/20"
            : variant === "warning"
              ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20"
              : variant === "info"
                ? "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
                : "border-border bg-card";

    return (
        <div className={cn("rounded-xl border p-4 shadow-sm", styles)}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-black tabular-nums">{value.toLocaleString()}</p>
        </div>
    );
}

function AuditLogsSkeleton() {
    return (
        <div className="space-y-8 pb-12 animate-pulse">
            <div className="flex items-center gap-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48 rounded-lg" />
                    <Skeleton className="h-3.5 w-32 rounded" />
                </div>
            </div>
            <Skeleton className="h-10 w-64 rounded-xl" />
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
            </div>
            <Skeleton className="h-96 rounded-xl" />
        </div>
    );
}
