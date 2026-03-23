import { apiClient } from "@/lib/api-client";
import { GoogleSheetsCredentialSchema, GoogleSheetsCredentialsListSchema } from "../domain/google-sheets.schemas";
import type { CreateGoogleSheetsCredentialInput, GoogleSheetsCredential } from "../domain/google-sheets.types";

export const googleSheetsCredentialsApi = {
  async list(orgId: string): Promise<GoogleSheetsCredential[]> {
    const { data } = await apiClient.get("/integrations/credentials", {
      params: {
        orgId,
        type: "GOOGLE_SHEETS",
        includeInactive: true,
        includeRevoked: true,
      },
    });
    return GoogleSheetsCredentialsListSchema.parse(data);
  },

  async create(input: CreateGoogleSheetsCredentialInput): Promise<GoogleSheetsCredential> {
    const { data } = await apiClient.post("/integrations/credentials", {
      orgId: input.orgId,
      name: input.name,
      type: "GOOGLE_SHEETS",
      secret: {
        clientEmail: input.clientEmail,
        privateKey: input.privateKey,
      },
      metadata: {
        clientEmail: input.clientEmail,
      },
      isActive: true,
    });
    return GoogleSheetsCredentialSchema.parse(data);
  },

  async revoke(orgId: string, credentialId: string): Promise<GoogleSheetsCredential> {
    const { data } = await apiClient.patch(`/integrations/credentials/${credentialId}/revoke`, { orgId });
    return GoogleSheetsCredentialSchema.parse(data);
  },
};
