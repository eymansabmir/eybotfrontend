import { z } from "zod";

export const HttpRequestCredentialSchema = z.object({
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

export const HttpRequestCredentialsListSchema = z.array(HttpRequestCredentialSchema);

export const HttpRequestPreviewSchema = z.object({
  statusCode: z.number(),
  data: z.unknown(),
});
