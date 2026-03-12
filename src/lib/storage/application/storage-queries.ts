import { useQuery } from "@tanstack/react-query";
import { storageApi } from "../infrastructure/storage-api";
import type { UploadPurpose } from "../domain/storage.types";

export const STORAGE_KEYS = {
    uploadPolicy: (purpose: UploadPurpose) => ["storage", "upload-policy", purpose] as const,
    resolveUrl: (filePath: string, bucket: "public" | "private") =>
        ["storage", "resolve-url", filePath, bucket] as const,
};

/**
 * Fetches the upload policy for a given purpose from the backend.
 * Returns allowed MIME types, max file size, and HTML accept string.
 *
 * Cached for the session duration — policies don't change at runtime.
 */
export function useUploadPolicy(purpose: UploadPurpose) {
    return useQuery({
        queryKey: STORAGE_KEYS.uploadPolicy(purpose),
        queryFn: () => storageApi.getUploadPolicy(purpose),
        staleTime: Infinity,
    });
}

/**
 * Resolves a stored file path to a displayable URL.
 * Public files are cached longer; private signed URLs are refetched more often.
 */
export function useResolveUrl(
    filePath: string | undefined,
    bucket: "public" | "private" = "public",
) {
    return useQuery({
        queryKey: STORAGE_KEYS.resolveUrl(filePath ?? "", bucket),
        queryFn: () => storageApi.resolveUrl(filePath!, bucket),
        enabled: !!filePath,
        staleTime: bucket === "public" ? Infinity : 10 * 60 * 1000, // 10 min for signed URLs
    });
}
