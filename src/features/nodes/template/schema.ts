import { z } from "zod";

export const TemplateNodeSchema = z.object({
    templateName: z.string().min(1, "Template name is required"),
    languageCode: z.string().min(1, "Language code is required"),
    components: z.array(z.any()).optional(),
});

export type TemplateNodeData = z.infer<typeof TemplateNodeSchema>;
