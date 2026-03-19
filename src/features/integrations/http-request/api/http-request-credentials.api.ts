import { apiClient } from "@/lib/api-client";
import { HttpRequestCredentialSchema, HttpRequestCredentialsListSchema } from "../domain/http-request.schemas";
import type { CreateHttpRequestCredentialInput, HttpRequestCredential } from "../domain/http-request.types";

export const httpRequestCredentialsApi = {
  async list(orgId: string): Promise<HttpRequestCredential[]> {
    const { data } = await apiClient.get("/integrations/credentials", {
      params: {
        orgId,
        type: "HTTP_REQUEST",
        includeInactive: true,
        includeRevoked: true,
      },
    });

    return HttpRequestCredentialsListSchema.parse(data);
  },

  async create(input: CreateHttpRequestCredentialInput): Promise<HttpRequestCredential> {
    const secret: Record<string, unknown> = {
      ...(input.baseUrl ? { baseUrl: input.baseUrl } : {}),
      ...(input.bearerToken ? { bearerToken: input.bearerToken } : {}),
      ...(input.headers ? { headers: input.headers } : {}),
      ...(input.queryParams ? { queryParams: input.queryParams } : {}),
      ...(input.proxyUrl ? { proxyUrl: input.proxyUrl } : {}),
    };

    const metadata: Record<string, unknown> = {
      ...(input.baseUrl ? { baseUrl: input.baseUrl } : {}),
      ...(input.proxyUrl ? { kind: "proxy" } : { kind: "request" }),
    };

    const { data } = await apiClient.post("/integrations/credentials", {
      orgId: input.orgId,
      name: input.name,
      type: "HTTP_REQUEST",
      secret,
      metadata,
      isActive: true,
    });

    return HttpRequestCredentialSchema.parse(data);
  },
};
