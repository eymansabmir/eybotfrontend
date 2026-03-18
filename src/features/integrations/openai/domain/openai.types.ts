export interface OpenAICredential {
  id: string;
  orgId: string;
  name: string;
  type: string;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  lastTestedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpenAICredentialInput {
  orgId: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
}

export interface OpenAITestConnectionResult {
  ok: boolean;
  latencyMs: number;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface OpenAIModel {
  id: string;
  ownedBy?: string;
}

export type OpenAIModelActionMode = "agent";

export interface OpenAIPreviewInput {
  orgId: string;
  credentialId: string;
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant" | "tool"; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

export interface OpenAIPreviewResult {
  id: string;
  model: string;
  content: string;
  finishReason?: string;
}

export type OpenAIVoiceActionMode = "create_speech" | "create_transcription";

export interface OpenAIVoiceModel {
  id: string;
  ownedBy?: string;
  mode: OpenAIVoiceActionMode;
}

export interface OpenAIListSpeechModelsInput {
  orgId: string;
  credentialId: string;
  actionMode?: OpenAIVoiceActionMode;
  timeoutMs?: number;
}

export interface OpenAICreateSpeechInput {
  orgId: string;
  credentialId: string;
  model: string;
  voice: string;
  input: string;
  format?: "mp3" | "wav" | "opus" | "aac" | "flac" | "pcm";
  speed?: number;
  timeoutMs?: number;
  saveUrlInVariableId?: string;
}

export interface OpenAICreateSpeechResult {
  audioUrl: string;
  mimeType: string;
  model: string;
  voice: string;
}

export interface OpenAICreateTranscriptionInput {
  orgId: string;
  credentialId: string;
  model: string;
  audioFile?: File;
  audioUrl?: string;
  language?: string;
  prompt?: string;
  timeoutMs?: number;
  transcriptionVariableId?: string;
}

export interface OpenAICreateTranscriptionResult {
  text: string;
  model: string;
  durationSeconds?: number;
}

export interface OpenAIVoiceFormState {
  actionMode: OpenAIVoiceActionMode;
  credentialId: string;
  model: string;
  voice: string;
  textInput: string;
  format: "mp3" | "wav" | "opus" | "aac" | "flac" | "pcm";
  speed: number;
  audioFile?: File;
  audioUrl: string;
  language: string;
  prompt: string;
  saveUrlInVariableId: string;
  transcriptionVariableId: string;
}
