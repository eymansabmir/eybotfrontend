import { z } from "zod";

export const OpenAICredentialSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  type: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  isActive: z.boolean(),
  lastTestedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const OpenAICredentialsListSchema = z.array(OpenAICredentialSchema);

export const OpenAITestConnectionSchema = z.object({
  ok: z.boolean(),
  latencyMs: z.number(),
  statusCode: z.number().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const OpenAIModelSchema = z.object({
  id: z.string(),
  ownedBy: z.string().optional(),
});

export const OpenAIModelsListSchema = z.array(OpenAIModelSchema);

export const OpenAIPreviewSchema = z.object({
  id: z.string(),
  model: z.string(),
  content: z.string(),
  finishReason: z.string().optional(),
});

export const OpenAIVoiceModelSchema = z.object({
  id: z.string(),
  ownedBy: z.string().optional(),
  mode: z.enum(['create_speech', 'create_transcription']),
});

export const OpenAIVoiceModelsListSchema = z.array(OpenAIVoiceModelSchema);

export const OpenAICreateSpeechResultSchema = z.object({
  audioUrl: z.string().url(),
  mimeType: z.string(),
  model: z.string(),
  voice: z.string(),
});

export const OpenAICreateTranscriptionResultSchema = z.object({
  text: z.string(),
  model: z.string(),
  durationSeconds: z.number().optional(),
});
