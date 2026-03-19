import type { HttpRequestMethod } from "../domain/http-request.types";

export interface HttpRequestConfigDraft {
  credentialId: string;
  proxyCredentialsId: string;
  url: string;
  method: HttpRequestMethod;
  headersText: string;
  queryParamsText: string;
  body: string;
  timeoutMs?: number;
  responseMappingText: string;
}

export function createHttpRequestConfigDraft(input: Partial<Record<string, unknown>>): HttpRequestConfigDraft {
  const headers = typeof input.headers === "object" && input.headers !== null ? input.headers as Record<string, unknown> : undefined;
  const queryParams = typeof input.queryParams === "object" && input.queryParams !== null ? input.queryParams as Record<string, unknown> : undefined;
  const responseMapping = Array.isArray(input.responseMapping) ? input.responseMapping : undefined;

  return {
    credentialId: typeof input.credentialId === "string" ? input.credentialId : "",
    proxyCredentialsId: typeof input.proxyCredentialsId === "string" ? input.proxyCredentialsId : "",
    url: typeof input.url === "string" ? input.url : "",
    method: toMethod(input.method),
    headersText: headers ? JSON.stringify(headers, null, 2) : "{}",
    queryParamsText: queryParams ? JSON.stringify(queryParams, null, 2) : "{}",
    body: typeof input.body === "string" ? input.body : "",
    timeoutMs: typeof input.timeoutMs === "number" ? input.timeoutMs : 15000,
    responseMappingText: responseMapping ? JSON.stringify(responseMapping, null, 2) : "[]",
  };
}

function toMethod(input: unknown): HttpRequestMethod {
  if (input === "GET" || input === "POST" || input === "PUT" || input === "PATCH" || input === "DELETE") {
    return input;
  }
  return "GET";
}
