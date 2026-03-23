import { apiClient } from "@/lib/api-client";
import { DeepSeekModelsListSchema } from "../domain/deepseek.schemas";
import type { DeepSeekModel, DeepSeekModelActionMode } from "../domain/deepseek.types";

export const deepSeekModelsApi = {
  async list(orgId: string, credentialId: string, actionMode?: DeepSeekModelActionMode): Promise<DeepSeekModel[]> {
    const { data } = await apiClient.get("/integrations/deepseek/models", {
      params: { orgId, credentialId, actionMode },
    });
    return DeepSeekModelsListSchema.parse(data);
  },
};
