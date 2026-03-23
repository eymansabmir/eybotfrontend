import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deepSeekCredentialsApi } from "../api/deepseek-credentials.api";
import { deepSeekModelsApi } from "../api/deepseek-models.api";
import { deepSeekPreviewApi } from "../api/deepseek-preview.api";
import { deepSeekTestApi } from "../api/deepseek-test.api";
import type { CreateDeepSeekCredentialInput, DeepSeekModelActionMode, DeepSeekPreviewInput } from "../domain/deepseek.types";

const deepSeekKeys = {
  all: ["integrations", "deepseek"] as const,
  credentials: (orgId: string) => [...deepSeekKeys.all, "credentials", orgId] as const,
  models: (orgId: string, credentialId: string, actionMode?: DeepSeekModelActionMode) =>
    [...deepSeekKeys.all, "models", orgId, credentialId, actionMode ?? "all"] as const,
};

export function useDeepSeekCredentials(orgId: string) {
  return useQuery({
    queryKey: deepSeekKeys.credentials(orgId),
    queryFn: () => deepSeekCredentialsApi.list(orgId),
  });
}

export function useDeepSeekModels(orgId: string, credentialId?: string, actionMode?: DeepSeekModelActionMode) {
  return useQuery({
    queryKey: deepSeekKeys.models(orgId, credentialId ?? "", actionMode),
    queryFn: () => deepSeekModelsApi.list(orgId, credentialId!, actionMode),
    enabled: Boolean(credentialId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403 || maybeStatus === 404) return false;
      return failureCount < 1;
    },
  });
}

export function useCreateDeepSeekCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateDeepSeekCredentialInput, "orgId">) =>
      deepSeekCredentialsApi.create({ ...input, orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deepSeekKeys.credentials(orgId) });
    },
  });
}

export function useRevokeDeepSeekCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => deepSeekCredentialsApi.revoke(orgId, credentialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deepSeekKeys.credentials(orgId) });
    },
  });
}

export function useTestDeepSeekCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => deepSeekTestApi.testConnection(orgId, credentialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deepSeekKeys.credentials(orgId) });
    },
  });
}

export function useTestDeepSeekPrompt() {
  return useDeepSeekPreview();
}

export function useDeepSeekPreview() {
  return useMutation({
    mutationFn: (input: DeepSeekPreviewInput) => deepSeekPreviewApi.run(input),
  });
}
