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
        enabled: z.boolean().optional(),
        keywords: z.array(z.string()).optional(),
        logicalOperator: z.enum(['AND', 'OR']).optional(),
        comparisons: z.array(z.object({
            label: z.string().optional(),
            id: z.string().optional(),
            variableId: z.string().optional(),
            operator: z.string(),
            value: z.string(),
        })).optional(),
    }),
    nodes: z.array(z.unknown()), // React Flow nodes will be mapped to backend nodes
    edges: z.array(z.unknown()),
    settings: z.object({
        credentialId: z.string().optional(),
        timeoutSeconds: z.number().default(300),
        maxSteps: z.number().default(100),
        fallbackMessage: z.string().optional(),
        localization: z.object({
            isEnabled: z.boolean().default(false),
            languages: z.array(z.string()).max(10, "Maximum 10 languages are allowed").default([]),
            defaultLanguage: z.string().optional(),
        }).optional(),
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
    updatedBy: z.string().optional(), // Adding for UI metadata
    executions: z.number().default(0), // Adding for UI metadata
    isConfigured: z.boolean().default(false),
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
