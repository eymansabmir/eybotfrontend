import { z } from "zod";

export const AudioNodeSchema = z.object({
    url: z.string().min(1, "Audio file path or URL is required"),
    validationError: z.string().optional(),
});

export type AudioNodeData = z.infer<typeof AudioNodeSchema>;
