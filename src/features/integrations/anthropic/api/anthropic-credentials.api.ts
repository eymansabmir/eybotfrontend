import { apiClient } from "@/lib/api-client";
import { AnthropicCredentialSchema, AnthropicCredentialsListSchema } from "../domain/anthropic.schemas";
import type { CreateAnthropicCredentialInput, AnthropicCredential } from "../domain/anthropic.types";

export const anthropicCredentialsApi = {
  async list(orgId: string): Promise<AnthropicCredential[]> {
    const { data } = await apiClient.get("/integrations/credentials", {
      params: {
        orgId,
        type: "ANTHROPIC",
        includeInactive: true,
        includeRevoked: true,
      },
    });
    return AnthropicCredentialsListSchema.parse(data);
  },

  async create(input: CreateAnthropicCredentialInput): Promise<AnthropicCredential> {
    const { data } = await apiClient.post("/integrations/credentials", {
      orgId: input.orgId,
      name: input.name,
      type: "ANTHROPIC",
      secret: {
        apiKey: input.apiKey,
      },
      metadata: {},
      isActive: true,
    });
    return AnthropicCredentialSchema.parse(data);
  },

  async revoke(orgId: string, credentialId: string): Promise<AnthropicCredential> {
    const { data } = await apiClient.patch(`/integrations/credentials/${credentialId}/revoke`, { orgId });
    return AnthropicCredentialSchema.parse(data);
  },
};
