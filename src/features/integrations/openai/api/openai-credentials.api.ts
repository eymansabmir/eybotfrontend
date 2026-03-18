import { apiClient } from "@/lib/api-client";
import { OpenAICredentialSchema, OpenAICredentialsListSchema } from "../domain/openai.schemas";
import type { CreateOpenAICredentialInput, OpenAICredential } from "../domain/openai.types";

export const openAICredentialsApi = {
  async list(orgId: string): Promise<OpenAICredential[]> {
    const { data } = await apiClient.get("/integrations/credentials", {
      params: {
        orgId,
        type: "OPENAI",
        includeInactive: true,
        includeRevoked: true,
      },
    });
    return OpenAICredentialsListSchema.parse(data);
  },

  async create(input: CreateOpenAICredentialInput): Promise<OpenAICredential> {
    const { data } = await apiClient.post("/integrations/credentials", {
      orgId: input.orgId,
      name: input.name,
      type: "OPENAI",
      secret: {
        apiKey: input.apiKey,
        ...(input.baseUrl ? { baseUrl: input.baseUrl } : {}),
      },
      metadata: {
        ...(input.baseUrl ? { baseUrl: input.baseUrl } : {}),
      },
      isActive: true,
    });
    return OpenAICredentialSchema.parse(data);
  },

  async revoke(orgId: string, credentialId: string): Promise<OpenAICredential> {
    const { data } = await apiClient.patch(`/integrations/credentials/${credentialId}/revoke`, { orgId });
    return OpenAICredentialSchema.parse(data);
  },
};
