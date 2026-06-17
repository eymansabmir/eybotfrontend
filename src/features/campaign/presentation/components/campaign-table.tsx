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
    RotateCw,
    Repeat,
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
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            ))}
        </div>
    );
}


// ─── Main Table ──────────────────────────────────────────────
interface CampaignTableProps {
    campaigns: Campaign[] | undefined;
    isLoading: boolean;
    onRerunCampaign?: (campaign: Campaign) => void;
    onLaunchRenudge?: (campaign: Campaign) => void;
}

export function CampaignTable({ campaigns, isLoading, onRerunCampaign, onLaunchRenudge }: CampaignTableProps) {
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
                            <TableHead className="w-[35%]">Title</TableHead>
                            <TableHead className="w-[12%]">Status</TableHead>
                            <TableHead className="w-[12%]">Mode</TableHead>
                            <TableHead className="w-[15%]">User</TableHead>
                            <TableHead className="w-[15%]">Created</TableHead>
                            <TableHead className="w-[11%] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.map((c) => (
                            <TableRow
                                key={c.id}
                                className="cursor-pointer group"
                                onClick={() => navigate({ to: `/campaign/${c.id}/analytics` as string })}
                            >
                                <TableCell className="font-medium">
                                    {c.name}
                                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                                        Flow: {c.flowId.slice(0, 8)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <CampaignStatusBadge status={c.status} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {c.scheduleTime ? "Scheduled" : "Immediate"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {c.flow?.creator?.name || c.flow?.creator?.email?.split('@')[0] || "System"}
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
                                                {(c.status === "draft" || c.status === "scheduled") && (
                                                    <DropdownMenuItem onClick={() => startMutation.mutate(c.id)}>
                                                        <Play className="size-4 mr-2" />
                                                        Start Campaign
                                                    </DropdownMenuItem>
                                                )}
                                                {c.status === "running" && (
                                                    <DropdownMenuItem onClick={() => cancelMutation.mutate(c.id)}>
                                                        <Ban className="size-4 mr-2" />
                                                        Cancel
                                                    </DropdownMenuItem>
                                                )}
                                                {onRerunCampaign && c.dataSourceId === 'CUSTOM_API' && (
                                                    <DropdownMenuItem onClick={() => onRerunCampaign(c)}>
                                                        <RotateCw className="size-4 mr-2" />
                                                        Rerun Campaign
                                                    </DropdownMenuItem>
                                                )}
                                                {onLaunchRenudge && (
                                                    <DropdownMenuItem onClick={() => onLaunchRenudge(c)}>
                                                        <Repeat className="size-4 mr-2" />
                                                        Launch Renudge
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
