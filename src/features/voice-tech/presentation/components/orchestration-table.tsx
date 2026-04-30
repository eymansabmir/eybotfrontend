import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  Activity,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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
import { Badge } from "@/components/ui/badge";

import type { RoutingConfigSummary } from "../../types";
import { useDeleteRoutingConfig } from "../../api/voice-tech-queries";

interface OrchestrationTableProps {
  configs: RoutingConfigSummary[] | undefined;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export function OrchestrationTable({ 
  configs, 
  isLoading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange
}: OrchestrationTableProps) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteRoutingConfig("tenant-ey-001");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton />;
  if (!configs || configs.length === 0) return <EmptyState />;



  return (
    <>
    <div className="bg-card">

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-y border-border hover:bg-muted/30">
              <TableHead className="w-[40px] px-6">
                <Checkbox className="rounded-sm size-4 border-slate-300" />
              </TableHead>
              <TableHead className="w-[35%] text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-5">Orchestration Name</TableHead>
              <TableHead className="w-[12%] text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-5 text-center">Status</TableHead>
              <TableHead className="w-[12%] text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-5 text-center">Success Rate</TableHead>
              <TableHead className="w-[12%] text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-5 text-center">Throughput</TableHead>
              <TableHead className="w-[18%] text-[11px] font-bold uppercase tracking-widest text-muted-foreground py-5">Last Deployment</TableHead>
              <TableHead className="w-[5%] text-right py-5 px-6">Actions</TableHead>
            </TableRow>

          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout" initial={false}>
              {configs.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer group hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                  onClick={() => navigate({ to: `/voice-tech/routings/${c.id}/analytics` as any })}
                >
                  <TableCell className="px-6" onClick={(e) => e.stopPropagation()}>
                    <Checkbox className="rounded-sm size-4 border-border" />
                  </TableCell>
                  <TableCell>
                    <div className="py-2">
                      <p className="font-bold text-[15px] text-foreground">{c.name}</p>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase mt-0.5 tracking-tight">
                        ID: ORC-{c.id.slice(0, 4).toUpperCase()}-{c.name.slice(0, 1).toUpperCase()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 border rounded-sm">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-semibold text-foreground">
                      {c.successRate !== undefined && c.throughput !== undefined && c.throughput > 0 
                        ? `${c.successRate}%` 
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {c.throughput !== undefined && c.throughput > 0 
                        ? `${c.throughput.toLocaleString()} calls` 
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-[13px] text-muted-foreground font-medium">
                    {format(new Date(c.createdAt), "MMM d, HH:mm")}
                  </TableCell>

                  <TableCell className="text-right px-4">
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-md hover:bg-muted">
                            <MoreHorizontal className="size-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-xl border-border bg-popover">
                          <DropdownMenuItem className="text-foreground" onClick={() => navigate({ to: `/voice-tech/routings/${c.id}/analytics` as any })}>
                            <BarChart3 className="size-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-foreground" onClick={() => navigate({ to: `/voice-tech/create` as any, search: { edit: c.id, step: 1 } as any })}>
                            <Pencil className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
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
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 bg-card border-t border-border">
        <p className="text-[13px] text-muted-foreground font-medium">
          Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} orchestrations
        </p>
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 text-[13px] font-semibold px-4 rounded-md border-border text-foreground hover:bg-muted"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.ceil(totalCount / pageSize) }).map((_, i) => {
            const pageNum = i + 1;
            // Only show a few pages around current if many
            if (Math.ceil(totalCount / pageSize) > 7) {
               if (pageNum !== 1 && pageNum !== Math.ceil(totalCount / pageSize) && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) return <span key={i} className="px-2 text-muted-foreground/30">...</span>;
                  return null;
               }
            }
            
            return (
              <Button 
                key={i}
                size="sm" 
                className={cn(
                  "h-9 w-9 text-[13px] font-bold p-0 rounded-md transition-all duration-200",
                  currentPage === pageNum 
                    ? "bg-primary text-primary-foreground shadow-md scale-105" 
                    : "bg-background text-foreground border border-border hover:bg-muted"
                )}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 text-[13px] font-semibold px-4 rounded-md border-border text-foreground hover:bg-muted"
            disabled={currentPage === Math.ceil(totalCount / pageSize) || totalCount === 0}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>


      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Orchestration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this orchestration? This will permanently remove all associated routing rules.
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

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-muted/5 border-muted-foreground/20">
      <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-sm">
        <Activity className="size-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground">No Orchestrations Found</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm text-center mb-6">
        Get started by creating your first voice orchestration plan.
      </p>
      <Button 
        onClick={() => navigate({ to: "/voice-tech/create" })} 
        className="gap-2 px-6 bg-primary text-primary-foreground hover:opacity-90 shadow-sm rounded-lg text-xs font-bold uppercase tracking-wide"
      >
        <Plus className="size-3.5" />
        Create Orchestration
      </Button>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <div className="grid grid-cols-5 gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="size-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-24 flex-1" />
            <Skeleton className="h-4 w-16 flex-1" />
            <Skeleton className="h-4 w-24 flex-1" />
            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
