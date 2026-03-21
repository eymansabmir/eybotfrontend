import { apiClient } from "@/lib/api-client";
import { AnthropicTestConnectionSchema } from "../domain/anthropic.schemas";
import type { AnthropicTestConnectionResult } from "../domain/anthropic.types";

export const anthropicTestApi = {
  async testConnection(orgId: string, credentialId: string): Promise<AnthropicTestConnectionResult> {
    const { data } = await apiClient.post(`/integrations/anthropic/test`, { orgId, credentialId });
    return AnthropicTestConnectionSchema.parse(data);
  },
};
