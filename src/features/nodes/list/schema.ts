import { z } from "zod";

export const ListRowSchema = z.object({
    id: z.string().min(1, "Row ID required"),
    title: z.string().min(1, "Row title required"),
    description: z.string().optional(),
});

export const ListSectionSchema = z.object({
    title: z.string().min(1, "Section title required"),
    rows: z.array(ListRowSchema).min(1, "At least one row required"),
});

export const ListNodeSchema = z.object({
    body: z.string().min(1, "Body text is required"),
    buttonTitle: z.string().min(1, "Button title is required"),
    sections: z.array(ListSectionSchema).min(1, "At least one section required"),
    footer: z.string().optional(),
    interaction: z.object({
        mode: z.enum(["output", "input"]),
        input: z.object({
            type: z.literal("choice"),
            timeoutSeconds: z.number().min(1),
            options: z.array(z.object({
                id: z.string(),
                label: z.string(),
                branchKey: z.string(),
            })).optional(),
            defaultBranchKey: z.string().optional(),
            variableName: z.string().optional(),
            variableScope: z.enum(["session", "contact"]).optional(),
        }).optional(),
    }).optional(),
});

export type ListNodeData = z.infer<typeof ListNodeSchema>;
