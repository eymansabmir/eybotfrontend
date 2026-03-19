import { z } from "zod";

export const ElevenLabsNodeSchema = z.object({
  credentialId: z.string().min(1, "Credential is required"),
  voiceId: z.string().min(1, "Voice is required"),
  text: z.string().min(1, "Text is required"),
  modelId: z.string().optional(),
  outputFormat: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
  resultVariable: z.string().min(1),
  resultScope: z.enum(["session", "contact"]).default("session"),
  sendResponseToUser: z.boolean().default(true),
  fallbackText: z.string().optional(),
});

export type ElevenLabsNodeData = z.infer<typeof ElevenLabsNodeSchema>;
