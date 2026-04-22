import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Upload,
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
    return entityTypes.filter(t => t && typeof t === "string" && t.toLowerCase().includes(query));
  }, [entityTypes, localType]);

  const hasExactMatch = entityTypes.some(t => t && typeof t === "string" && t.toLowerCase() === (localType?.toLowerCase() || ""));

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
      qc.invalidateQueries({ queryKey: ["voice-tech", "attributes", tenantId] });
      qc.invalidateQueries({ queryKey: ["voice-tech", "entity-types", tenantId] });
    }
  }, [job?.status, tenantId, qc]);

  // ── File selection ──────────────────────────────────────────────
  const handleFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!isValidFile(file)) {
      alert("Please upload a .csv, .xls or .xlsx file");
      return;
    }
    setFileName(file.name);
    setSelectedFile(file);
  }, []);

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
    <div className="space-y-3">
      <div className="space-y-2 pb-2">
         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Storage Category / Dataset Name</p>
         
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
                  className="h-9 text-xs font-mono w-full pr-10"
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
                     <ComboboxItem key={type} value={type} className="text-xs font-mono py-2">
                        {type}
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

         <p className="text-[10px] text-muted-foreground italic">Naming this uniquely prevents mixing data from different CSVs.</p>
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
            "flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Upload className="size-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Drag & drop or click to browse</p>
            <p className="mt-0.5 text-xs text-muted-foreground">CSV, XLS, XLSX</p>
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
            className="w-full"
            onClick={handleIngest}
            disabled={ingestMutation.isPending}
          >
            {uploadState.status === "uploading" ? (
              <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> Uploading ({uploadState.progress}%)…</>
            ) : ingestMutation.isPending ? (
              <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> Starting ingest…</>
            ) : (
              "Ingest File"
            )}
          </Button>
          
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
      {jobId && statusMeta && (
        <div
          className={cn(
            "rounded-xl border p-4 space-y-3",
            jobStatus === "completed" && "border-green-500/20 bg-green-500/5",
            jobStatus === "failed"    && "border-red-500/20 bg-red-500/5",
            !["completed","failed"].includes(jobStatus!) && "border-border bg-muted/20"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[180px]">{fileName}</span>
            </div>
            <span className={cn("flex items-center gap-1.5 text-xs font-semibold", statusMeta.color)}>
              {statusMeta.icon}
              {statusMeta.label}
            </span>
          </div>

          {/* Progress bar — only if total is available */}
          {job?.total != null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{job.processed ?? 0} / {job.total} records</span>
                <span>{Math.round(((job.processed ?? 0) / job.total) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.round(((job.processed ?? 0) / job.total) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Errors */}
          {job?.errors && job.errors.length > 0 && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2">
              <p className="text-xs text-red-600 font-medium mb-1">Errors ({job.errors.length})</p>
              <ul className="text-xs text-red-500 space-y-0.5 max-h-20 overflow-y-auto">
                {job.errors.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}

          {["completed", "failed"].includes(jobStatus!) && (
            <Button variant="outline" size="sm" onClick={reset} className="w-full">
              Upload another file
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
