import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { useFileUpload, useUploadPolicy } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];
const ALLOWED_MIME_TYPES = new Set([
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function isValidCampaignFile(file: File): boolean {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME_TYPES.has(file.type);
}



interface CsvUploaderProps {
    /** Called with the uploaded file URL on success */
    onUploadSuccess: (url: string) => void;
    /** Optional label */
    label?: string;
}

/**
 * Campaign-specific CSV / Excel file uploader.
 * Uses the shared useFileUpload hook with purpose = "campaign_csv".
 */
export function CsvUploader({
    onUploadSuccess,
    label = "Upload CSV or Excel file",
}: CsvUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const { data: policy } = useUploadPolicy("campaign_csv");

    const { upload, state, reset } = useFileUpload({
        purpose: "campaign_csv",
        onSuccess: (url) => onUploadSuccess(url),
    });

    const handleFile = useCallback(
        (file: File | undefined) => {
            if (!file) return;

            if (!isValidCampaignFile(file)) {
                toast.error("Please upload a CSV or Excel file (.csv, .xls, .xlsx)");
                return;
            }

            setFileName(file.name);
            upload(file);
        },
        [upload],
    );

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFile(e.dataTransfer.files[0]);
        },
        [handleFile],
    );

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const onDragLeave = useCallback(() => setIsDragOver(false), []);

    const handleReset = useCallback(() => {
        reset();
        setFileName(null);
    }, [reset]);

    // ─── Idle ──────────────────────────────────────────────────
    if (state.status === "idle") {
        return (
            <div
                role="button"
                tabIndex={0}
                className={cn(
                    "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 transition-all",
                    isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary/5",
                )}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Upload size={20} />
                </div>
                <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Drag & drop or click to browse • CSV, XLS, XLSX
                    </p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={policy?.acceptString ?? ".csv,.xls,.xlsx"}
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />
            </div>
        );
    }

    // ─── Uploading ─────────────────────────────────────────────
    if (state.status === "uploading") {
        return (
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <FileSpreadsheet size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
                        <p className="text-xs text-muted-foreground">Uploading… {state.progress}%</p>
                    </div>
                    <Loader2 size={16} className="animate-spin text-primary" />
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${state.progress}%` }}
                    />
                </div>
            </div>
        );
    }

    // ─── Success ───────────────────────────────────────────────
    if (state.status === "success") {
        return (
            <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2 text-green-600">
                        <FileSpreadsheet size={16} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground">{fileName}</p>
                        <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 size={12} />
                            <span className="text-xs">Uploaded successfully</span>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Upload another file"
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    // ─── Error ─────────────────────────────────────────────────
    return (
        <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/10 p-2 text-red-600">
                    <AlertCircle size={16} />
                </div>
                <div>
                    <p className="text-sm font-medium text-foreground">{fileName}</p>
                    <span className="text-xs text-red-600">{state.error ?? "Upload failed"}</span>
                </div>
            </div>
            <button
                type="button"
                onClick={handleReset}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Try again"
            >
                <X size={14} />
            </button>
        </div>
    );
}
