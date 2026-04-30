import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/lib/storage";
import { 
  useIngestFileAsync, 
  useJobStatusPolling,
  useEntityTypes 
} from "../../../api/voice-tech-queries";
import type { IngestJobStatus } from "../../../types";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxTrigger,
} from "@/components/ui/combobox";

const ALLOWED_EXT = [".csv", ".xls", ".xlsx"];

function isValidFile(file: File) {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return ALLOWED_EXT.includes(ext);
}

const STATUS_CONFIG: Record<
  IngestJobStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  queued:     { label: "Queued",     color: "text-amber-500",  icon: <Loader2 className="size-3.5 animate-spin" /> },
  processing: { label: "Processing", color: "text-blue-500",   icon: <Loader2 className="size-3.5 animate-spin" /> },
  retrying:   { label: "Retrying",   color: "text-orange-500", icon: <RefreshCw className="size-3.5 animate-spin" /> },
  completed:  { label: "Completed",  color: "text-green-600",  icon: <CheckCircle2 className="size-3.5" /> },
  failed:     { label: "Failed",     color: "text-red-500",    icon: <AlertCircle className="size-3.5" /> },
};

interface CsvUploadPanelProps {
  tenantId: string;
  entityType: string;
}

export function CsvUploadPanel({ tenantId, entityType: initialType }: CsvUploadPanelProps) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: entityTypes = [] } = useEntityTypes(tenantId);
  const [localType, setLocalType] = useState(initialType || "");
  const filteredEntityTypes = useMemo(() => {
    const query = localType?.toLowerCase() || "";
    if (!query) return entityTypes;
    return entityTypes.filter(t => t?.name?.toLowerCase().includes(query));
  }, [entityTypes, localType]);

  const hasExactMatch = entityTypes.some(t => t?.name?.toLowerCase() === (localType?.toLowerCase() || ""));

  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const ingestMutation = useIngestFileAsync(tenantId);
  const { upload, state: uploadState, reset: resetUpload } = useFileUpload({ 
    purpose: "campaign_csv",
    onSuccess: (_url, result) => {
        // Once uploaded, trigger ingestion with the real path
        ingestMutation.mutate({ 
            tenantId, 
            entityType: localType, 
            filePath: result.path 
        }, {
            onSuccess: (res) => setJobId(res.jobId)
        });
    }
  });
  
  const { data: job } = useJobStatusPolling(jobId);

  // Invalidate when completed
  useEffect(() => {
    if (job?.status === "completed") {
      toast.success(`Dataset "${localType}" is ready!`, {
        description: "The background list has been updated."
      });
      // Force immediate refetch of relevant data
      qc.refetchQueries({ queryKey: ["voice-tech", "entity-types", tenantId] });
      qc.refetchQueries({ queryKey: ["voice-tech", "attributes", tenantId] });
    } else if (job?.status === "failed") {
      toast.error("Dataset ingestion failed", {
        description: job.errors?.[0] || "Check the panel for details"
      });
    }
  }, [job?.status, tenantId, qc, localType, job?.errors]);

  // ── File selection ──────────────────────────────────────────────
  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!isValidFile(file)) {
      toast.error("Invalid file type", {
        description: "Please upload a .csv, .xls or .xlsx file"
      });
      return;
    }
    setFileName(file.name);
    setSelectedFile(file);
    
    // Auto-populate name if empty
    if (!localType.trim()) {
      const sanitized = file.name
        .replace(/\.[^/.]+$/, "") // remove extension
        .replace(/[^a-z0-9\s]/gi, ' ') // replace special chars with spaces
        .trim();
      setLocalType(sanitized);
    }
  }, [localType]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const reset = () => {
    setFileName(null);
    setSelectedFile(null);
    setJobId(null);
    ingestMutation.reset();
    resetUpload();
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Trigger ingest ──────────────────────────────────────────────
  const handleIngest = async () => {
    if (!selectedFile) return;
    upload(selectedFile);
  };

  const jobStatus = job?.status;
  const statusMeta = jobStatus ? STATUS_CONFIG[jobStatus] : null;

  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
         <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Storage Category / Dataset Name</p>
         
         <Combobox 
            value={localType} 
            onValueChange={(val) => {
               if (val) {
                  setLocalType(val as string);
                  setOpen(false);
               }
            }}
            open={open}
            onOpenChange={setOpen}
         >
            <div className="relative">
               <ComboboxInput 
                  placeholder="Select or type new category..."
                  className="h-11 text-sm font-medium w-full pr-10 border-border rounded-md bg-background placeholder:text-muted-foreground/30"
                  value={localType}
                  onChange={(e) => {
                     setLocalType(e.target.value);
                     if (e.target.value.length > 0) setOpen(true);
                     else setOpen(false);
                  }}
                  showTrigger={false}
               />
               <ComboboxTrigger className="absolute right-0 top-0 h-9 px-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="size-3" />
               </ComboboxTrigger>
            </div>
            <ComboboxContent className="z-[100] w-[var(--base-ui-combobox-trigger-width)] min-w-[200px]">
               <ComboboxList className="max-h-48">
                  {filteredEntityTypes.map((type) => (
                     <ComboboxItem key={type.id} value={type.name} className="text-xs font-mono py-2">
                        {type.name}
                     </ComboboxItem>
                  ))}
                  {localType && !hasExactMatch && (
                     <ComboboxItem 
                        value={localType} 
                        className="text-primary font-black border-t border-border/50 mt-1 text-xs py-2"
                     >
                        <Plus className="size-3 mr-2" />
                        Create "{localType}"
                     </ComboboxItem>
                  )}
               </ComboboxList>
               {localType && filteredEntityTypes.length === 0 && !hasExactMatch && (
                   <ComboboxEmpty className="text-xs py-4">New Category: {localType}</ComboboxEmpty>
               )}
            </ComboboxContent>
         </Combobox>

         <p className="text-[11px] text-muted-foreground/60 font-medium">Naming this uniquely prevents mixing data from different CSVs.</p>
      </div>

      {/* Drop Zone */}
      {!fileName && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-4 rounded-md border-2 border-dashed p-10 transition-all",
            isDragOver
              ? "border-primary/50 bg-primary/5"
              : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50"
          )}
        >
          <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            <FileSpreadsheet className="size-6" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">Drag &amp; drop your file here</p>
            <p className="mt-1 text-sm text-muted-foreground">or <span className="font-bold text-foreground underline underline-offset-4">browse files</span></p>
            <p className="mt-3 text-[11px] text-muted-foreground/60 font-medium">Supports CSV, XLS, XLSX</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".csv,.xls,.xlsx"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* File selected — ready to ingest */}
      {fileName && !jobId && (
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <FileSpreadsheet className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground">Ready to ingest</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Remove file"
            >
              <X className="size-4" />
            </button>
          </div>
          <Button
            size="sm"
            className="w-full h-11 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 border-none font-bold text-sm uppercase tracking-wider"
            onClick={handleIngest}
            disabled={ingestMutation.isPending || !localType.trim()}
          >
            {uploadState.status === "uploading" ? (
              <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> Uploading ({uploadState.progress}%)…</>
            ) : ingestMutation.isPending ? (
              <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> Starting ingest…</>
            ) : !localType.trim() ? (
              "Name Required"
            ) : (
              "Ingest File"
            )}
          </Button>

          {!localType.trim() && (
             <p className="text-[10px] text-red-500 text-center font-semibold animate-pulse">
                Please select or type a dataset name above to continue.
             </p>
          )}
          
          {uploadState.status === "uploading" && (
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${uploadState.progress}%` }}
                />
            </div>
          )}
        </div>
      )}

      {/* Job status panel */}
      {jobId && (
        <div
          className={cn(
            "rounded-xl border p-5 space-y-4 transition-all duration-500",
            jobStatus === "completed" && "border-green-500/30 bg-green-500/5 shadow-sm",
            jobStatus === "failed"    && "border-red-500/30 bg-red-500/5 shadow-sm",
            !["completed","failed"].includes(jobStatus!) && "border-border bg-muted/20 animate-pulse"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center",
                jobStatus === "completed" ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
              )}>
                <FileSpreadsheet className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate max-w-[180px]">{fileName}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Dataset: {localType}</p>
              </div>
            </div>
            {statusMeta ? (
              <span className={cn("flex items-center gap-1.5 text-xs font-bold", statusMeta.color)}>
                {statusMeta.icon}
                {statusMeta.label}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Connecting...
              </span>
            )}
          </div>

          {/* Progress bar — only show while processing */}
          {!["completed", "failed"].includes(jobStatus!) && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>{job?.processed ?? 0} / {job?.total ?? "..."} records</span>
                <span>{job?.total ? Math.round(((job.processed ?? 0) / job.total) * 100) : 0}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50 border border-border/5">
                <div
                  className="h-full rounded-full transition-all duration-1000 bg-primary"
                  style={{ width: `${job?.total ? Math.round(((job.processed ?? 0) / job.total) * 100) : 5}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Message */}
          {jobStatus === "completed" && (
            <div className="flex items-center gap-2 py-1 px-3 rounded-lg bg-green-500/10 border border-green-500/10">
              <CheckCircle2 className="size-3.5 text-green-600" />
              <p className="text-xs text-green-700 font-medium">Dataset is now live and ready to use!</p>
            </div>
          )}

          {/* Errors */}
          {job?.errors && job.errors.length > 0 && (
            <div className="rounded-lg bg-red-500/10 px-3 py-3 border border-red-500/10">
              <p className="text-xs text-red-600 font-bold mb-1.5 flex items-center gap-1.5">
                <AlertCircle className="size-3.5" />
                Ingestion Errors ({job.errors.length})
              </p>
              <ul className="text-xs text-red-500/80 space-y-1 max-h-24 overflow-y-auto pr-1">
                {job.errors.map((e, i) => <li key={i} className="pl-3 relative before:content-['•'] before:absolute before:left-0 text-[11px] leading-relaxed">{e}</li>)}
              </ul>
            </div>
          )}

          {["completed", "failed"].includes(jobStatus!) && (
            <Button 
            variant="outline" 
            size="sm" 
            onClick={reset} 
            className="w-full h-11 rounded-md font-bold border-border hover:bg-muted text-muted-foreground"
          >
            Upload Another Dataset
          </Button>
          )}
        </div>
      )}
    </div>
  );
}
