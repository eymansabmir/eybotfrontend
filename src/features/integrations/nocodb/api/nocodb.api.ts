import { apiClient } from "@/lib/api-client";

export interface TestNocoDBConnectionResponse {
  ok: boolean;
  latencyMs: number;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
}

export const nocoDBApi = {
  testConnection: async (credentialId: string, orgId: string): Promise<TestNocoDBConnectionResponse> => {
    const { data } = await apiClient.post(`/integrations/nocodb/credentials/${credentialId}/test`, { orgId });
    return data;
  },
};
