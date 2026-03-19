import { z } from "zod";

export const FileNodeSchema = z.object({
    message: z.string().min(1, "Message is required"),
    variableName: z.string().min(1, "Variable name is required"),
    variableScope: z.enum(["session", "contact"]).default("session"),
    timeoutSeconds: z.number().default(3600),
});

export type FileNodeData = z.infer<typeof FileNodeSchema>;
