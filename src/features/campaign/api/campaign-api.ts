import { apiClient } from "@/lib/api-client";
import type { Campaign, CreateCampaignInput, CampaignAnalytics } from "../types";

const BASE = "/campaigns";

export const campaignApi = {
    list: async (): Promise<Campaign[]> => {
        const { data } = await apiClient.get<Campaign[]>(BASE);
        return data;
    },

    getCustomFilters: async (): Promise<{ id: string; name: string; key: string; value: string }[]> => {
        const { data } = await apiClient.get<{ id: string; name: string; key: string; value: string }[]>(`${BASE}/custom-filters`);
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

    getAnalytics: async (id: string): Promise<CampaignAnalytics> => {
        const { data } = await apiClient.get<CampaignAnalytics>(`${BASE}/${id}/stats`);
        return data;
    },

    getBatchHistory: async (id: string): Promise<any[]> => {
        const { data } = await apiClient.get<any[]>(`${BASE}/${id}/batches`);
        return data;
    },

} as const;
