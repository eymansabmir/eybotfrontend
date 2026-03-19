import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { openAIVoiceApi } from "../api/openai-voice.api";
import type {
  OpenAICreateSpeechInput,
  OpenAICreateTranscriptionInput,
  OpenAIVoiceActionMode,
  OpenAIVoiceFormState,
} from "../domain/openai.types";

export function useOpenAIVoiceFormState(initial?: Partial<OpenAIVoiceFormState>) {
  const [state, setState] = useState<OpenAIVoiceFormState>({
    actionMode: initial?.actionMode ?? "create_speech",
    credentialId: initial?.credentialId ?? "",
    model: initial?.model ?? "",
    voice: initial?.voice ?? "alloy",
    textInput: initial?.textInput ?? "",
    format: initial?.format ?? "mp3",
    speed: initial?.speed ?? 1,
    audioFile: initial?.audioFile,
    audioUrl: initial?.audioUrl ?? "",
    language: initial?.language ?? "",
    prompt: initial?.prompt ?? "",
    saveUrlInVariableId: initial?.saveUrlInVariableId ?? "",
    transcriptionVariableId: initial?.transcriptionVariableId ?? "",
  });

  return {
    state,
    setState,
    update: (patch: Partial<OpenAIVoiceFormState>) => setState((prev) => ({ ...prev, ...patch })),
  };
}

export function useOpenAIVoiceMutations(orgId: string, credentialId?: string, actionMode?: OpenAIVoiceActionMode) {
  const modelsQuery = useQuery({
    queryKey: ["integrations", "openai", "voice-models", orgId, credentialId, actionMode],
    queryFn: () =>
      openAIVoiceApi.listModels({
        orgId,
        credentialId: credentialId!,
        actionMode,
      }),
    enabled: Boolean(credentialId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403) return false;
      return failureCount < 1;
    },
  });

  const createSpeech = useMutation({
    mutationFn: (input: Omit<OpenAICreateSpeechInput, "orgId">) => openAIVoiceApi.createSpeech({ ...input, orgId }),
  });

  const createTranscription = useMutation({
    mutationFn: (input: Omit<OpenAICreateTranscriptionInput, "orgId">) =>
      openAIVoiceApi.createTranscription({ ...input, orgId }),
  });

  const isBusy = useMemo(
    () => modelsQuery.isLoading || createSpeech.isPending || createTranscription.isPending,
    [modelsQuery.isLoading, createSpeech.isPending, createTranscription.isPending],
  );

  return {
    modelsQuery,
    createSpeech,
    createTranscription,
    isBusy,
  };
}
