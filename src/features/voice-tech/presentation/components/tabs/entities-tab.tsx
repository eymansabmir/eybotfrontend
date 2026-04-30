import { useState } from "react";
import { Database, Plus, Tag, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CsvUploadPanel } from "../ingest/csv-upload-panel";
import { useDeleteEntityType, useEntityTypes, useVoiceTechAttributes } from "../../../api/voice-tech-queries";
import type { EntityAttribute } from "../../../types";

interface EntitiesTabProps {
  tenantId: string;
  entityType: string;
  onEntityTypeChange: (value: string) => void;
}

// Human-friendly labels for technical types
const TYPE_LABELS: Record<string, string> = {
  enum:    "Options",
  string:  "Text",
  number:  "Number",
  boolean: "Yes/No",
  date:    "Date",
};

// Maps attribute type to a short readable label + colour
const TYPE_COLORS: Record<string, string> = {
  enum:    "bg-violet-100 text-violet-700",
  string:  "bg-sky-100 text-sky-700",
  number:  "bg-amber-100 text-amber-700",
  boolean: "bg-emerald-100 text-emerald-700",
  date:    "bg-rose-100 text-rose-700",
};

function AttributeRow({ attr }: { attr: EntityAttribute }) {
  const label = TYPE_LABELS[attr.type] || attr.type;

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/40 group transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-mono text-xs text-foreground truncate">{attr.key}</span>
        {attr.values && attr.values.length > 0 && (
          <span className="hidden group-hover:flex items-center gap-1 text-[10px] text-muted-foreground">
            {attr.values.slice(0, 3).map((v) => (
              <span key={v} className="bg-muted rounded px-1">{v}</span>
            ))}
            {attr.values.length > 3 && <span>+{attr.values.length - 3}</span>}
          </span>
        )}
      </div>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide shrink-0 ${TYPE_COLORS[attr.type] ?? "bg-muted text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

export function EntitiesTab({ tenantId, entityType, onEntityTypeChange }: EntitiesTabProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deletingType, setDeletingType] = useState<string | null>(null);

  const { data: entityTypes = [], isLoading: typesLoading } = useEntityTypes(tenantId);
  const { data: attributes = [], isLoading: attrsLoading } = useVoiceTechAttributes(tenantId, entityType);
  
  const deleteMutation = useDeleteEntityType(tenantId);

  const handleDelete = (name: string) => {
    deleteMutation.mutate(name, {
        onSuccess: () => {
            if (entityType === name) onEntityTypeChange("");
            setDeletingType(null);
        }
    });
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top Section: Dataset Selection ───────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
           <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-[#1A1A24] text-[#FFE600] flex items-center justify-center">
                <Database className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-[#1A1A24]">Active Datasets</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage data sources for orchestration rules</p>
              </div>
              <Badge variant="outline" className="text-[10px] h-5 px-2 ml-2 bg-muted/50 rounded-full">{entityTypes.length} Total</Badge>
           </div>
           
           <Sheet open={uploadOpen} onOpenChange={setUploadOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="h-9 gap-2 text-xs font-bold bg-[#FFE600] text-black hover:brightness-95 transition-all shadow-sm">
                <Plus className="size-4" />
                Add New Dataset
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[420px] sm:max-w-[420px]">
              <SheetHeader className="mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <Upload className="size-4" />
                  Upload Dataset
                </SheetTitle>
              </SheetHeader>
              <CsvUploadPanel tenantId={tenantId} entityType={entityType} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x scroll-smooth">
          {typesLoading ? (
            [1,2,3,4,5].map(i => <div key={i} className="h-20 w-44 flex-shrink-0 rounded-xl bg-muted/50 animate-pulse" />)
          ) : entityTypes.length === 0 ? (
            <div className="w-full py-10 border-2 border-dashed rounded-2xl bg-muted/10 flex flex-col items-center justify-center text-center">
               <Database className="size-8 text-muted-foreground/30 mb-2" />
               <p className="text-xs text-muted-foreground">No datasets found in this workspace.</p>
               <Button variant="link" size="sm" className="text-xs" onClick={() => setUploadOpen(true)}>Upload your first CSV</Button>
            </div>
          ) : (
            entityTypes.map((type) => (
              <div key={type.id} className="group relative flex-shrink-0 snap-start">
                <button
                  onClick={() => onEntityTypeChange(type.name)}
                  className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left w-44 h-20 relative overflow-hidden
                    ${entityType === type.name
                      ? "border-[#1A1A24] bg-[#1A1A24]/5 shadow-sm"
                      : "border-border/60 bg-background hover:border-border hover:bg-muted/30"
                    }`}
                >
                  <div className="flex items-center gap-2 mb-1 pr-6 w-full">
                     <Tag className={`size-3 flex-shrink-0 ${entityType === type.name ? 'text-[#1A1A24]' : 'text-muted-foreground'}`} />
                     <span className={`text-xs font-bold font-mono tracking-tight truncate flex-1 ${entityType === type.name ? 'text-[#1A1A24]' : 'text-foreground'}`}>
                       {type.name}
                     </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-80 mt-1">Ready for Logic</p>
                  {entityType === type.name && (
                    <div className="absolute top-2 right-2">
                       <div className="size-2 rounded-full bg-[#FFE600] animate-pulse shadow-sm shadow-[#FFE600]/50" />
                    </div>
                  )}
                </button>

                {/* Delete Button - only visible on hover */}
                <AlertDialog open={deletingType === type.name} onOpenChange={(open) => !open && setDeletingType(null)}>
                    <AlertDialogTrigger asChild>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute bottom-1.5 right-1.5 size-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => { e.stopPropagation(); setDeletingType(type.name); }}
                        >
                            <Trash2 className="size-3" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Dataset?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <span className="font-bold text-foreground">"{type.name}"</span>? 
                                This will permanently remove all associated entities and attributes. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={() => handleDelete(type.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Bottom Section: Attribute Inspector ───────────────────── */}
      <div className="border rounded-2xl bg-background overflow-hidden flex flex-col min-h-[400px]">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-muted/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-lg bg-[#FFE600]/20 flex items-center justify-center text-[#1A1A24]">
                <Tag className="size-5" />
             </div>
             <div>
                <h3 className="text-base font-black tracking-tight text-[#1A1A24]">Attribute Inspector</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                   {entityType ? (
                     <>Inspecting structure for <span className="text-foreground font-mono font-bold tracking-tighter">"{entityType}"</span></>
                   ) : "Select a dataset above to view its attributes"}
                </p>
             </div>
          </div>
          
          {!attrsLoading && attributes.length > 0 && (
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-2">{attributes.length} Fields</Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {!entityType ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-10">
               <div className="size-12 rounded-full bg-muted/40 grid place-items-center mb-2">
                  <Database className="size-6 text-muted-foreground/40" />
               </div>
               <p className="text-xs font-medium text-muted-foreground">Select a dataset above to inspect its dynamic attributes.</p>
            </div>
          ) : attrsLoading ? (
            <div className="space-y-1.5">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 rounded-lg bg-muted/40 animate-pulse" />)}
            </div>
          ) : attributes.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-10">
               <p className="text-xs text-muted-foreground">This dataset has no attributes yet. Re-upload a CSV to discover fields.</p>
               <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => setUploadOpen(true)}>
                  <Upload className="size-3.5" /> Upload Data
               </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5">
              {attributes.map((attr) => (
                <AttributeRow key={attr.key} attr={attr} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
