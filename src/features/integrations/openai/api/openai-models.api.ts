import { apiClient } from "@/lib/api-client";
import { OpenAIModelsListSchema } from "../domain/openai.schemas";
import type { OpenAIModel, OpenAIModelActionMode } from "../domain/openai.types";

export const openAIModelsApi = {
  async list(orgId: string, credentialId: string, actionMode?: OpenAIModelActionMode): Promise<OpenAIModel[]> {
    const { data } = await apiClient.get("/integrations/openai/models", {
      params: { orgId, credentialId, actionMode },
    });
    return OpenAIModelsListSchema.parse(data);
  },
};
