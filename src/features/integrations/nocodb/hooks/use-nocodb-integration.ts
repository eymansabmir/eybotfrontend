import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nocoDBApi } from '../api/nocodb.api';
import { nocoDBCredentialsApi } from '../api/nocodb-credentials.api';

export function useNocoDBCredentials(orgId: string) {
  return useQuery({
    queryKey: ['nocodb-credentials', orgId],
    queryFn: () => nocoDBCredentialsApi.list(orgId),
    enabled: !!orgId,
  });
}

export function useCreateNocoDBCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; baseUrl: string; apiKey: string }) =>
      nocoDBCredentialsApi.create(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nocodb-credentials', orgId] });
    },
  });
}

export function useTestNocoDBConnection() {
  return useMutation({
    mutationFn: ({ credentialId, orgId }: { credentialId: string; orgId: string }) =>
      nocoDBApi.testConnection(credentialId, orgId),
  });
}
