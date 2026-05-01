import { apiClient } from "@/lib/api-client";
import type { ChatbotTemplate } from "../templates-data";

export const templatesApi = {
  getTemplates: async (): Promise<ChatbotTemplate[]> => {
    const { data } = await apiClient.get("/templates");
    return data;
  },

  getTemplateById: async (id: string): Promise<any> => {
    const { data } = await apiClient.get(`/templates/${id}`);
    return data;
  },
};
