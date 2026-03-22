import { z } from 'zod';

export const ElevenLabsCredentialSchema = z.object({
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

export const ElevenLabsCredentialsListSchema = z.array(ElevenLabsCredentialSchema);

export const ElevenLabsTestConnectionSchema = z.object({
  ok: z.boolean(),
  latencyMs: z.number(),
  statusCode: z.number().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const ElevenLabsModelSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
});

export const ElevenLabsModelsListSchema = z.array(ElevenLabsModelSchema);

export const ElevenLabsVoiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export const ElevenLabsVoicesListSchema = z.array(ElevenLabsVoiceSchema);
