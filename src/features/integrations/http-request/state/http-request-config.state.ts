import type { HttpRequestMethod } from "../domain/http-request.types";

export interface HttpRequestKeyValuePair {
  id: string;
  key: string;
  value: string;
}

export interface HttpRequestResponseMappingRow {
  id: string;
  jsonPath: string;
  variableName: string;
  scope: "session" | "contact";
}

export interface HttpRequestVariableTestRow {
  id: string;
  variableName: string;
  value: string;
}

export interface HttpRequestConfigDraft {
  credentialId: string;
  proxyCredentialsId: string;
  url: string;
  method: HttpRequestMethod;
  headers: HttpRequestKeyValuePair[];
  queryParams: HttpRequestKeyValuePair[];
  body: string;
  timeoutMs?: number;
  fallbackText: string;
  responseMappings: HttpRequestResponseMappingRow[];
  variablesForTest: HttpRequestVariableTestRow[];
}

export function createHttpRequestConfigDraft(input: Partial<Record<string, unknown>>): HttpRequestConfigDraft {
  const headers = toKeyValuePairs(input.headers);
  const queryParams = toKeyValuePairs(input.queryParams);
  const responseMappings = toResponseMappingRows(input.responseMapping);
  const variablesForTest = toVariableTestRows(input.variablesForTest);

  return {
    credentialId: typeof input.credentialId === "string" ? input.credentialId : "",
    proxyCredentialsId: typeof input.proxyCredentialsId === "string" ? input.proxyCredentialsId : "",
    url: typeof input.url === "string" ? input.url : "",
    method: toMethod(input.method),
    headers,
    queryParams,
    body: typeof input.body === "string" ? input.body : "",
    timeoutMs: typeof input.timeoutMs === "number" ? input.timeoutMs : 15000,
    fallbackText: typeof input.fallbackText === "string" ? input.fallbackText : "",
    responseMappings,
    variablesForTest,
  };
}

function toMethod(input: unknown): HttpRequestMethod {
  if (
    input === "GET" ||
    input === "POST" ||
    input === "PUT" ||
    input === "PATCH" ||
    input === "DELETE" ||
    input === "HEAD" ||
    input === "CONNECT" ||
    input === "OPTIONS" ||
    input === "TRACE"
  ) {
    return input;
  }
  return "GET";
}

function toKeyValuePairs(input: unknown): HttpRequestKeyValuePair[] {
  if (Array.isArray(input)) {
    return input
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          id: typeof row.id === "string" && row.id.trim() ? row.id : makeRowId(),
          key: typeof row.key === "string" ? row.key : "",
          value: typeof row.value === "string" ? row.value : "",
        };
      });
  }

  if (!input || typeof input !== "object") return [];

  return Object.entries(input as Record<string, unknown>).map(([key, value]) => ({
    id: makeRowId(),
    key,
    value: value == null ? "" : String(value),
  }));
}

function makeRowId(): string {
  return `kv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toResponseMappingRows(input: unknown): HttpRequestResponseMappingRow[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: typeof row.id === "string" && row.id.trim() ? row.id : makeRowId(),
        jsonPath: typeof row.jsonPath === "string" ? row.jsonPath : "",
        variableName: typeof row.variableName === "string" ? row.variableName : "",
        scope: row.scope === "contact" ? "contact" : "session",
      };
    });
}

function toVariableTestRows(input: unknown): HttpRequestVariableTestRow[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        id: typeof row.id === "string" && row.id.trim() ? row.id : makeRowId(),
        variableName: typeof row.variableName === "string" ? row.variableName : "",
        value: typeof row.value === "string" ? row.value : "",
      };
    });
}
