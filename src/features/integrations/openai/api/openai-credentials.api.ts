import { apiClient } from "@/lib/api-client";
import { mapOpenAICredential } from "../domain/openai.mappers";
import { OpenAICredentialsListSchema } from "../domain/openai.schemas";
import type { CreateOpenAICredentialInput, OpenAICredential } from "../domain/openai.types";

export const openAICredentialsApi = {
  async list(orgId: string): Promise<OpenAICredential[]> {
    const { data } = await apiClient.get("/integrations/openai/credentials", { params: { orgId } });
    return OpenAICredentialsListSchema.parse(data);
  },

  async create(input: CreateOpenAICredentialInput): Promise<OpenAICredential> {
    const { data } = await apiClient.post("/integrations/openai/credentials", input);
    return mapOpenAICredential(data);
  },

  async revoke(orgId: string, credentialId: string): Promise<OpenAICredential> {
    const { data } = await apiClient.patch(`/integrations/openai/credentials/${credentialId}/revoke`, { orgId });
    return mapOpenAICredential(data);
  },
};
