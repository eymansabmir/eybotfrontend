import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Database,
  Tag,
  Trash2,
  Upload,
  Eye,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatasetUploadSheet } from "../components/ingest/dataset-upload-sheet";
import {
  useDeleteEntityType,
  useEntityTypes,
} from "../../api/voice-tech-queries";


const TENANT_ID = "tenant-ey-001";

// Human-friendly labels for attribute types




export function DatasetsPage() {
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deletingType, setDeletingType] = useState<string | null>(null);

  const { data: entityTypes = [], isLoading: typesLoading } = useEntityTypes(TENANT_ID);
  const deleteMutation = useDeleteEntityType(TENANT_ID);

  const handleDelete = (name: string) => {
    deleteMutation.mutate(name, {
      onSuccess: () => {
        setDeletingType(null);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/voice-tech">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Step 1
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Upload Datasets</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Import your data to power routing rules. Each dataset becomes a source for call orchestration.
            </p>
          </div>
        </div>

        <Button 
          onClick={() => setUploadOpen(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 h-11"
        >
          <Upload className="size-4" />
          Upload Dataset
        </Button>

        <DatasetUploadSheet 
          open={uploadOpen} 
          onOpenChange={setUploadOpen} 
          tenantId={TENANT_ID} 
        />
      </div>

      {/* ── Datasets Table ────────────────────────────── */}
      {typesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : entityTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/60 rounded-2xl bg-muted/10">
          <div className="size-16 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
            <Database className="size-8 text-muted-foreground/40" />
          </div>
          <p className="text-base font-semibold text-foreground mb-1">No datasets yet</p>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm text-center">
            Upload your first CSV file to get started. Your data fields will be automatically detected.
          </p>
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Upload className="size-4" />
            Upload Your First Dataset
          </Button>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold px-6">Dataset Name</TableHead>
                  <TableHead className="font-semibold px-6">Status</TableHead>
                  <TableHead className="text-right font-semibold px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entityTypes.map((type) => (
                  <TableRow key={type.id} className="group">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Tag className="size-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{type.name}</p>
                          <p className="text-xs text-muted-foreground">Dataset</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs shrink-0"
                      >
                        <CheckCircle2 className="size-3 mr-1" />
                        Ready
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs h-8 cursor-pointer shrink-0"
                          onClick={() => navigate({ to: `/voice-tech/datasets/${type.name}` as any })}
                        >
                          <Eye className="size-3.5" />
                          View Fields
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                          onClick={() => setDeletingType(type.name)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}



      {/* ── Delete Confirmation ────────────────────────── */}
      <AlertDialog
        open={!!deletingType}
        onOpenChange={(open) => !open && setDeletingType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold text-foreground">"{deletingType}"</span>?
              This will permanently remove all associated records and data fields. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingType && handleDelete(deletingType)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
