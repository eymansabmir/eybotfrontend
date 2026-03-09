import { apiClient } from "@/lib/api-client";
import type { UploadPurpose, UploadResult, UploadPolicy } from "../domain/storage.types";
import type { ApiResponse, PresignedUrlResult } from "./storage-api.types";

/**
 * Storage API client — thin wrapper around /api/storage endpoints.
 * Uses purpose-based uploads: the backend maps purpose → folder + MIME policy.
 */
export const storageApi = {
    /**
     * Upload a file via multipart/form-data.
     * Reports progress via the optional onUploadProgress callback.
     */
    uploadFile: async (
        file: File,
        purpose: UploadPurpose,
        onUploadProgress?: (percent: number) => void,
    ): Promise<UploadResult> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("purpose", purpose);

        const { data } = await apiClient.post<ApiResponse<UploadResult>>(
            "/storage/upload",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (event) => {
                    if (event.total && onUploadProgress) {
                        onUploadProgress(Math.round((event.loaded * 100) / event.total));
                    }
                },
            },
        );

        return data.data;
    },

    /** Delete a file from cloud storage. */
    deleteFile: async (filePath: string): Promise<void> => {
        await apiClient.delete("/storage/file", { data: { filePath } });
    },

    /** Get a presigned upload URL for client-side direct upload. */
    getPresignedUrl: async (
        fileName: string,
        contentType: string,
        purpose: UploadPurpose,
    ): Promise<PresignedUrlResult> => {
        const { data } = await apiClient.get<ApiResponse<PresignedUrlResult>>(
            "/storage/presigned-url",
            { params: { fileName, contentType, purpose } },
        );

        return data.data;
    },

    /** Get a signed URL to access a private file. */
    getSignedUrl: async (filePath: string): Promise<string> => {
        const { data } = await apiClient.get<ApiResponse<{ url: string }>>(
            "/storage/signed-url",
            { params: { filePath } },
        );

        return data.data.url;
    },

    /**
     * Get the upload policy for a given purpose.
     * Returns allowed MIME types, max size, and HTML accept string.
     */
    getUploadPolicy: async (purpose: UploadPurpose): Promise<UploadPolicy> => {
        const { data } = await apiClient.get<ApiResponse<UploadPolicy>>(
            "/storage/upload-policy",
            { params: { purpose } },
        );

        return data.data;
    },

    /**
     * Resolve a stored file path to a consumable URL.
     * Public bucket → direct URL. Private bucket → short-lived signed URL.
     */
    resolveUrl: async (filePath: string, bucket: "public" | "private" = "public"): Promise<string> => {
        const { data } = await apiClient.get<ApiResponse<{ url: string }>>(
            "/storage/resolve-url",
            { params: { filePath, bucket } },
        );

        return data.data.url;
    },
};
