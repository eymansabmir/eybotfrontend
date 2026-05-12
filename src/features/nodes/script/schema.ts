import { z } from "zod";

export const ScriptNodeSchema = z.object({
    name: z.string().optional(),
    content: z.string().optional(),
});

export type ScriptNodeData = z.infer<typeof ScriptNodeSchema>;
