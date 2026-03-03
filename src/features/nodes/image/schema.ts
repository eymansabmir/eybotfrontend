import { z } from "zod";

export const ImageNodeSchema = z.object({
    url: z.string().url("Valid image URL is required"),
    caption: z.string().optional(),
});

export type ImageNodeData = z.infer<typeof ImageNodeSchema>;
