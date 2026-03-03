import { z } from "zod";

export const DocumentNodeSchema = z.object({
    url: z.string().url("Valid document URL is required"),
    caption: z.string().optional(),
    filename: z.string().optional(),
});

export type DocumentNodeData = z.infer<typeof DocumentNodeSchema>;
