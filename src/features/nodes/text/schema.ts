import { z } from "zod";

export const TextNodeSchema = z.object({
    message: z.string().min(1, "Message is required"),
    variables: z.array(z.string()).optional(),
});

export type TextNodeData = z.infer<typeof TextNodeSchema>;
