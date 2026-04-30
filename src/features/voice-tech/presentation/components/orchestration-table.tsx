import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  MoreHorizontal,
  Trash2,
  Settings,
  Activity,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";

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
}

export function OrchestrationTable({ configs, isLoading }: OrchestrationTableProps) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteRoutingConfig("tenant-ey-001");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton />;
  if (!configs || configs.length === 0) return <EmptyState />;



  return (
    <>
      <div className="bg-white">

        <Table>
          <TableHeader>
            <TableRow className="bg-[#fcfcfc] border-y border-slate-100 hover:bg-[#fcfcfc]">
              <TableHead className="w-[40px] px-6">
                <Checkbox className="rounded-sm size-4 border-slate-300" />
              </TableHead>
              <TableHead className="w-[35%] text-[11px] font-bold uppercase tracking-widest text-slate-500/80 py-5">Orchestration Name</TableHead>
              <TableHead className="w-[12%] text-[11px] font-bold uppercase tracking-widest text-slate-500/80 py-5 text-center">Status</TableHead>
              <TableHead className="w-[12%] text-[11px] font-bold uppercase tracking-widest text-slate-500/80 py-5 text-center">Success Rate</TableHead>
              <TableHead className="w-[12%] text-[11px] font-bold uppercase tracking-widest text-slate-500/80 py-5 text-center">Throughput</TableHead>
              <TableHead className="w-[18%] text-[11px] font-bold uppercase tracking-widest text-slate-500/80 py-5">Last Deployment</TableHead>
              <TableHead className="w-[5%] text-right py-5 px-6">Actions</TableHead>
            </TableRow>

          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout" initial={false}>
              {configs.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer group hover:bg-slate-50/50 transition-colors border-b last:border-0"
                  onClick={() => navigate({ to: `/voice-tech/routings/${c.id}/analytics` as any })}
                >
                  <TableCell className="px-6" onClick={(e) => e.stopPropagation()}>
                    <Checkbox className="rounded-sm size-4 border-slate-200" />
                  </TableCell>
                  <TableCell>
                    <div className="py-2">
                      <p className="font-bold text-[15px] text-slate-900">{c.name}</p>
                      <p className="text-[11px] font-medium text-slate-400/80 uppercase mt-0.5 tracking-tight">
                        ID: ORC-{c.id.slice(0, 4).toUpperCase()}-{c.name.slice(0, 1).toUpperCase()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border-emerald-100/50 border rounded-sm">
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-semibold text-slate-700">99.8%</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-slate-500">2,482 calls/hr</span>
                  </TableCell>
                  <TableCell className="text-[13px] text-slate-500 font-medium">
                    {format(new Date(c.createdAt), "MMM d, HH:mm")}
                  </TableCell>

                  <TableCell className="text-right px-4">
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-md hover:bg-slate-100">
                            <MoreHorizontal className="size-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-xl border-slate-200">
                          <DropdownMenuItem onClick={() => navigate({ to: `/voice-tech/routings/${c.id}/analytics` as any })}>
                            <BarChart3 className="size-4 mr-2" />
                            Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate({ to: `/voice-tech/create` as any, search: { edit: c.id, step: 1 } as any })}>
                            <Settings className="size-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
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
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 bg-white border-t border-slate-100">
        <p className="text-[13px] text-slate-500 font-medium">
          Showing 1 to {configs.length} of {configs.length} orchestrations
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-9 text-[13px] font-semibold px-4 rounded-md border-slate-200 text-slate-600 hover:bg-slate-50">Previous</Button>
          <Button size="sm" className="h-9 w-9 text-[13px] font-bold p-0 rounded-md bg-slate-900 text-white shadow-md">1</Button>
          <Button variant="outline" size="sm" className="h-9 w-9 text-[13px] font-semibold p-0 rounded-md border-slate-200 text-slate-600 hover:bg-slate-50">2</Button>
          <Button variant="outline" size="sm" className="h-9 w-9 text-[13px] font-semibold p-0 rounded-md border-slate-200 text-slate-600 hover:bg-slate-50">3</Button>
          <Button variant="outline" size="sm" className="h-9 text-[13px] font-semibold px-4 rounded-md border-slate-200 text-slate-600 hover:bg-slate-50">Next</Button>
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
      <Button onClick={() => navigate({ to: "/voice-tech/create" })} className="gap-2 shadow-lg shadow-primary/20 px-6">
        <ChevronRight className="size-4" />
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
