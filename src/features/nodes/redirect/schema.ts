import { z } from "zod";

export const RedirectNodeSchema = z.object({
    url: z.string().min(1, "URL is required"),
    isNewTab: z.boolean().default(false),
});

export type RedirectNodeData = z.infer<typeof RedirectNodeSchema>;
