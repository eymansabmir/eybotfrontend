import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { anthropicCredentialsApi } from "../api/anthropic-credentials.api";
import { anthropicModelsApi } from "../api/anthropic-models.api";
import { anthropicPreviewApi } from "../api/anthropic-preview.api";
import { anthropicTestApi } from "../api/anthropic-test.api";
import type { CreateAnthropicCredentialInput, AnthropicModelActionMode, AnthropicPreviewInput } from "../domain/anthropic.types";

const anthropicKeys = {
  all: ["integrations", "anthropic"] as const,
  credentials: (orgId: string) => [...anthropicKeys.all, "credentials", orgId] as const,
  models: (orgId: string, credentialId: string, actionMode?: AnthropicModelActionMode) =>
    [...anthropicKeys.all, "models", orgId, credentialId, actionMode ?? "all"] as const,
};

export function useAnthropicCredentials(orgId: string) {
  return useQuery({
    queryKey: anthropicKeys.credentials(orgId),
    queryFn: () => anthropicCredentialsApi.list(orgId),
  });
}

export function useAnthropicModels(orgId: string, credentialId?: string, actionMode?: AnthropicModelActionMode) {
  return useQuery({
    queryKey: anthropicKeys.models(orgId, credentialId ?? "", actionMode),
    queryFn: () => anthropicModelsApi.list(orgId, credentialId!, actionMode),
    enabled: Boolean(credentialId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403 || maybeStatus === 404) return false;
      return failureCount < 1;
    },
  });
}

export function useCreateAnthropicCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateAnthropicCredentialInput, "orgId">) =>
      anthropicCredentialsApi.create({ ...input, orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anthropicKeys.credentials(orgId) });
    },
  });
}

export function useRevokeAnthropicCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => anthropicCredentialsApi.revoke(orgId, credentialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anthropicKeys.credentials(orgId) });
    },
  });
}

export function useTestAnthropicCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => anthropicTestApi.testConnection(orgId, credentialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: anthropicKeys.credentials(orgId) });
    },
  });
}

export function useTestAnthropicPrompt() {
  return useAnthropicPreview();
}

export function useAnthropicPreview() {
  return useMutation({
    mutationFn: (input: AnthropicPreviewInput) => anthropicPreviewApi.run(input),
  });
}
