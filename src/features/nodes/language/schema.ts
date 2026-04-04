import { z } from "zod";

export const LanguageNodeSchema = z.object({
    message: z.string().min(1, "Message is required"),
    variableName: z.string().default("selected_language"),
    variableScope: z.enum(["session", "contact"]).default("session"),
    timeoutSeconds: z.number().default(3600),
});

export type LanguageNodeData = z.infer<typeof LanguageNodeSchema>;
