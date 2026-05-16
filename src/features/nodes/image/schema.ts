import { z } from "zod";

export const ImageNodeSchema = z.object({
    url: z.string().min(1, "Image file path or URL is required"),
    caption: z.string().optional(),
    validationError: z.string().optional(),
});

export type ImageNodeData = z.infer<typeof ImageNodeSchema>;
