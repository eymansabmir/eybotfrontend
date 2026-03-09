// Public API — re-exports for consumers

// Presentation
export { MediaUploader } from "./presentation/MediaUploader";

// Application
export { useFileUpload } from "./application/use-file-upload";
export { useUploadPolicy, useResolveUrl } from "./application/storage-queries";
export type { UploadState, UseFileUploadOptions } from "./application/upload.types";

// Infrastructure
export { storageApi } from "./infrastructure/storage-api";

// Domain
export type { UploadPurpose, UploadResult, UploadPolicy } from "./domain/storage.types";
