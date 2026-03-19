import { apiClient } from "@/lib/api-client";
import { OpenAIModelsListSchema } from "../domain/openai.schemas";
import type { OpenAIModel } from "../domain/openai.types";

export const openAIModelsApi = {
  async list(orgId: string, credentialId: string): Promise<OpenAIModel[]> {
    const { data } = await apiClient.get("/integrations/openai/models", {
      params: { orgId, credentialId },
    });
    return OpenAIModelsListSchema.parse(data);
  },
};
