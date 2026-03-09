import type { UploadPurpose, UploadResult } from "../domain/storage.types";

/** Upload state machine consumed by UI components. */
export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadState {
    status: UploadStatus;
    /** 0–100 */
    progress: number;
    result: UploadResult | null;
    error: string | null;
}

/** Options for the useFileUpload hook. */
export interface UseFileUploadOptions {
    purpose: UploadPurpose;
    /** Called with the stored file path and full result on success. */
    onSuccess?: (path: string, result: UploadResult) => void;
    onError?: (error: string) => void;
}
