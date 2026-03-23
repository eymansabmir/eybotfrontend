import { z } from "zod";

export const DeepSeekNodeSchema = z.object({
  mode: z.enum(["chat_completion", "generate_variables"]).optional(),
  credentialId: z.string().optional(),
  model: z.string().optional(),
  prompt: z.string().optional(),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string().optional(),
    dialogueVariableId: z.string().optional(),
    startsBy: z.enum(["user", "assistant"]).optional(),
  })).optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  timeoutMs: z.number().int().positive().optional(),
  resultVariable: z.string().optional(),
  resultScope: z.enum(["session", "contact"]).optional(),
  sendResponseToUser: z.boolean().optional(),
  fallbackText: z.string().optional(),
  // Generate Variables mode
  variablesToExtract: z.array(z.object({ name: z.string(), description: z.string().optional(), type: z.enum(["string", "number", "boolean"]).optional() })).optional(),
});

export type DeepSeekNodeData = z.infer<typeof DeepSeekNodeSchema>;
