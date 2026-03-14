import { z } from "zod";

export const FlowStatusSchema = z.enum(['draft', 'published', 'archived']);
export type FlowStatus = z.infer<typeof FlowStatusSchema>;

export const TriggerTypeSchema = z.enum(['inbound', 'keyword', 'api']);
export type TriggerType = z.infer<typeof TriggerTypeSchema>;

export const BotSchema = z.object({
    id: z.string(),
    orgId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    status: FlowStatusSchema,
    version: z.number().default(1),
    triggerType: TriggerTypeSchema,
    triggerConfig: z.object({
        keywords: z.array(z.string()).optional(),
    }),
    nodes: z.array(z.any()), // React Flow nodes will be mapped to backend nodes
    edges: z.array(z.any()),
    settings: z.object({
        timeoutSeconds: z.number().default(300),
        maxSteps: z.number().default(100),
        fallbackMessage: z.string().optional(),
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string().optional(), // Adding for UI metadata
    executions: z.number().default(0), // Adding for UI metadata
});

export type Bot = z.infer<typeof BotSchema>;

export const CreateBotSchema = BotSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    executions: true,
    orgId: true // Usually handled by backend/auth context
});

export type CreateBotInput = z.infer<typeof CreateBotSchema>;
export type UpdateBotInput = Partial<CreateBotInput>;
