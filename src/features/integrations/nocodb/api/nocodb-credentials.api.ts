import { apiClient } from "@/lib/api-client";
import { type NocoDBCredential, NocoDBCredentialSchema } from '../domain/nocodb.types';

export const nocoDBCredentialsApi = {
  create: async (orgId: string, data: { name: string; baseUrl: string; apiKey: string }): Promise<NocoDBCredential> => {
    const res = await apiClient.post(`/integrations/credentials`, {
      orgId,
      name: data.name,
      type: 'NOCODB',
      secret: {
        apiKey: data.apiKey,
        baseUrl: data.baseUrl,
      },
      metadata: {
        baseUrl: data.baseUrl,
      },
      isActive: true,
    });
    return NocoDBCredentialSchema.parse({
      ...res.data,
      isTested: !!res.data.lastTestedAt,
    });
  },
  list: async (orgId: string): Promise<NocoDBCredential[]> => {
    const res = await apiClient.get(`/integrations/credentials`, { params: { orgId, type: 'NOCODB' } });
    return res.data.map((item: any) => NocoDBCredentialSchema.parse({
      ...item,
      isTested: !!item.lastTestedAt,
    }));
  },
};
