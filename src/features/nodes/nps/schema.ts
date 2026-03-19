import { z } from "zod";

export const NpsNodeSchema = z.object({
    message: z.string().min(1, "Question is required"),
    variable: z.string().min(1, "Variable name is required"),
    variableScope: z.enum(["session", "contact"]).default("session"),
    length: z.number().min(1).max(10).default(10),
    startsAt: z.number().default(1),
    leftLabel: z.string().optional(),
    rightLabel: z.string().optional(),
    buttonLabel: z.string().default("Rate"),
    timeoutSeconds: z.number().default(3600),
});

export type NpsNodeData = z.infer<typeof NpsNodeSchema>;
