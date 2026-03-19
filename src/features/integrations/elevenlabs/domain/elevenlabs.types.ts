export interface ElevenLabsCredential {
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

export interface CreateElevenLabsCredentialInput {
  orgId: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
}

export interface ElevenLabsTestConnectionResult {
  ok: boolean;
  latencyMs: number;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface ElevenLabsModel {
  id: string;
  name?: string;
}

export interface ElevenLabsVoice {
  id: string;
  name: string;
  category?: string;
}
