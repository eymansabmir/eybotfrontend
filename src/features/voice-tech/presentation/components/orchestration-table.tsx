import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  MoreHorizontal,
  Trash2,
  GitBranch,
  Database,
  Settings,
  Activity,
  ChevronRight,
  Zap,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

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
  entityTypes: { id: string; name: string }[];
  isLoading: boolean;
}

export function OrchestrationTable({ configs, entityTypes, isLoading }: OrchestrationTableProps) {
  const navigate = useNavigate();
  const deleteMutation = useDeleteRoutingConfig("tenant-ey-001");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  if (isLoading) return <TableSkeleton />;
  if (!configs || configs.length === 0) return <EmptyState />;

  const getDatasetName = (id: string | null) => {
    if (!id) return "No Dataset";
    return entityTypes.find((t) => t.id === id)?.name || "Unknown Dataset";
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm min-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[30%]">Orchestration Name</TableHead>
              <TableHead className="w-[20%]">Dataset</TableHead>
              <TableHead className="w-[15%]">Rules / Status</TableHead>
              <TableHead className="w-[15%]">Created</TableHead>
              <TableHead className="w-[10%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout" initial={false}>
              {configs.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer group hover:bg-muted/30 transition-colors border-b last:border-0"
                  onClick={() => navigate({ to: `/voice-tech/routings/${c.id}/analytics` as any })}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <GitBranch className="size-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">Orchestration Plan</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Database className="size-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {(() => {
                          const ids = (c.entityTypeIds && Array.isArray(c.entityTypeIds) && c.entityTypeIds.length > 0) 
                            ? c.entityTypeIds 
                            : (c.entityTypeId ? [c.entityTypeId] : []);
                          if (ids.length === 0) return "No Dataset";
                          
                          const names = ids.map(id => entityTypes.find(t => t.id === id)?.name || "Unknown");
                          if (names.length <= 2) return names.join(", ");
                          return `${names.slice(0, 2).join(", ")} + ${names.length - 2}`;
                        })()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-[10px] px-1.5 h-5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        Active
                      </Badge>
                    </div>
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
                        onClick={() => navigate({ to: `/voice-tech/routings/${c.id}/analytics` as any })}
                      >
                        <BarChart3 className="size-4 text-muted-foreground hover:text-primary" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate({ to: `/voice-tech/create` as any, search: { edit: c.id, step: 1 } as any })}>
                            <Settings className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate({ to: `/voice-tech/execute` as any, state: { selectedConfigId: c.id, autoDataset: getDatasetName(c.entityTypeId) } as any })}>
                            <Zap className="size-4 mr-2" />
                            Execute
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
