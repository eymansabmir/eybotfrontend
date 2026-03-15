import { z } from "zod";

export const VideoNodeSchema = z.object({
    url: z.string().min(1, "Video file path or URL is required"),
    caption: z.string().optional(),
});

export type VideoNodeData = z.infer<typeof VideoNodeSchema>;
