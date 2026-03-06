import { apiClient } from "@/lib/api-client";
import type {
    AllowedFolder,
    ApiResponse,
    UploadResult,
    PresignedUrlResult,
} from "./storage.types";

/**
 * Storage API client — thin wrapper around /api/storage endpoints.
 * Follows the same object-with-methods pattern as chat-session-api.ts.
 */
export const storageApi = {
    /**
     * Upload a file via multipart/form-data.
     * Reports progress via the optional onUploadProgress callback.
     */
    uploadFile: async (
        file: File,
        folder: AllowedFolder,
        onUploadProgress?: (percent: number) => void,
    ): Promise<UploadResult> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

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
        folder: AllowedFolder,
    ): Promise<PresignedUrlResult> => {
        const { data } = await apiClient.get<ApiResponse<PresignedUrlResult>>(
            "/storage/presigned-url",
            { params: { fileName, contentType, folder } },
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
};
