import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { storageApi } from "../infrastructure/storage-api";
import type { UploadState, UseFileUploadOptions } from "./upload.types";
import type { UploadPurpose } from "../domain/storage.types";

import { validateMediaPurpose, validateFileConstraints } from "./validation";

/**
 * Validates a file based on its purpose before uploading.
 * Returns an error message string if invalid, or null if valid.
 */
async function validateFile(file: File, purpose: UploadPurpose): Promise<string | null> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    // 1. Check extension/type
    if (extension) {
        const typeResult = validateMediaPurpose(extension, purpose);
        if (!typeResult.isValid) return typeResult.error;
    }

    // 2. Check size and resolution
    const constraintResult = await validateFileConstraints(file, purpose);
    if (!constraintResult.isValid) return constraintResult.error;

    return null;
}

/**
 * Reusable file upload hook backed by react-query `useMutation`.
 */
export function useFileUpload({ purpose, onSuccess, onError }: UseFileUploadOptions) {
    const [progress, setProgress] = useState(0);
    const [manualError, setManualError] = useState<string | null>(null);

    const onSuccessRef = useRef(onSuccess);
    useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);

    const onErrorRef = useRef(onError);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    const mutation = useMutation({
        mutationFn: (file: File) =>
            storageApi.uploadFile(file, purpose, (p) => setProgress(p)),
        onSuccess: (result) => {
            setProgress(100);
            setManualError(null);
            toast.success("File uploaded successfully");
            onSuccessRef.current?.(result.url, result);
        },
        onError: (err: Error) => {
            setProgress(0);
            setManualError(null);
            const message = err.message || "Upload failed. Please try again.";
            toast.error(message);
            onErrorRef.current?.(message);
        },
    });

    const state: UploadState = manualError 
        ? { status: "error", progress: 0, result: null, error: manualError }
        : mutation.isPending
            ? { status: "uploading", progress, result: null, error: null }
            : mutation.isSuccess
                ? { status: "success", progress: 100, result: mutation.data, error: null }
                : mutation.isError
                    ? { status: "error", progress: 0, result: null, error: mutation.error?.message ?? "Upload failed" }
                    : { status: "idle", progress: 0, result: null, error: null };

    const upload = useCallback(
        async (file: File) => {
            if (mutation.isPending) return;
            setManualError(null);

            const validationError = await validateFile(file, purpose);
            if (validationError) {
                setManualError(validationError);
                toast.error(validationError);
                onErrorRef.current?.(validationError);
                return;
            }

            mutation.mutate(file);
        },
        [mutation, purpose],
    );

    const reset = useCallback(() => {
        mutation.reset();
        setManualError(null);
        setProgress(0);
    }, [mutation]);

    return { upload, state, reset } as const;
}
