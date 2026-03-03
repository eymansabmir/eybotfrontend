import { z } from "zod";

export const VideoNodeSchema = z.object({
    url: z.string().url("Valid video URL is required"),
    caption: z.string().optional(),
});

export type VideoNodeData = z.infer<typeof VideoNodeSchema>;
