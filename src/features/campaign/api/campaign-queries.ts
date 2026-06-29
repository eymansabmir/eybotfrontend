import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { campaignApi } from "./campaign-api";
import type { CreateCampaignInput, CampaignAuditLogFilter, CampaignAnalyticsDateFilter, CampaignEngagementAnalyticsFilter } from "../types";
import { toast } from "sonner";

const CAMPAIGN_KEYS = {
    all: ["campaigns"] as const,
    detail: (id: string) => ["campaigns", id] as const,
    stats: (id: string) => ["campaigns", id, "stats"] as const,
    auditLogs: (id: string, filter: CampaignAuditLogFilter) => ["campaigns", id, "audit-logs", filter] as const,
};

export function useCampaigns() {
    return useQuery({
        queryKey: CAMPAIGN_KEYS.all,
        queryFn: campaignApi.list,
    });
}

export function useCustomFilters(enabled = true) {
    return useQuery({
        queryKey: ["custom-filters"],
        queryFn: campaignApi.getCustomFilters,
        staleTime: Infinity,
        enabled,
        retry: 1,
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
        refetchInterval: (query) => {
            if (!enabled) return false;
            const campaign = query.state.data;
            if (campaign?.dataSourceId === "CUSTOM_API" && campaign.status === "running") {
                return 5_000;
            }
            return 15_000;
        },
    });
}

export function useCampaignAnalytics(id: string | undefined, filter: CampaignAnalyticsDateFilter = {}) {
    return useQuery({
        queryKey: [...CAMPAIGN_KEYS.stats(id || ""), filter],
        queryFn: () => campaignApi.getAnalytics(id!, filter),
        enabled: !!id,
        refetchInterval: 15_000,
    });
}

export function useCampaignEngagementAnalytics(
    campaignId: string | undefined,
    filter: CampaignEngagementAnalyticsFilter = {},
) {
    return useQuery({
        queryKey: ["campaign-engagement-analytics", campaignId, filter],
        queryFn: () => campaignApi.getEngagementAnalytics(campaignId!, filter),
        enabled: !!campaignId,
        refetchInterval: 30_000,
    });
}

export function useBatchAnalytics(campaignId: string | undefined, versionId: string | undefined) {
    return useQuery({
        queryKey: ["campaign-batch-analytics", campaignId, versionId],
        queryFn: () => campaignApi.getBatchAnalytics(campaignId!, versionId!),
        enabled: !!campaignId && !!versionId,
        refetchInterval: 15_000,
    });
}

export function useCampaignAuditLogs(id: string | undefined, filter: CampaignAuditLogFilter) {
    return useQuery({
        queryKey: CAMPAIGN_KEYS.auditLogs(id || "", filter),
        queryFn: () => campaignApi.getAuditLogs(id!, filter),
        enabled: !!id,
        placeholderData: (previousData) => previousData,
        refetchInterval: 15_000,
    });
}

export function useCampaignBatches(campaignId: string) {
    return useQuery({
        queryKey: ["campaign-batches", campaignId],
        queryFn: async () => {
            const data = await campaignApi.getBatchHistory(campaignId);
            return data.map((b) => ({
                ...b,
                launchedAt: new Date(b.launchedAt),
                startedAt: b.startedAt ? new Date(b.startedAt) : new Date(b.launchedAt),
                endedAt: b.endedAt ? new Date(b.endedAt) : null,
            }));
        },
        enabled: !!campaignId,
        refetchInterval: 5000, 
    });
}

export function useCampaignRenudges(campaignId: string) {
    return useQuery({
        queryKey: ["campaign-renudges", campaignId],
        queryFn: () => campaignApi.getRenudges(campaignId),
        enabled: !!campaignId,
        refetchInterval: 15_000,
    });
}

export function useCampaignRecipients(
    campaignId: string,
    params: {
        cursor?: string;
        status?: string;
        limit?: number;
        versionId?: string;
        startDate?: string;
        endDate?: string;
    } = {},
) {
    return useQuery({
        queryKey: ["campaign-recipients", campaignId, params],
        queryFn: () => campaignApi.listRecipients(campaignId, params),
        enabled: !!campaignId,
        placeholderData: keepPreviousData,
    });
}

export function useRecipientConversation(campaignId: string, recipientId: string | null) {
    return useQuery({
        queryKey: ["recipient-conversation", campaignId, recipientId],
        queryFn: () => campaignApi.getRecipientConversation(campaignId, recipientId as string),
        enabled: !!campaignId && !!recipientId,
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

