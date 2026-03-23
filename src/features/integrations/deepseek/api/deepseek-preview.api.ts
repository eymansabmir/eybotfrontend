import { apiClient } from "@/lib/api-client";
import { DeepSeekPreviewSchema } from "../domain/deepseek.schemas";
import type { DeepSeekPreviewInput, DeepSeekPreviewResult } from "../domain/deepseek.types";

export const deepSeekPreviewApi = {
  async run(input: DeepSeekPreviewInput): Promise<DeepSeekPreviewResult> {
    const { data } = await apiClient.post("/integrations/deepseek/preview", input);
    return DeepSeekPreviewSchema.parse(data);
  },
};
