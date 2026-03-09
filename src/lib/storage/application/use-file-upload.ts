import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { storageApi } from "../infrastructure/storage-api";
import type { UploadState, UseFileUploadOptions } from "./upload.types";

/**
 * Reusable file upload hook backed by react-query `useMutation`.
 *
 * Encapsulates: state machine, progress tracking, toast notifications.
 * Components call `upload(file)` and react to `state`.
 *
 * @example
 * const { upload, state, reset } = useFileUpload({
 *   purpose: "audio",
 *   onSuccess: (url) => console.log("Uploaded:", url),
 * });
 */
export function useFileUpload({ purpose, onSuccess, onError }: UseFileUploadOptions) {
    const [progress, setProgress] = useState(0);

    const onSuccessRef = useRef(onSuccess);
    useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);

    const onErrorRef = useRef(onError);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    const mutation = useMutation({
        mutationFn: (file: File) =>
            storageApi.uploadFile(file, purpose, (p) => setProgress(p)),
        onSuccess: (result) => {
            setProgress(100);
            toast.success("File uploaded successfully");
            onSuccessRef.current?.(result.path, result);
        },
        onError: (err: Error) => {
            setProgress(0);
            const message = err.message || "Upload failed. Please try again.";
            toast.error(message);
            onErrorRef.current?.(message);
        },
    });

    const state: UploadState = mutation.isPending
        ? { status: "uploading", progress, result: null, error: null }
        : mutation.isSuccess
            ? { status: "success", progress: 100, result: mutation.data, error: null }
            : mutation.isError
                ? { status: "error", progress: 0, result: null, error: mutation.error?.message ?? "Upload failed" }
                : { status: "idle", progress: 0, result: null, error: null };

    const upload = useCallback(
        (file: File) => {
            if (!mutation.isPending) {
                mutation.mutate(file);
            }
        },
        [mutation],
    );

    const reset = useCallback(() => {
        mutation.reset();
        setProgress(0);
    }, [mutation]);

    return { upload, state, reset } as const;
}
