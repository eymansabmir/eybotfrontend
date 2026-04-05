import { apiClient } from "@/lib/api-client";
import { WhatsAppCredentialSchema, WhatsAppCredentialsListSchema } from "../domain/whatsapp.schemas";
import type { CreateWhatsAppCredentialInput, WhatsAppCredential } from "../domain/whatsapp.schemas";

export interface PhoneNumberInfo {
  displayPhoneNumber: string;
  formattedPhoneNumber: string;
  verifiedName: string | null;
}

export interface WebhookConfigInfo {
  callbackUrl: string;
  fallbackCallbackUrl: string;
  usesCustomWebhookPath: boolean;
  verifyTokenConfigured: boolean;
  verifyTokenHint: string;
}

export const whatsappCredentialsApi = {
  async list(orgId: string): Promise<WhatsAppCredential[]> {
    const { data } = await apiClient.get("/integrations/credentials", {
      params: {
        orgId,
        type: "WHATSAPP_CLOUD",
        includeInactive: false,
        includeRevoked: false,
      },
    });
    return WhatsAppCredentialsListSchema.parse(data);
  },

  async create(input: CreateWhatsAppCredentialInput): Promise<WhatsAppCredential> {
    const { data } = await apiClient.post("/integrations/credentials", {
      orgId: input.orgId,
      name: input.name,
      type: "WHATSAPP_CLOUD",
      secret: {
        accessToken: input.accessToken,
        phoneNumberId: input.phoneNumberId,
      },
      metadata: {
        phoneNumberId: input.phoneNumberId,
        displayPhoneNumber: input.displayPhoneNumber || null,
      },
      isActive: true,
    });
    return WhatsAppCredentialSchema.parse(data);
  },

  /**
   * Calls Meta's Graph API via our backend proxy to resolve the real
   * display phone number from a Phone Number ID + access token.
   */
  async getPhoneNumber(systemToken: string, phoneNumberId: string): Promise<PhoneNumberInfo> {
    const { data } = await apiClient.post("/integrations/whatsapp/phone-number", {
      systemToken,
      phoneNumberId,
    });
    return data as PhoneNumberInfo;
  },

  async getWebhookConfig(): Promise<WebhookConfigInfo> {
    const { data } = await apiClient.get("/integrations/whatsapp/webhook-config");
    return data as WebhookConfigInfo;
  },

  async revoke(orgId: string, credentialId: string): Promise<WhatsAppCredential> {
    const { data } = await apiClient.patch(`/integrations/credentials/${credentialId}/revoke`, { orgId });
    return WhatsAppCredentialSchema.parse(data);
  },

  async remove(orgId: string, credentialId: string): Promise<void> {
    await apiClient.delete(`/integrations/credentials/${credentialId}`, {
      data: { orgId },
    });
  },
};
