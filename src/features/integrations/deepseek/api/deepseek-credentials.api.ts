import { apiClient } from "@/lib/api-client";
import { DeepSeekCredentialSchema, DeepSeekCredentialsListSchema } from "../domain/deepseek.schemas";
import type { CreateDeepSeekCredentialInput, DeepSeekCredential } from "../domain/deepseek.types";

export const deepSeekCredentialsApi = {
  async list(orgId: string): Promise<DeepSeekCredential[]> {
    const { data } = await apiClient.get("/integrations/credentials", {
      params: {
        orgId,
        type: "DEEPSEEK",
        includeInactive: true,
        includeRevoked: true,
      },
    });
    return DeepSeekCredentialsListSchema.parse(data);
  },

  async create(input: CreateDeepSeekCredentialInput): Promise<DeepSeekCredential> {
    const { data } = await apiClient.post("/integrations/credentials", {
      orgId: input.orgId,
      name: input.name,
      type: "DEEPSEEK",
      secret: {
        apiKey: input.apiKey,
      },
      metadata: {},
      isActive: true,
    });
    return DeepSeekCredentialSchema.parse(data);
  },

  async revoke(orgId: string, credentialId: string): Promise<DeepSeekCredential> {
    const { data } = await apiClient.patch(`/integrations/credentials/${credentialId}/revoke`, { orgId });
    return DeepSeekCredentialSchema.parse(data);
  },
};
