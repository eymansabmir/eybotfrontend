import {
  OpenAICreateSpeechResultSchema,
  OpenAICreateTranscriptionResultSchema,
  OpenAICredentialSchema,
  OpenAIModelSchema,
  OpenAIPreviewSchema,
  OpenAITestConnectionSchema,
  OpenAIVoiceModelSchema,
} from "./openai.schemas";
import type {
  OpenAICreateSpeechResult,
  OpenAICreateTranscriptionResult,
  OpenAICredential,
  OpenAIModel,
  OpenAIPreviewResult,
  OpenAITestConnectionResult,
  OpenAIVoiceModel,
} from "./openai.types";

export function mapOpenAICredential(payload: unknown): OpenAICredential {
  return OpenAICredentialSchema.parse(payload);
}

export function mapOpenAIModel(payload: unknown): OpenAIModel {
  return OpenAIModelSchema.parse(payload);
}

export function mapOpenAITestResult(payload: unknown): OpenAITestConnectionResult {
  return OpenAITestConnectionSchema.parse(payload);
}

export function mapOpenAIPreview(payload: unknown): OpenAIPreviewResult {
  return OpenAIPreviewSchema.parse(payload);
}

export function mapOpenAIVoiceModel(payload: unknown): OpenAIVoiceModel {
  return OpenAIVoiceModelSchema.parse(payload);
}

export function mapOpenAICreateSpeechResult(payload: unknown): OpenAICreateSpeechResult {
  return OpenAICreateSpeechResultSchema.parse(payload);
}

export function mapOpenAICreateTranscriptionResult(payload: unknown): OpenAICreateTranscriptionResult {
  return OpenAICreateTranscriptionResultSchema.parse(payload);
}
