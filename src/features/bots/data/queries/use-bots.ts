import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { botsApi } from "../api/bots-api";
import type { CreateBotInput, UpdateBotInput } from "../schemas/bot.schema";

export const botKeys = {
    all: ["bots"] as const,
    lists: () => [...botKeys.all, "list"] as const,
    details: () => [...botKeys.all, "detail"] as const,
    detail: (id: string) => [...botKeys.details(), id] as const,
};

export function useBots() {
    return useQuery({
        queryKey: botKeys.lists(),
        queryFn: botsApi.getBots,
    });
}

export function useBot(id: string) {
    return useQuery({
        queryKey: botKeys.detail(id),
        queryFn: () => botsApi.getBotById(id),
        enabled: !!id && id !== "new",
    });
}

export function useCreateBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateBotInput) => botsApi.createBot(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: botKeys.lists() });
        },
    });
}

export function useUpdateBot(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateBotInput) => botsApi.updateBot(id, input),
        onSuccess: (data) => {
            queryClient.setQueryData(botKeys.detail(id), data);
            queryClient.invalidateQueries({ queryKey: botKeys.lists() });
        },
    });
}

export function usePublishBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => botsApi.publishBot(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: botKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: botKeys.lists() });
        },
    });
}

export function useArchiveBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => botsApi.archiveBot(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: botKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: botKeys.lists() });
        },
    });
}

export function useDeleteBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => botsApi.deleteBot(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: botKeys.lists() });
        },
    });
}

export function useFlowTranslation(id: string, language: string) {
    return useQuery({
        queryKey: [...botKeys.detail(id), "translation", language],
        queryFn: () => botsApi.getFlowTranslation(id, language),
        enabled: !!id && !!language && language !== "default",
    });
}

export function useUpdateFlowTranslation(id: string, language: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (translatedData: any) => botsApi.updateFlowTranslation(id, language, translatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [...botKeys.detail(id), "translation", language] });
        },
    });
}

export function useImportBot() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: any) => botsApi.importBot(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: botKeys.lists() });
        },
    });
}

export function useFlowRevisions(id: string) {
    return useQuery({
        queryKey: [...botKeys.detail(id), "revisions"] as const,
        queryFn: () => botsApi.getFlowRevisions(id),
        enabled: !!id && id !== "new",
    });
}

export function useRollbackFlow(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (revisionId: string) => botsApi.rollbackFlow(id, revisionId),
        onSuccess: (data) => {
            queryClient.setQueryData(botKeys.detail(id), data);
            queryClient.invalidateQueries({ queryKey: [...botKeys.detail(id), "revisions"] });
            queryClient.invalidateQueries({ queryKey: botKeys.lists() });
        },
    });
}
