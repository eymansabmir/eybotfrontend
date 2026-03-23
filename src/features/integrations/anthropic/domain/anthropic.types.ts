export interface AnthropicCredential {
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

export interface CreateAnthropicCredentialInput {
  orgId: string;
  name: string;
  apiKey: string;
}

export interface AnthropicTestConnectionResult {
  ok: boolean;
  latencyMs: number;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface AnthropicModel {
  id: string;
  name: string;
}

export type AnthropicModelActionMode = "chat_completion" | "generate_variables";

export interface AnthropicPreviewInput {
  orgId: string;
  credentialId: string;
  model: string;
  messages?: { role: string; content?: string; dialogueVariableId?: string; startsBy?: 'user' | 'assistant' }[];
  prompt?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface AnthropicPreviewResult {
  model: string;
  content: string;
}
