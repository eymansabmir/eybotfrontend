import type { UploadPurpose } from "../domain/storage.types";

export interface MediaValidationResult {
    isValid: boolean;
    error: string | null;
}

/**
 * Validates a file extension and MIME type based on purpose.
 */
export function validateMediaPurpose(extension: string, purpose: UploadPurpose): MediaValidationResult {
    const ext = extension.toLowerCase().replace(".", "");
    
    switch (purpose) {
        case "image":
            if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
                return { isValid: false, error: "Supported image types: JPG, PNG, WEBP" };
            }
            break;

        case "video":
            if (!["mp4", "3gp"].includes(ext)) {
                return { isValid: false, error: "Supported video types: MP4, 3GP" };
            }
            break;

        case "audio":
            if (!["mp3", "ogg", "wav", "aac", "m4a", "amr"].includes(ext)) {
                return { isValid: false, error: "Supported audio types: MP3, OGG, WAV, AAC, M4A, AMR" };
            }
            break;

        case "sticker":
            if (ext !== "webp") {
                return { isValid: false, error: "Stickers must be in WebP format" };
            }
            break;
    }

    return { isValid: true, error: null };
}

/**
 * Validates a file's size and resolution.
 */
export async function validateFileConstraints(file: File, purpose: UploadPurpose): Promise<MediaValidationResult> {
    const sizeMB = file.size / (1024 * 1024);
    
    // 1. Check size
    switch (purpose) {
        case "image":
            if (sizeMB > 5) return { isValid: false, error: "Images must be smaller than 5MB" };
            break;
        case "video":
            if (sizeMB > 16) return { isValid: false, error: "Videos must be smaller than 16MB" };
            break;
        case "audio":
            if (sizeMB > 16) return { isValid: false, error: "Audio files must be smaller than 16MB" };
            break;
        case "document":
            if (sizeMB > 100) return { isValid: false, error: "Documents must be smaller than 100MB" };
            break;
        case "sticker":
            if (file.size > 100 * 1024) return { isValid: false, error: "Stickers must be smaller than 100KB" };
            break;
    }

    // 2. Check resolution for stickers
    if (purpose === "sticker") {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                if (img.width !== 512 || img.height !== 512) {
                    resolve({ isValid: false, error: "Sticker resolution must be exactly 512x512 pixels" });
                } else {
                    resolve({ isValid: true, error: null });
                }
            };
            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                resolve({ isValid: false, error: "Invalid image file" });
            };
            img.src = URL.createObjectURL(file);
        });
    }

    return { isValid: true, error: null };
}

/**
 * Validates a URL based on its purpose (extension check).
 */
export function validateMediaUrl(url: string, purpose: UploadPurpose): MediaValidationResult {
    if (!url || url.includes("{{")) return { isValid: true, error: null }; // Skip for dynamic variables
    
    try {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname;
        
        // Get the last segment of the path (e.g., "image.jpg" from "/path/to/image.jpg")
        const segments = path.split("/");
        const filename = segments[segments.length - 1];
        
        // If there's no dot in the filename, we can't reliably determine the type from the URL
        if (!filename.includes(".")) {
            return { isValid: true, error: null };
        }
        
        const extension = filename.split(".").pop();
        if (!extension) return { isValid: true, error: null };
        
        return validateMediaPurpose(extension, purpose);
    } catch (e) {
        // Not a full URL, check if it looks like a file path with an extension
        if (url.includes(".")) {
            const extension = url.split(".").pop();
            if (extension && extension.length <= 4 && /^[a-z0-9]+$/i.test(extension)) {
                return validateMediaPurpose(extension, purpose);
            }
        }
        return { isValid: true, error: null };
    }
}

/**
 * Validates a URL remotely via the backend (checks size and accessibility).
 */
export async function validateMediaUrlRemote(url: string, purpose: UploadPurpose): Promise<MediaValidationResult> {
    if (!url || url.includes("{{") || !url.startsWith("http")) return { isValid: true, error: null };

    try {
        const { ENV } = await import("@/config/env");
        const response = await fetch(`${ENV.API_URL}/storage/validate-url?url=${encodeURIComponent(url)}&purpose=${purpose}`);
        const result = await response.json();
        
        if (result.success === false) {
            return { isValid: false, error: result.message || "Invalid URL or exceeds size limit" };
        }
        return { isValid: true, error: null };
    } catch (e) {
        console.error("Remote validation failed:", e);
        return { isValid: true, error: null }; // Fallback to success if validation service is down
    }
}
