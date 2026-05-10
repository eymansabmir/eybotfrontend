import { z } from "zod";

export const TextNodeSchema = z.object({
    message: z.string().min(1, "Message is required"),
    footer: z.string().optional(),
    variableName: z.string().optional(),
    variableScope: z.enum(["session", "contact"]).default("session"),
});

export type TextNodeData = z.infer<typeof TextNodeSchema>;
