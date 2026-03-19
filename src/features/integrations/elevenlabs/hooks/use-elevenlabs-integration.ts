import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createElevenLabsCredential,
  listElevenLabsCredentials,
  listElevenLabsModels,
  listElevenLabsVoices,
  testElevenLabsCredential,
} from "../api/elevenlabs.api";
import type { CreateElevenLabsCredentialInput } from "../domain/elevenlabs.types";

const QUERY_KEYS = {
  all: ["integrations", "elevenlabs"] as const,
  credentials: (orgId: string) => [...QUERY_KEYS.all, "credentials", orgId] as const,
  models: (orgId: string, credentialId: string) => [...QUERY_KEYS.all, "models", orgId, credentialId] as const,
  voices: (orgId: string, credentialId: string) => [...QUERY_KEYS.all, "voices", orgId, credentialId] as const,
};

export function useElevenLabsCredentials(orgId?: string) {
  return useQuery({
    queryKey: orgId ? QUERY_KEYS.credentials(orgId) : [...QUERY_KEYS.all, "credentials", "disabled"],
    queryFn: () => listElevenLabsCredentials(orgId as string),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });
}

export function useCreateElevenLabsCredential(orgId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateElevenLabsCredentialInput, "orgId">) =>
      createElevenLabsCredential({ ...(input as CreateElevenLabsCredentialInput), orgId: orgId as string }),
    onSuccess: () => {
      if (orgId) {
        void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.credentials(orgId) });
      }
    },
  });
}

export function useTestElevenLabsCredential() {
  return useMutation({
    mutationFn: ({ orgId, credentialId }: { orgId: string; credentialId: string }) =>
      testElevenLabsCredential(orgId, credentialId),
  });
}

export function useElevenLabsModels(orgId?: string, credentialId?: string) {
  return useQuery({
    queryKey:
      orgId && credentialId
        ? QUERY_KEYS.models(orgId, credentialId)
        : [...QUERY_KEYS.all, "models", "disabled"],
    queryFn: () => listElevenLabsModels(orgId as string, credentialId as string),
    enabled: Boolean(orgId && credentialId),
    staleTime: 60_000,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403 || status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useElevenLabsVoices(orgId?: string, credentialId?: string) {
  return useQuery({
    queryKey:
      orgId && credentialId
        ? QUERY_KEYS.voices(orgId, credentialId)
        : [...QUERY_KEYS.all, "voices", "disabled"],
    queryFn: () => listElevenLabsVoices(orgId as string, credentialId as string),
    enabled: Boolean(orgId && credentialId),
    staleTime: 60_000,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403 || status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
