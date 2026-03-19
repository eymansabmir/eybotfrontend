import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { openAICredentialsApi } from "../api/openai-credentials.api";
import { openAIModelsApi } from "../api/openai-models.api";
import { openAIPreviewApi } from "../api/openai-preview.api";
import { openAITestApi } from "../api/openai-test.api";
import type { CreateOpenAICredentialInput, OpenAIPreviewInput } from "../domain/openai.types";

const openAIKeys = {
  all: ["integrations", "openai"] as const,
  credentials: (orgId: string) => [...openAIKeys.all, "credentials", orgId] as const,
  models: (orgId: string, credentialId: string) => [...openAIKeys.all, "models", orgId, credentialId] as const,
};

export function useOpenAICredentials(orgId: string) {
  return useQuery({
    queryKey: openAIKeys.credentials(orgId),
    queryFn: () => openAICredentialsApi.list(orgId),
  });
}

export function useOpenAIModels(orgId: string, credentialId?: string) {
  return useQuery({
    queryKey: openAIKeys.models(orgId, credentialId ?? ""),
    queryFn: () => openAIModelsApi.list(orgId, credentialId!),
    enabled: Boolean(credentialId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403) return false;
      return failureCount < 1;
    },
  });
}

export function useCreateOpenAICredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateOpenAICredentialInput, "orgId">) =>
      openAICredentialsApi.create({ ...input, orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openAIKeys.credentials(orgId) });
    },
  });
}

export function useRevokeOpenAICredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => openAICredentialsApi.revoke(orgId, credentialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openAIKeys.credentials(orgId) });
    },
  });
}

export function useTestOpenAICredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => openAITestApi.testConnection(orgId, credentialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: openAIKeys.credentials(orgId) });
    },
  });
}

export function useOpenAIPreview() {
  return useMutation({
    mutationFn: (input: OpenAIPreviewInput) => openAIPreviewApi.run(input),
  });
}
