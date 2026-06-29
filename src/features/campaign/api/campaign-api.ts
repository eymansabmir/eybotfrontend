import { apiClient } from "@/lib/api-client";
import type {
    Campaign,
    CreateCampaignInput,
    CampaignAnalytics,
    CampaignAuditLogFilter,
    CampaignAuditLogResponse,
    CampaignBatch,
    BatchAnalyticsResponse,
    CampaignAnalyticsDateFilter,
    CampaignRecipientsPage,
    CustomCampaignFilter,
    RecipientConversation,
    CampaignRenudge,
} from "../types";
const BASE = "/campaigns";

export const campaignApi = {
    list: async (): Promise<Campaign[]> => {
        const { data } = await apiClient.get<Campaign[]>(BASE);
        return data;
    },

    getCustomFilters: async (): Promise<CustomCampaignFilter[]> => {
        const { data } = await apiClient.get<CustomCampaignFilter[]>(`${BASE}/custom-filters`);
        return data;
    },

    getById: async (id: string): Promise<Campaign> => {
        const { data } = await apiClient.get<Campaign>(`${BASE}/${id}`);
        return data;
    },

    create: async (input: CreateCampaignInput): Promise<Campaign> => {
        const { data } = await apiClient.post<{ campaign: Campaign }>(BASE, input);
        return data.campaign;
    },

    update: async (id: string, input: Partial<CreateCampaignInput>): Promise<Campaign> => {
        const { data } = await apiClient.patch<Campaign>(`${BASE}/${id}`, input);
        return data;
    },

    start: async (id: string): Promise<void> => {
        await apiClient.post(`${BASE}/${id}/start`);
    },

    cancel: async (id: string): Promise<void> => {
        await apiClient.post(`${BASE}/${id}/cancel`);
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE}/${id}`);
    },

    getAnalytics: async (id: string, filter: CampaignAnalyticsDateFilter = {}): Promise<CampaignAnalytics> => {
        const params = new URLSearchParams();
        if (filter.startDate) params.append("startDate", filter.startDate);
        if (filter.endDate) params.append("endDate", filter.endDate);
        const qs = params.toString();
        const { data } = await apiClient.get<CampaignAnalytics>(`${BASE}/${id}/stats${qs ? `?${qs}` : ""}`);
        return data;
    },

    getBatchAnalytics: async (campaignId: string, versionId: string): Promise<BatchAnalyticsResponse> => {
        const { data } = await apiClient.get<BatchAnalyticsResponse>(`${BASE}/${campaignId}/batches/${versionId}/stats`);
        return data;
    },

    getBatchHistory: async (id: string): Promise<CampaignBatch[]> => {
        const { data } = await apiClient.get<CampaignBatch[]>(`${BASE}/${id}/batches`);
        return data;
    },

    getAuditLogs: async (id: string, filter: CampaignAuditLogFilter = {}): Promise<CampaignAuditLogResponse> => {
        const params = new URLSearchParams();
        Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params.append(key, value.toString());
            }
        });
        const qs = params.toString();
        const { data } = await apiClient.get<CampaignAuditLogResponse>(`${BASE}/${id}/audit-logs${qs ? `?${qs}` : ""}`);
        return data;
    },

    getRenudges: async (id: string): Promise<CampaignRenudge[]> => {
        const { data } = await apiClient.get<CampaignRenudge[]>(`${BASE}/${id}/renudges`);
        return data.map((b) => ({
            ...b,
            scheduledAt: b.scheduledAt ? new Date(b.scheduledAt).toISOString() : null,
            createdAt: new Date(b.createdAt).toISOString(),
            runs: (b.runs ?? []).map((r) => ({
                ...r,
                launchedAt: new Date(r.launchedAt).toISOString(),
            })),
            ...(b.primaryRun
                ? {
                      primaryRun: {
                          ...b.primaryRun,
                          launchedAt: new Date(b.primaryRun.launchedAt).toISOString(),
                      },
                  }
                : {}),
        }));
    },
    listRecipients: async (
        id: string,
        params: {
            cursor?: string;
            status?: string;
            limit?: number;
            versionId?: string;
            startDate?: string;
            endDate?: string;
        } = {},
    ): Promise<CampaignRecipientsPage> => {
        const { data } = await apiClient.get<CampaignRecipientsPage>(`${BASE}/${id}/recipients`, { params });
        return data;
    },

    getRecipientConversation: async (id: string, recipientId: string): Promise<RecipientConversation> => {
        const { data } = await apiClient.get<RecipientConversation>(
            `${BASE}/${id}/recipients/${recipientId}/conversation`,
        );
        return data;
    },

} as const;
