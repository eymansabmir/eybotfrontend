import { z } from "zod";

export const InputNodeSchema = z.object({
    question: z.string().min(1, "Question is required"),
    variable: z.string().min(1, "Variable name is required"),
    validationType: z.enum(["text", "number", "email", "phone"]).default("text"),
    timeoutSeconds: z.number().default(3600),
});

export type InputNodeData = z.infer<typeof InputNodeSchema>;
