import { apiClient } from "@/lib/api-client";
import { AnthropicPreviewSchema } from "../domain/anthropic.schemas";
import type { AnthropicPreviewInput, AnthropicPreviewResult } from "../domain/anthropic.types";

export const anthropicPreviewApi = {
  async run(input: AnthropicPreviewInput): Promise<AnthropicPreviewResult> {
    const { data } = await apiClient.post("/integrations/anthropic/preview", input);
    return AnthropicPreviewSchema.parse(data);
  },
};
