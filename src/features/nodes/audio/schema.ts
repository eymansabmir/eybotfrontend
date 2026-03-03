import { z } from "zod";

export const AudioNodeSchema = z.object({
    url: z.string().url("Valid audio URL is required"),
});

export type AudioNodeData = z.infer<typeof AudioNodeSchema>;
