import { apiClient } from "@/lib/api-client";
import { mapOpenAIPreview } from "../domain/openai.mappers";
import type { OpenAIPreviewInput, OpenAIPreviewResult } from "../domain/openai.types";

export const openAIPreviewApi = {
  async run(input: OpenAIPreviewInput): Promise<OpenAIPreviewResult> {
    const { data } = await apiClient.post("/integrations/openai/preview", input);
    return mapOpenAIPreview(data);
  },
};
