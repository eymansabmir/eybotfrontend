import { useQuery } from "@tanstack/react-query";
import { storageApi } from "../infrastructure/storage-api";
import type { UploadPurpose } from "../domain/storage.types";
import { ENV } from "@/config/env";

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
 * Public bucket → Resolved locally via ENV.BASE_MEDIA_URL.
 * Private bucket → Fetches a signed URL from the backend.
 */
export function useResolveUrl(
    filePath: string | undefined,
    bucket: "public" | "private" = "public",
) {
    const isAbsolute = !!filePath && /^https?:\/\//i.test(filePath);
    
    // For public files, we can resolve locally if it's a path (not absolute)
    const locallyResolvedUrl = bucket === "public" && filePath && !isAbsolute
        ? `${ENV.BASE_MEDIA_URL}/${filePath}`
        : isAbsolute ? filePath as string : undefined;

    return useQuery({
        queryKey: STORAGE_KEYS.resolveUrl(filePath ?? "", bucket),
        queryFn: async () => {
            if (bucket === "public" && locallyResolvedUrl) {
                return locallyResolvedUrl;
            }
            return storageApi.getSignedUrl(filePath!);
        },
        enabled: !!filePath,
        initialData: locallyResolvedUrl, // Instant resolution for public assets
        staleTime: bucket === "public" ? Infinity : 10 * 60 * 1000,
    });
}
