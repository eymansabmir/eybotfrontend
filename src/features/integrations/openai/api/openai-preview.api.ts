import { apiClient } from "@/lib/api-client";
import { OpenAIPreviewSchema } from "../domain/openai.schemas";
import type { OpenAIPreviewInput, OpenAIPreviewResult } from "../domain/openai.types";

export const openAIPreviewApi = {
  async run(input: OpenAIPreviewInput): Promise<OpenAIPreviewResult> {
    const { data } = await apiClient.post("/integrations/openai/preview", input);
    return OpenAIPreviewSchema.parse(data);
  },
};
