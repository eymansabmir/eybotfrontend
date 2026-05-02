import { apiClient } from "@/lib/api-client";
import { CHATBOT_TEMPLATES, type ChatbotTemplate } from "../templates-data";

export const templatesApi = {
  getTemplates: async (): Promise<ChatbotTemplate[]> => {
    // Return static mock data since backend /templates doesn't exist yet
    return Promise.resolve(CHATBOT_TEMPLATES);
  },

  getTemplateById: async (id: string): Promise<any> => {
    // Return a mock basic nodes structure for now to allow bot creation
    return Promise.resolve({
      nodes: [
        { id: "1", type: "text", position: { x: 100, y: 100 }, data: { text: `Hello from ${id} template!` } }
      ],
      edges: []
    });
  },
};
