import { useMemo, useState } from "react";
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
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  const [searchQuery, setSearchQuery] = useState("");

  const filteredDatasets = useMemo(() => {
    return entityTypes.filter(type => 
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entityTypes, searchQuery]);

  return (
    <div className="bg-background -mx-8 -mt-8 px-8 pt-8 min-h-screen">
      <div className="space-y-8 pb-10 max-w-[1400px] mx-auto">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/voice-tech">
            <Button variant="ghost" size="icon" className="rounded-full bg-card border border-border shadow-sm hover:bg-muted">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Datasets
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Import and manage your enterprise data sources to power intelligent routing rules.
            </p>
          </div>
        </div>

        <Button 
          onClick={() => setUploadOpen(true)}
          className="gap-2 h-10 px-6 bg-primary text-primary-foreground hover:opacity-90 shadow-sm rounded-lg text-xs font-bold uppercase tracking-wide"
        >
          <Upload className="size-3.5" />
          Upload Dataset
        </Button>

        <DatasetUploadSheet 
          open={uploadOpen} 
          onOpenChange={setUploadOpen} 
          tenantId={TENANT_ID} 
        />
      </div>

      {/* ── Datasets Table ────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search datasets by name or ID..." 
              className="pl-10 h-11 bg-background border-border rounded-md text-sm focus-visible:ring-1 focus-visible:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Available Datasets ({filteredDatasets.length})
          </div>
        </div>

        {typesLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : entityTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border">
              <Database className="size-8 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">No datasets found</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Upload your first CSV file to get started. Data fields will be automatically detected.
            </p>
            <Button 
              onClick={() => setUploadOpen(true)} 
              className="gap-2 bg-primary text-primary-foreground hover:opacity-90 shadow-sm rounded-lg text-xs font-bold uppercase tracking-wide px-6"
            >
              <Upload className="size-3.5" />
              Upload First Dataset
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12">Dataset Name</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDatasets.map((type) => (
                  <TableRow key={type.id} className="group hover:bg-muted/50 border-b border-border last:border-0 transition-colors">
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border">
                          <Tag className="size-4.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{type.name}</p>
                          <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-tight mt-0.5">ID: {type.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="size-3 mr-1.5" />
                        Active
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-4 text-xs font-bold text-foreground hover:bg-muted rounded-lg transition-all"
                          onClick={() => navigate({ to: `/voice-tech/datasets/${type.name}` as any })}
                        >
                          <Eye className="size-3.5 mr-2" />
                          View Fields
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-all"
                          onClick={() => setDeletingType(type.name)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

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
    </div>
  );
}
