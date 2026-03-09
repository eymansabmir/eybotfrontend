import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
    BarChart3,
    MoreHorizontal,
    Trash2,
    Play,
    Ban,
    MegaphoneIcon,
} from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

import type { Campaign } from "../../types";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { useDeleteCampaign, useStartCampaign, useCancelCampaign } from "../../api/campaign-queries";

// ─── Empty State ─────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-2xl bg-primary/10 p-4 text-primary mb-4">
                <MegaphoneIcon className="size-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No campaigns yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Create your first campaign to start reaching your audience at scale.
            </p>
        </div>
    );
}

// ─── Loading Skeleton ────────────────────────────────────────
function TableSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-2 w-24 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            ))}
        </div>
    );
}

// ─── Progress Bar ────────────────────────────────────────────
function ProgressBar({ sent, total }: { sent: number; total: number }) {
    const pct = total > 0 ? Math.round((sent / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
                {sent.toLocaleString()}/{total.toLocaleString()}
            </span>
        </div>
    );
}

// ─── Main Table ──────────────────────────────────────────────
interface CampaignTableProps {
    campaigns: Campaign[] | undefined;
    isLoading: boolean;
}

export function CampaignTable({ campaigns, isLoading }: CampaignTableProps) {
    const navigate = useNavigate();
    const deleteMutation = useDeleteCampaign();
    const startMutation = useStartCampaign();
    const cancelMutation = useCancelCampaign();

    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    if (isLoading) return <TableSkeleton />;
    if (!campaigns || campaigns.length === 0) return <EmptyState />;

    return (
        <>
            <div className="rounded-xl border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[28%]">Title</TableHead>
                            <TableHead className="w-[12%]">Status</TableHead>
                            <TableHead className="w-[10%]">Mode</TableHead>
                            <TableHead className="w-[10%] text-right">Recipients</TableHead>
                            <TableHead className="w-[20%]">Progress</TableHead>
                            <TableHead className="w-[12%]">Created</TableHead>
                            <TableHead className="w-[8%] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.map((c) => (
                            <TableRow
                                key={c.id}
                                className="cursor-pointer group"
                                onClick={() => navigate({ to: `/campaign/${c.id}/analytics` as string })}
                            >
                                <TableCell className="font-medium">{c.title}</TableCell>
                                <TableCell>
                                    <CampaignStatusBadge status={c.status} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {c.executionMode === "NOW" ? "Immediate" : "Scheduled"}
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    {c.totalRecipients.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <ProgressBar sent={c.sentCount} total={c.totalRecipients} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {format(new Date(c.createdAt), "MMM d, yyyy")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => navigate({ to: `/campaign/${c.id}/analytics` as string })}
                                            aria-label="View analytics"
                                        >
                                            <BarChart3 className="size-4" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {(c.status === "DRAFT" || c.status === "SCHEDULED") && (
                                                    <DropdownMenuItem onClick={() => startMutation.mutate(c.id)}>
                                                        <Play className="size-4 mr-2" />
                                                        Start Campaign
                                                    </DropdownMenuItem>
                                                )}
                                                {(c.status === "RUNNING" || c.status === "PENDING") && (
                                                    <DropdownMenuItem onClick={() => cancelMutation.mutate(c.id)}>
                                                        <Ban className="size-4 mr-2" />
                                                        Cancel
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeleteTarget(c.id)}
                                                >
                                                    <Trash2 className="size-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All recipients and analytics data will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteTarget) deleteMutation.mutate(deleteTarget);
                                setDeleteTarget(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
