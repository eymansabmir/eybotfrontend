import { z } from "zod";

export const WhatsAppCredentialSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  type: z.literal("WHATSAPP_CLOUD"),
  secret: z.object({
    accessToken: z.string(),
    phoneNumberId: z.string(),
  }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  revokedAt: z.string().nullable().optional(),
});

export const WhatsAppCredentialsListSchema = z.array(WhatsAppCredentialSchema);

export type WhatsAppCredential = z.infer<typeof WhatsAppCredentialSchema>;

export type CreateWhatsAppCredentialInput = {
    orgId: string;
    name: string;
    accessToken: string;
    phoneNumberId: string;
    displayPhoneNumber?: string;
};
