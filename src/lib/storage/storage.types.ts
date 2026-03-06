/** Mirrors the backend AllowedFolder type */
export type AllowedFolder = "campaigns" | "bot-media" | "workspaces" | "uploads";

/** Response shape from POST /storage/upload */
export interface UploadResult {
    path: string;
    url: string;
}

/** Wrapper the backend returns */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

/** Upload state machine for the hook */
export type UploadStatus = "idle" | "uploading" | "success" | "error";

export interface UploadState {
    status: UploadStatus;
    progress: number;       // 0–100
    result: UploadResult | null;
    error: string | null;
}

export interface UseFileUploadOptions {
    folder: AllowedFolder;
    onSuccess?: (url: string, result: UploadResult) => void;
    onError?: (error: string) => void;
}

/** Response from GET /storage/presigned-url */
export interface PresignedUrlResult {
    uploadUrl: string;
    fileUrl: string;
}
