import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { openAICredentialsApi } from "../api/openai-credentials.api";
import { openAIModelsApi } from "../api/openai-models.api";
import { openAIVoiceApi } from "../api/openai-voice.api";
import { openAIPreviewApi } from "../api/openai-preview.api";
import { openAITestApi } from "../api/openai-test.api";
import { openAIAssistantsApi } from "../api/openai-assistants.api";
import type { CreateOpenAICredentialInput, OpenAIModelActionMode, OpenAIPreviewInput, OpenAIVoiceActionMode } from "../domain/openai.types";

const openAIKeys = {
  all: ["integrations", "openai"] as const,
  credentials: (orgId: string) => [...openAIKeys.all, "credentials", orgId] as const,
  models: (orgId: string, credentialId: string, actionMode?: OpenAIModelActionMode) =>
    [...openAIKeys.all, "models", orgId, credentialId, actionMode ?? "all"] as const,
  voiceModels: (orgId: string, credentialId: string, actionMode?: OpenAIVoiceActionMode) =>
    [...openAIKeys.all, "voice-models", orgId, credentialId, actionMode ?? "all"] as const,
  assistants: (orgId: string, credentialId: string) =>
    [...openAIKeys.all, "assistants", orgId, credentialId] as const,
};

export function useOpenAIAssistants(orgId: string, credentialId?: string) {
  return useQuery({
    queryKey: openAIKeys.assistants(orgId, credentialId ?? ""),
    queryFn: () => openAIAssistantsApi.list(orgId, credentialId!),
    enabled: Boolean(credentialId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403 || maybeStatus === 404) return false;
      return failureCount < 1;
    },
  });
}

export function useOpenAICredentials(orgId: string) {
  return useQuery({
    queryKey: openAIKeys.credentials(orgId),
    queryFn: () => openAICredentialsApi.list(orgId),
  });
}

export function useOpenAIModels(orgId: string, credentialId?: string, actionMode?: OpenAIModelActionMode) {
  return useQuery({
    queryKey: openAIKeys.models(orgId, credentialId ?? "", actionMode),
    queryFn: () => openAIModelsApi.list(orgId, credentialId!, actionMode),
    enabled: Boolean(credentialId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403 || maybeStatus === 404) return false;
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

export function useOpenAIVoiceModels(orgId: string, credentialId?: string, actionMode?: OpenAIVoiceActionMode) {
  return useQuery({
    queryKey: openAIKeys.voiceModels(orgId, credentialId ?? "", actionMode),
    queryFn: () => openAIVoiceApi.listModels({ orgId, credentialId: credentialId!, actionMode }),
    enabled: Boolean(credentialId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403 || maybeStatus === 404) return false;
      return failureCount < 1;
    },
  });
}

export function useTestOpenAIPrompt() {
  return useOpenAIPreview();
}

export function useOpenAIPreview() {
  return useMutation({
    mutationFn: (input: OpenAIPreviewInput) => openAIPreviewApi.run(input),
  });
}

