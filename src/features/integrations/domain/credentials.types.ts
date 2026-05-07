import { z } from "zod";

export const CredentialTypeEnum = z.enum([
  "OPENAI",
  "WHATSAPP_CLOUD",
  "GOOGLE_SHEETS",
  "ELEVENLABS",
  "ANTHROPIC",
  "DEEPSEEK",
  "NOCODB",
  "HTTP_REQUEST",
]);

export type CredentialType = z.infer<typeof CredentialTypeEnum>;

export const IntegrationCredentialSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  type: CredentialTypeEnum,
  metadata: z.record(z.string(), z.any()).nullable(),
  isActive: z.boolean(),
  revokedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type IntegrationCredential = z.infer<typeof IntegrationCredentialSchema>;

export const IntegrationCredentialsListSchema = z.array(IntegrationCredentialSchema);
