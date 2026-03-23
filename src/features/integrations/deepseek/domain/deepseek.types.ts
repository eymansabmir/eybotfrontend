export interface DeepSeekCredential {
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

export interface CreateDeepSeekCredentialInput {
  orgId: string;
  name: string;
  apiKey: string;
}

export interface DeepSeekTestConnectionResult {
  ok: boolean;
  latencyMs: number;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface DeepSeekModel {
  id: string;
  name: string;
}

export type DeepSeekModelActionMode = "chat_completion" | "generate_variables";

export interface DeepSeekPreviewInput {
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

export interface DeepSeekPreviewResult {
  model: string;
  content: string;
}
