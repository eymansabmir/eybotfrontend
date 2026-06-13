import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignApi } from "./campaign-api";
import type { CreateCampaignInput } from "../types";
import { toast } from "sonner";

const CAMPAIGN_KEYS = {
    all: ["campaigns"] as const,
    detail: (id: string) => ["campaigns", id] as const,
    stats: (id: string) => ["campaigns", id, "stats"] as const,
};

export function useCampaigns() {
    return useQuery({
        queryKey: CAMPAIGN_KEYS.all,
        queryFn: campaignApi.list,
    });
}

export function useCustomFilters() {
    return useQuery({
        queryKey: ["custom-filters"],
        queryFn: campaignApi.getCustomFilters,
        staleTime: Infinity,
    });
}

export function useCampaign(id: string) {
    return useQuery({
        queryKey: CAMPAIGN_KEYS.detail(id),
        queryFn: () => campaignApi.getById(id),
        enabled: !!id,
    });
}

export function useCampaignPolling(id: string, enabled: boolean) {
    return useQuery({
        queryKey: CAMPAIGN_KEYS.detail(id),
        queryFn: () => campaignApi.getById(id),
        enabled,
        refetchInterval: enabled ? 15_000 : false,
    });
}

export function useCampaignAnalytics(id: string | undefined) {
    return useQuery({
        queryKey: CAMPAIGN_KEYS.stats(id || ""),
        queryFn: () => campaignApi.getAnalytics(id!),
        enabled: !!id,
        refetchInterval: 15_000,
    });
}

export function useCampaignBatches(campaignId: string) {
    return useQuery({
        queryKey: ["campaign-batches", campaignId],
        queryFn: async () => {
            const data = await campaignApi.getBatchHistory(campaignId);
            return data.map(b => ({ ...b, launchedAt: new Date(b.launchedAt) }));
        },
        enabled: !!campaignId,
        refetchInterval: 5000, 
    });
}

export function useCreateCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateCampaignInput) => campaignApi.create(input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.all });
            toast.success("Campaign created successfully");
        },
        onError: () => {
            toast.error("Failed to create campaign");
        },
    });
}

export function useUpdateCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: Partial<CreateCampaignInput> }) => campaignApi.update(id, input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.all });
            toast.success("Campaign updated successfully");
        },
        onError: () => {
            toast.error("Failed to update campaign");
        },
    });
}

export function useStartCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => campaignApi.start(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.all });
            toast.success("Campaign started");
        },
        onError: () => {
            toast.error("Failed to start campaign");
        },
    });
}

export function useCancelCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => campaignApi.cancel(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.all });
            toast.success("Campaign cancelled");
        },
        onError: () => {
            toast.error("Failed to cancel campaign");
        },
    });
}

export function useDeleteCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => campaignApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.all });
            toast.success("Campaign deleted");
        },
        onError: () => {
            toast.error("Failed to delete campaign");
        },
    });
}

