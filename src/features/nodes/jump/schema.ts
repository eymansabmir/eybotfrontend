import { z } from "zod";

export const JumpNodeDataSchema = z.object({
    targetNodeId: z.string().optional(),
});

export type JumpNodeData = z.infer<typeof JumpNodeDataSchema>;
