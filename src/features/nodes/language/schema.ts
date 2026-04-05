import { z } from "zod";

export const LanguageNodeSchema = z.object({
    message: z.string().min(1, "Message is required"),
    variable: z.string().default("selected_language"),
    timeoutSeconds: z.number().default(3600),
    localizationEnabled: z.boolean().optional(),
    languages: z.array(z.string()).max(10, "Maximum 10 languages are allowed in Language node").default([]),
    defaultLanguage: z.string().optional(),
});

export type LanguageNodeData = z.infer<typeof LanguageNodeSchema>;
