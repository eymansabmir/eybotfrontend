import { useCallback, useRef, useState } from "react";
import { storageApi } from "./storage-api";
import type { UploadState, UseFileUploadOptions } from "./storage.types";

const INITIAL_STATE: UploadState = {
    status: "idle",
    progress: 0,
    result: null,
    error: null,
};

/**
 * Reusable file upload hook.
 *
 * Encapsulates: state machine, progress tracking, error handling.
 * Components call `upload(file)` and react to `state`.
 *
 * @example
 * const { upload, state, reset } = useFileUpload({
 *   folder: "bot-media",
 *   onSuccess: (url) => console.log("Uploaded:", url),
 * });
 */
export function useFileUpload({ folder, onSuccess, onError }: UseFileUploadOptions) {
    const [state, setState] = useState<UploadState>(INITIAL_STATE);

    // Ref-stable callbacks — avoids re-creating `upload` when parent re-renders
    const onSuccessRef = useRef(onSuccess);
    onSuccessRef.current = onSuccess;

    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;

    // Guard against double-uploads
    const uploading = useRef(false);

    const upload = useCallback(
        async (file: File) => {
            if (uploading.current) return;
            uploading.current = true;

            setState({ status: "uploading", progress: 0, result: null, error: null });

            try {
                const result = await storageApi.uploadFile(file, folder, (progress) => {
                    setState((prev) => ({ ...prev, progress }));
                });

                setState({ status: "success", progress: 100, result, error: null });
                onSuccessRef.current?.(result.url, result);
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : "Upload failed. Please try again.";

                setState({ status: "error", progress: 0, result: null, error: message });
                onErrorRef.current?.(message);
            } finally {
                uploading.current = false;
            }
        },
        [folder],
    );

    const reset = useCallback(() => {
        setState(INITIAL_STATE);
    }, []);

    return { upload, state, reset } as const;
}
