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
console.log(JSON.stringify(input))
        const { data } = await apiClient.post("/flows", input);
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
};
