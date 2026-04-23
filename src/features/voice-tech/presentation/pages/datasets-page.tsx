import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Database,
  Plus,
  Tag,
  Trash2,
  Upload,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { CsvUploadPanel } from "../components/ingest/csv-upload-panel";
import {
  useDeleteEntityType,
  useEntityTypes,
  useVoiceTechAttributes,
} from "../../api/voice-tech-queries";
import type { EntityAttribute } from "../../types";

const TENANT_ID = "tenant-ey-001";

// Human-friendly labels for attribute types
const TYPE_LABELS: Record<string, string> = {
  enum: "Options",
  string: "Text",
  number: "Number",
  boolean: "Yes / No",
  date: "Date",
};

const TYPE_COLORS: Record<string, string> = {
  enum: "bg-violet-100 text-violet-700",
  string: "bg-sky-100 text-sky-700",
  number: "bg-amber-100 text-amber-700",
  boolean: "bg-emerald-100 text-emerald-700",
  date: "bg-rose-100 text-rose-700",
};

export function DatasetsPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deletingType, setDeletingType] = useState<string | null>(null);
  const [inspectingType, setInspectingType] = useState<string | null>(null);

  const { data: entityTypes = [], isLoading: typesLoading } = useEntityTypes(TENANT_ID);
  const { data: attributes = [], isLoading: attrsLoading } = useVoiceTechAttributes(
    TENANT_ID,
    inspectingType ?? undefined
  );
  const deleteMutation = useDeleteEntityType(TENANT_ID);

  const handleDelete = (name: string) => {
    deleteMutation.mutate(name, {
      onSuccess: () => {
        if (inspectingType === name) setInspectingType(null);
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

        <Sheet open={uploadOpen} onOpenChange={setUploadOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Upload className="size-4" />
              Upload Dataset
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[440px] sm:max-w-[440px]">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <FileSpreadsheet className="size-5" />
                Upload Dataset
              </SheetTitle>
            </SheetHeader>
            <CsvUploadPanel tenantId={TENANT_ID} entityType="" />
          </SheetContent>
        </Sheet>
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
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Dataset Name</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entityTypes.map((type) => (
                <TableRow key={type.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Tag className="size-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{type.name}</p>
                        <p className="text-xs text-muted-foreground">Dataset</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 text-xs"
                    >
                      <CheckCircle2 className="size-3 mr-1" />
                      Ready
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs h-8 cursor-pointer"
                        onClick={() => setInspectingType(inspectingType === type.name ? null : type.name)}
                      >
                        <Eye className="size-3.5" />
                        View Fields
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
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
      )}

      {/* ── Data Fields Inspector (Drawer-style) ───────── */}
      {inspectingType && (
        <div className="border rounded-xl bg-card overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="px-5 py-4 border-b bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tag className="size-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Data Fields</h3>
                <p className="text-xs text-muted-foreground">
                  Inspecting <span className="font-mono font-semibold text-foreground">"{inspectingType}"</span>
                </p>
              </div>
            </div>
            {!attrsLoading && attributes.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {attributes.length} fields
              </Badge>
            )}
          </div>
          <div className="p-4">
            {attrsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : attributes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No fields detected. Try re-uploading the dataset.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {attributes.map((attr: EntityAttribute) => (
                  <div
                    key={attr.key}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <span className="font-mono text-sm text-foreground">{attr.key}</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        TYPE_COLORS[attr.type] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {TYPE_LABELS[attr.type] || attr.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
