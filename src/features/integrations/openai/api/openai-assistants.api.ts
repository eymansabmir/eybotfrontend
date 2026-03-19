import { apiClient } from "@/lib/api-client";
import { OpenAIAssistantsListSchema } from "../domain/openai.schemas";
import type { OpenAIAssistant } from "../domain/openai.types";

export const openAIAssistantsApi = {
  async list(orgId: string, credentialId: string): Promise<OpenAIAssistant[]> {
    const { data } = await apiClient.get("/integrations/openai/assistants", {
      params: { orgId, credentialId },
    });
    return OpenAIAssistantsListSchema.parse(data);
  },
};
