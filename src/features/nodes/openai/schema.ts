import { z } from "zod";

export const OpenAINodeSchema = z.object({
  mode: z.enum(["agent", "voice"]).default("agent"),
  voiceAction: z.enum(["create_speech", "create_transcription"]).default("create_speech"),
  credentialId: z.string().min(1, "Credential is required"),
  model: z.string().min(1, "Model is required"),
  voice: z.string().optional(),
  prompt: z.string().min(1, "Prompt is required"),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  timeoutMs: z.number().int().positive().optional(),
  resultVariable: z.string().min(1),
  resultScope: z.enum(["session", "contact"]).default("session"),
  sendResponseToUser: z.boolean().default(true),
  fallbackText: z.string().optional(),
});

export type OpenAINodeData = z.infer<typeof OpenAINodeSchema>;
