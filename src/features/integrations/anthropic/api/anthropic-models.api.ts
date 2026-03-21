import { apiClient } from "@/lib/api-client";
import { AnthropicModelsListSchema } from "../domain/anthropic.schemas";
import type { AnthropicModel, AnthropicModelActionMode } from "../domain/anthropic.types";

export const anthropicModelsApi = {
  async list(orgId: string, credentialId: string, actionMode?: AnthropicModelActionMode): Promise<AnthropicModel[]> {
    const { data } = await apiClient.get("/integrations/anthropic/models", {
      params: { orgId, credentialId, actionMode },
    });
    return AnthropicModelsListSchema.parse(data);
  },
};
