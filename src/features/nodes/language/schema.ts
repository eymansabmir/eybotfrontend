import { z } from "zod";

export const LanguageNodeSchema = z.object({
    message: z.string().min(1, "Message is required"),
    variable: z.string().default("selected_language"),
    timeoutSeconds: z.number().default(3600),
});

export type LanguageNodeData = z.infer<typeof LanguageNodeSchema>;
