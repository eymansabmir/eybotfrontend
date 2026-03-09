import { z } from "zod";

export const AudioNodeSchema = z.object({
    filePath: z.string().min(1, "Audio file path or URL is required"),
});

export type AudioNodeData = z.infer<typeof AudioNodeSchema>;
