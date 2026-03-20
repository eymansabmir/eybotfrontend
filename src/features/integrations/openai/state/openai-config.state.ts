import type { OpenAIVoiceActionMode } from "../domain/openai.types";

export interface OpenAIConfigDraft {
  mode: "agent" | "voice";
  voiceAction: OpenAIVoiceActionMode;
  credentialId: string;
  model: string;
  voice: string;
  prompt: string;
  audioUrl: string;
  systemPrompt: string;
  resultVariable: string;
  resultScope: "session" | "contact";
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  sendResponseToUser: boolean;
  fallbackText: string;
}

type Action =
  | { type: "set"; payload: Partial<OpenAIConfigDraft> }
  | { type: "reset"; payload: OpenAIConfigDraft };

export function openAIConfigReducer(state: OpenAIConfigDraft, action: Action): OpenAIConfigDraft {
  if (action.type === "reset") return action.payload;
  return { ...state, ...action.payload };
}

export function createOpenAIConfigDraft(input: Partial<OpenAIConfigDraft>): OpenAIConfigDraft {
  const mode = input.mode ?? "agent";
  const voiceAction = input.voiceAction ?? "create_speech";
  const legacyPromptAsAudioUrl = mode === "voice" && voiceAction === "create_transcription"
    ? (input.prompt ?? "")
    : "";

  return {
    mode,
    voiceAction,
    credentialId: input.credentialId ?? "",
    model: input.model ?? "",
    voice: input.voice ?? "alloy",
    prompt: input.prompt ?? "",
    audioUrl: input.audioUrl ?? legacyPromptAsAudioUrl,
    systemPrompt: input.systemPrompt ?? "",
    resultVariable: input.resultVariable ?? "openai_response",
    resultScope: input.resultScope ?? "session",
    temperature: input.temperature,
    maxTokens: input.maxTokens,
    timeoutMs: input.timeoutMs,
    sendResponseToUser: input.sendResponseToUser ?? true,
    fallbackText: input.fallbackText ?? "",
  };
}
