import { apiClient } from "@/lib/api-client";
import {
  OpenAICreateSpeechResultSchema,
  OpenAICreateTranscriptionResultSchema,
  OpenAIVoiceModelsListSchema,
} from "../domain/openai.schemas";
import type {
  OpenAICreateSpeechInput,
  OpenAICreateSpeechResult,
  OpenAICreateTranscriptionInput,
  OpenAICreateTranscriptionResult,
  OpenAIListSpeechModelsInput,
  OpenAIVoiceModel,
} from "../domain/openai.types";

export const openAIVoiceApi = {
  async listModels(input: OpenAIListSpeechModelsInput): Promise<OpenAIVoiceModel[]> {
    const { data } = await apiClient.get("/integrations/openai/voice/models", {
      params: {
        orgId: input.orgId,
        credentialId: input.credentialId,
        actionMode: input.actionMode,
        timeoutMs: input.timeoutMs,
      },
    });
    return OpenAIVoiceModelsListSchema.parse(data);
  },

  async createSpeech(input: OpenAICreateSpeechInput): Promise<OpenAICreateSpeechResult> {
    const { data } = await apiClient.post("/integrations/openai/voice/speech", {
      orgId: input.orgId,
      credentialId: input.credentialId,
      model: input.model,
      voice: input.voice,
      input: input.input,
      format: input.format,
      speed: input.speed,
      timeoutMs: input.timeoutMs,
    });
    return OpenAICreateSpeechResultSchema.parse(data);
  },

  async createTranscription(input: OpenAICreateTranscriptionInput): Promise<OpenAICreateTranscriptionResult> {
    const formData = new FormData();
    formData.set("orgId", input.orgId);
    formData.set("credentialId", input.credentialId);
    formData.set("model", input.model);
    if (input.audioFile) {
      formData.set("audioFile", input.audioFile);
    }
    if (input.audioUrl) {
      formData.set("audioUrl", input.audioUrl);
    }
    if (input.language) {
      formData.set("language", input.language);
    }
    if (input.prompt) {
      formData.set("prompt", input.prompt);
    }
    if (input.timeoutMs) {
      formData.set("timeoutMs", String(input.timeoutMs));
    }

    const { data } = await apiClient.post("/integrations/openai/voice/transcription", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return OpenAICreateTranscriptionResultSchema.parse(data);
  },
};
