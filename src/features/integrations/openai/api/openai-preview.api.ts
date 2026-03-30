import { apiClient } from "@/lib/api-client";
import { OpenAIPreviewSchema } from "../domain/openai.schemas";
import type { OpenAIPreviewInput, OpenAIPreviewResult } from "../domain/openai.types";

export const openAIPreviewApi = {
  async run(input: OpenAIPreviewInput): Promise<OpenAIPreviewResult> {
    const { data } = await apiClient.post("/integrations/openai/preview", {
      orgId: input.orgId,
      credentialId: input.credentialId,
      model: input.model,
      messages: input.messages && input.messages.length > 0 
        ? input.messages.map(m => ({ role: m.role === 'dialogue' ? 'user' : m.role, content: m.content })) 
        : [
            ...(input.systemPrompt ? [{ role: "system", content: input.systemPrompt }] : []),
            ...(input.prompt ? [{ role: "user", content: input.prompt }] : []),
          ],
      temperature: input.temperature,
      maxTokens: input.maxTokens,
      topP: input.topP,
      frequencyPenalty: input.frequencyPenalty,
      presencePenalty: input.presencePenalty,
      timeoutMs: input.timeoutMs,
    });
    return OpenAIPreviewSchema.parse(data);
  },
};
