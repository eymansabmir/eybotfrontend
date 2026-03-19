import { apiClient } from "@/lib/api-client";
import { mapOpenAITestResult } from "../domain/openai.mappers";
import type { OpenAITestConnectionResult } from "../domain/openai.types";

export const openAITestApi = {
  async testConnection(orgId: string, credentialId: string): Promise<OpenAITestConnectionResult> {
    const { data } = await apiClient.post(`/integrations/openai/credentials/${credentialId}/test`, { orgId });
    return mapOpenAITestResult(data);
  },
};
