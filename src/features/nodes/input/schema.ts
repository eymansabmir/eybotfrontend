import { z } from "zod";

export const InputNodeSchema = z.object({
    message: z.string().min(1, "Question is required"),
    variableName: z.string().min(1, "Variable name is required"),
    variableScope: z.enum(["session", "contact"]).default("session"),
    validationType: z.enum(["text", "number", "email", "phone"]).default("text"),
    timeoutSeconds: z.number().default(3600),
});

export type InputNodeData = z.infer<typeof InputNodeSchema>;
