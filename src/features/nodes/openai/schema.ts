import { z } from "zod";

export const OpenAINodeSchema = z.object({
  mode: z.enum(["chat_completion", "voice", "assistant", "generate_variables", "image"]).optional(),
  voiceAction: z.enum(["create_speech", "create_transcription"]).optional(),
  credentialId: z.string().optional(),
  model: z.string().optional(),
  voice: z.string().optional(),
  prompt: z.string().optional(),
  audioUrl: z.string().optional(),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  timeoutMs: z.number().int().positive().optional(),
  resultVariable: z.string().optional(),
  resultScope: z.enum(["session", "contact"]).optional(),
  sendResponseToUser: z.boolean().optional(),
  fallbackText: z.string().optional(),
  // Assistant mode
  assistantId: z.string().optional(),
  threadId: z.string().optional(),
  additionalInstructions: z.string().optional(),
  functions: z.array(z.object({ name: z.string(), code: z.string() })).optional(),
  // Generate Variables mode
  variablesToExtract: z.array(z.object({ name: z.string(), description: z.string().optional(), type: z.enum(["string", "number", "boolean"]).optional() })).optional(),
  // Image mode
  imageSize: z.string().optional(),
  imageQuality: z.string().optional(),
});

export type OpenAINodeData = z.infer<typeof OpenAINodeSchema>;
