import { useCallback, useRef, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { useFileUpload } from "../application/use-file-upload";
import { useUploadPolicy } from "../application/storage-queries";
import type { UploadPurpose } from "../domain/storage.types";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
    /** Called with the stored file path on success */
    onUploadSuccess: (path: string) => void;
    /** Upload purpose — determines accepted MIME types and backend storage policy */
    purpose: UploadPurpose;
    /** Optional label override */
    label?: string;
}

/**
 * Drag-and-drop + click-to-browse file uploader.
 * Used by node renderers (image, audio, video, document) to upload media.
 *
 * File type restrictions are derived from the backend upload policy
 * based on the provided `purpose` — no hardcoded MIME lists on the frontend.
 */
export function MediaUploader({
    onUploadSuccess,
    purpose,
    label = "Upload file",
}: MediaUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const { data: policy } = useUploadPolicy(purpose);

    const { upload, state, reset } = useFileUpload({
        purpose,
        onSuccess: (path) => onUploadSuccess(path),
    });

    const handleFile = useCallback(
        (file: File | undefined) => {
            if (file) upload(file);
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

    // ─── Idle / Drag-drop zone ─────────────────────────────────
    if (state.status === "idle") {
        return (
            <div
                role="button"
                tabIndex={0}
                className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2 transition-all",
                    isDragOver
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/50 bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5",
                )}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
            >
                <Upload size={12} />
                <span className="text-[10px] font-medium">{isDragOver ? "Drop to upload" : label}</span>

                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={policy?.acceptString}
                    onChange={(e) => handleFile(e.target.files?.[0])}
                />
            </div>
        );
    }

    // ─── Uploading — progress bar ──────────────────────────────
    if (state.status === "uploading") {
        return (
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="text-[10px] font-medium">Uploading… {state.progress}%</span>
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
            <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2">
                <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 size={12} />
                    <span className="text-[10px] font-medium">Uploaded successfully</span>
                </div>
                <button
                    type="button"
                    onClick={reset}
                    className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label="Upload another file"
                >
                    <X size={10} />
                </button>
            </div>
        );
    }

    // ─── Error ─────────────────────────────────────────────────
    return (
        <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2">
            <div className="flex items-center gap-2 text-red-600">
                <AlertCircle size={12} />
                <span className="text-[10px] font-medium">{state.error ?? "Upload failed"}</span>
            </div>
            <button
                type="button"
                onClick={reset}
                className="rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Try again"
            >
                <X size={10} />
            </button>
        </div>
    );
}
