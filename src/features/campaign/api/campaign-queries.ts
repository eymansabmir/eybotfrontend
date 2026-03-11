import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignApi } from "./campaign-api";
import type { CreateCampaignInput } from "../types";
import { toast } from "sonner";

const CAMPAIGN_KEYS = {
    all: ["campaigns"] as const,
    detail: (id: string) => ["campaigns", id] as const,
};

export function useCampaigns() {
    return useQuery({
        queryKey: CAMPAIGN_KEYS.all,
        queryFn: campaignApi.list,
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
export function useCampaignAnalytics(id: string) {
    return useQuery({
        queryKey: ["campaigns", id, "analytics"],
        queryFn: () => campaignApi.getAnalytics(id),
        enabled: !!id,
    });
}

export function useAnalyticsPolling(id: string, isPolling: boolean) {
    return useQuery({
        queryKey: ["campaigns", id, "analytics"],
        queryFn: () => campaignApi.getAnalytics(id),
        enabled: !!id,
        refetchInterval: isPolling ? 15_000 : false,
    });
}
