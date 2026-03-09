import { z } from "zod";

export const DocumentNodeSchema = z.object({
    filePath: z.string().min(1, "Document file path or URL is required"),
    caption: z.string().optional(),
    filename: z.string().optional(),
});

export type DocumentNodeData = z.infer<typeof DocumentNodeSchema>;
