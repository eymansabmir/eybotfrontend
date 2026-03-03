import { z } from "zod";

export const SplitBranchSchema = z.object({
    key: z.string().min(1, "Branch key is required"),
    label: z.string().min(1, "Label is required"),
    percentage: z.number().min(0).max(100),
});

export const RandomSplitNodeSchema = z.object({
    branches: z.array(SplitBranchSchema).min(2, "At least 2 branches required"),
});

export type SplitBranch = z.infer<typeof SplitBranchSchema>;
export type RandomSplitNodeData = z.infer<typeof RandomSplitNodeSchema>;
