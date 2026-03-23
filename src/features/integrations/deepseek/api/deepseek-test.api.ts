import { apiClient } from "@/lib/api-client";
import { DeepSeekTestConnectionSchema } from "../domain/deepseek.schemas";
import type { DeepSeekTestConnectionResult } from "../domain/deepseek.types";

export const deepSeekTestApi = {
  async testConnection(orgId: string, credentialId: string): Promise<DeepSeekTestConnectionResult> {
    const { data } = await apiClient.post(`/integrations/deepseek/test`, { orgId, credentialId });
    return DeepSeekTestConnectionSchema.parse(data);
  },
};
