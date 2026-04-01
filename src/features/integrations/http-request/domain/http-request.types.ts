export type HttpRequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "CONNECT" | "OPTIONS" | "TRACE";

export interface HttpRequestCredential {
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

export interface CreateHttpRequestCredentialInput {
  orgId: string;
  name: string;
  baseUrl?: string;
  bearerToken?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  proxyUrl?: string;
}

export interface HttpRequestResponseMapping {
  jsonPath: string;
  variableName: string;
  scope: "session" | "contact";
}

export interface HttpRequestPreviewInput {
  orgId: string;
  credentialId?: string;
  proxyCredentialsId?: string;
  url: string;
  method: HttpRequestMethod;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface HttpRequestPreviewResult {
  statusCode: number;
  data: unknown;
}
