
/** Generic API response wrapper used by all storage endpoints. */
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

/** Response from GET /storage/presigned-url */
export interface PresignedUrlResult {
    uploadUrl: string;
    filePath: string;
}

/** Params for the multipart upload call. */
export interface UploadFileParams {
    file: File;
    purpose: string;
    onUploadProgress?: (percent: number) => void;
}

/** Params for requesting a presigned URL. */
export interface PresignedUrlParams {
    fileName: string;
    contentType: string;
    purpose: string;
}

/** Shape returned from POST /storage/upload — re-exported for convenience. */
export type { UploadResult } from "../domain/storage.types";
