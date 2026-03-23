import { z } from "zod";

export const AnthropicCredentialSchema = z.object({
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

export const AnthropicCredentialsListSchema = z.array(AnthropicCredentialSchema);

export const AnthropicTestConnectionSchema = z.object({
  ok: z.boolean(),
  latencyMs: z.number(),
  statusCode: z.number().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const AnthropicModelSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const AnthropicModelsListSchema = z.array(AnthropicModelSchema);

export const AnthropicPreviewSchema = z.object({
  model: z.string(),
  content: z.string(),
});
