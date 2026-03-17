import { z } from "zod";

export const CardsNodeSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        imageUrl: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        buttons: z.array(z.object({
            id: z.string(),
            text: z.string().min(1, "Button text is required"),
            branchKey: z.string(),
        })).max(3).default([]),
    })).min(1, "At least one card is required"),
    interaction: z.object({
        mode: z.enum(["none", "input"]).default("input"),
        input: z.object({
            variableName: z.string().optional(),
            variableScope: z.enum(["session", "contact"]).default("session"),
            timeoutSeconds: z.number().default(300),
            defaultBranchKey: z.string().default("default"),
        }).optional(),
    }).default({ mode: "input" }),
});

export type CardsNodeData = z.infer<typeof CardsNodeSchema>;
