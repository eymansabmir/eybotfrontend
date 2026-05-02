import { apiClient } from "@/lib/api-client";
import type { Bot, CreateBotInput, UpdateBotInput } from "../schemas/bot.schema";

export const botsApi = {
    getBots: async (): Promise<Bot[]> => {
        const { data } = await apiClient.get("/flows/?orgId=68b08633907a113536238290");
        return data;
    },

    getBotById: async (id:string): Promise<Bot> => {
        const { data } = await apiClient.get(`/flows/${id}`);
        return data;
    },

    createBot: async (input: CreateBotInput): Promise<Bot> => {
        const payload = { ...input, orgId: "68b08633907a113536238290" };
        const { data } = await apiClient.post("/flows", payload);
        return data;
    },

    updateBot: async (id: string, input: UpdateBotInput): Promise<Bot> => {
        const { data } = await apiClient.put(`/flows/${id}`, input);
        return data;
    },

    publishBot: async (id: string): Promise<Bot> => {
        const { data } = await apiClient.post(`/flows/${id}/publish`);
        return data;
    },

    archiveBot: async (id: string): Promise<Bot> => {
        const { data } = await apiClient.post(`/flows/${id}/archive`);
        return data;
    },

    deleteBot: async (id: string): Promise<void> => {
        await apiClient.delete(`/flows/${id}`);
    },

    getFlowTranslation: async (id: string, language: string): Promise<any> => {
        const { data } = await apiClient.get(`/flows/${id}/translations/${language}`);
        return data;
    },

    updateFlowTranslation: async (id: string, language: string, translatedData: any): Promise<void> => {
        await apiClient.put(`/flows/${id}/translations/${language}`, { translatedData });
    },
    
    importBot: async (input: any): Promise<Bot> => {
        const { data } = await apiClient.post("/flows/import?orgId=68b08633907a113536238290", input);
        return data;
    },
};
