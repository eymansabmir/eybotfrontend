import { z } from "zod";

export const LocationRequestNodeSchema = z.object({
    message: z.string().min(1, "Message is required"),
    variablePrefix: z.string().min(1, "Variable prefix is required"),
});

export type LocationRequestNodeData = z.infer<typeof LocationRequestNodeSchema>;
