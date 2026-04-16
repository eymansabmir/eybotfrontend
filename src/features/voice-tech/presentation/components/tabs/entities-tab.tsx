import { useState } from "react";
import { Database, Plus, Tag, ChevronRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CsvUploadPanel } from "../ingest/csv-upload-panel";
import { useEntityTypes, useVoiceTechAttributes } from "../../../api/voice-tech-queries";
import type { EntityAttribute } from "../../../types";

interface EntitiesTabProps {
  tenantId: string;
  entityType: string;
  onEntityTypeChange: (value: string) => void;
}

// Maps attribute type to a short readable label + colour
const TYPE_COLORS: Record<string, string> = {
  enum:    "bg-violet-100 text-violet-700",
  string:  "bg-sky-100 text-sky-700",
  number:  "bg-amber-100 text-amber-700",
  boolean: "bg-emerald-100 text-emerald-700",
  date:    "bg-rose-100 text-rose-700",
};

function AttributeRow({ attr }: { attr: EntityAttribute }) {
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
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${TYPE_COLORS[attr.type] ?? "bg-muted text-muted-foreground"}`}>
        {attr.type}
      </span>
    </div>
  );
}

export function EntitiesTab({ tenantId, entityType, onEntityTypeChange }: EntitiesTabProps) {
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: entityTypes = [], isLoading: typesLoading } = useEntityTypes(tenantId);
  const { data: attributes = [], isLoading: attrsLoading } = useVoiceTechAttributes(tenantId, entityType);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Top Section: Dataset Selection ───────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <Database className="size-4 text-primary" />
              <h2 className="text-sm font-bold tracking-tight">Active Datasets</h2>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-muted/50">{entityTypes.length}</Badge>
           </div>
           
           <Sheet open={uploadOpen} onOpenChange={setUploadOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="h-8 gap-1.5 text-xs font-bold">
                <Plus className="size-3.5" />
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {typesLoading ? (
            [1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />)
          ) : entityTypes.length === 0 ? (
            <div className="col-span-full py-10 border-2 border-dashed rounded-2xl bg-muted/10 flex flex-col items-center justify-center text-center">
               <Database className="size-8 text-muted-foreground/30 mb-2" />
               <p className="text-xs text-muted-foreground">No datasets found in this workspace.</p>
               <Button variant="link" size="sm" className="text-xs" onClick={() => setUploadOpen(true)}>Upload your first CSV</Button>
            </div>
          ) : (
            entityTypes.map((type) => (
              <button
                key={type}
                onClick={() => onEntityTypeChange(type)}
                className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left group relative overflow-hidden
                  ${entityType === type
                    ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                    : "border-border/60 bg-background hover:border-border hover:bg-muted/30"
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                   <Tag className={`size-3 ${entityType === type ? 'text-primary' : 'text-muted-foreground'}`} />
                   <span className={`text-[11px] font-bold font-mono tracking-tight truncate ${entityType === type ? 'text-primary' : 'text-foreground'}`}>
                      {type}
                   </span>
                </div>
                <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">Ready for Logic</p>
                {entityType === type && (
                  <div className="absolute top-1 right-1">
                     <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Bottom Section: Attribute Inspector ───────────────────── */}
      <div className="border rounded-2xl bg-background overflow-hidden flex flex-col min-h-[400px]">
        {/* Header */}
        <div className="px-5 py-4 border-b bg-muted/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Tag className="size-4" />
             </div>
             <div>
                <h3 className="text-sm font-bold tracking-tight">Attribute Inspector</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
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
