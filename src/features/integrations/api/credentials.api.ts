import { apiClient } from "@/lib/api-client";
import { 
  type IntegrationCredential, 
  IntegrationCredentialsListSchema, 
  IntegrationCredentialSchema 
} from "../domain/credentials.types";

export const integrationCredentialsApi = {
  async list(orgId: string): Promise<IntegrationCredential[]> {
    const { data } = await apiClient.get("/integrations/credentials", {
      params: {
        orgId,
        includeInactive: true,
        includeRevoked: true,
      },
    });
    return IntegrationCredentialsListSchema.parse(data);
  },

  async delete(orgId: string, credentialId: string): Promise<void> {
    await apiClient.delete(`/integrations/credentials/${credentialId}`, {
      data: { orgId },
    });
  },

  async revoke(orgId: string, credentialId: string): Promise<IntegrationCredential> {
    const { data } = await apiClient.patch(`/integrations/credentials/${credentialId}/revoke`, { orgId });
    return IntegrationCredentialSchema.parse(data);
  },
};
