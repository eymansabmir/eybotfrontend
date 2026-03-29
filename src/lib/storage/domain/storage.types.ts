/** Upload purpose — the frontend's abstraction over backend storage folders. */
export type UploadPurpose = "image" | "video" | "audio" | "document" | "campaign_csv" | "general";

/** Core upload result returned after a successful upload. Contains only the stored path — no URL. */
export interface UploadResult {
    path: string;
    url: string;
}

/** Backend-defined policy for a given upload purpose. */
export interface UploadPolicy {
    allowedMimeTypes: string[];
    maxSizeMB: number;
    acceptString: string;
}
