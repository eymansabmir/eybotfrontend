import type { OpenAIVoiceActionMode } from "../domain/openai.types";

export interface OpenAIConfigDraft {
  mode: "" | "chat_completion" | "voice" | "assistant" | "generate_variables" | "image";
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
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  timeoutMs?: number;
  sendResponseToUser: boolean;
  fallbackText: string;
  // Assistant mode
  assistantId?: string;
  threadId?: string;
  additionalInstructions?: string;
  functions?: { name: string; code: string }[];
  // Generate Variables mode
  variablesToExtract?: { name: string; description?: string; type?: "string" | "number" | "boolean" }[];
  // Image mode
  imageSize?: string;
  imageQuality?: string;
}

type Action =
  | { type: "set"; payload: Partial<OpenAIConfigDraft> }
  | { type: "reset"; payload: OpenAIConfigDraft };

export function openAIConfigReducer(state: OpenAIConfigDraft, action: Action): OpenAIConfigDraft {
  if (action.type === "reset") return action.payload;
  return { ...state, ...action.payload };
}

export function createOpenAIConfigDraft(input: Partial<OpenAIConfigDraft>): OpenAIConfigDraft {
  // @ts-expect-error fallback mapping for old data where mode might be "agent"
  const rawMode = input.mode === "agent" ? "chat_completion" : input.mode;
  const mode = rawMode ?? "";
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
    resultVariable: input.resultVariable ?? "",
    resultScope: input.resultScope ?? "session",
    temperature: input.temperature,
    maxTokens: input.maxTokens,
    topP: input.topP,
    frequencyPenalty: input.frequencyPenalty,
    presencePenalty: input.presencePenalty,
    timeoutMs: input.timeoutMs,
    sendResponseToUser: input.sendResponseToUser ?? false,
    fallbackText: input.fallbackText ?? "",
    assistantId: input.assistantId,
    threadId: input.threadId,
    additionalInstructions: input.additionalInstructions,
    functions: input.functions,
    variablesToExtract: input.variablesToExtract,
    imageSize: input.imageSize,
    imageQuality: input.imageQuality,
  };
}
