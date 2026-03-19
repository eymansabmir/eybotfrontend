import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpRequestCredentialsApi } from "../api/http-request-credentials.api";
import type { CreateHttpRequestCredentialInput } from "../domain/http-request.types";

const httpRequestKeys = {
  all: ["integrations", "http-request"] as const,
  credentials: (orgId: string) => [...httpRequestKeys.all, "credentials", orgId] as const,
};

export function useHttpRequestCredentials(orgId?: string) {
  return useQuery({
    queryKey: orgId ? httpRequestKeys.credentials(orgId) : [...httpRequestKeys.all, "credentials", "disabled"],
    queryFn: () => httpRequestCredentialsApi.list(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });
}

export function useCreateHttpRequestCredential(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateHttpRequestCredentialInput, "orgId">) =>
      httpRequestCredentialsApi.create({ ...input, orgId: orgId as string }),
    onSuccess: () => {
      if (orgId) {
        void queryClient.invalidateQueries({ queryKey: httpRequestKeys.credentials(orgId) });
      }
    },
  });
}
