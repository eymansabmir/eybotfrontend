import { apiClient } from "@/lib/api-client";
import { OpenAITestConnectionSchema } from "../domain/openai.schemas";
import type { OpenAITestConnectionResult } from "../domain/openai.types";

export const openAITestApi = {
  async testConnection(orgId: string, credentialId: string): Promise<OpenAITestConnectionResult> {
    const { data } = await apiClient.post(`/integrations/openai/credentials/${credentialId}/test`, { orgId });
    return OpenAITestConnectionSchema.parse(data);
  },
};
