export type TemplateCategory = "marketing" | "product" | "customer_service" | "other";

export interface ChatbotTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: TemplateCategory;
  fileName: string;
}

export const CHATBOT_TEMPLATES: ChatbotTemplate[] = [
  {
    id: "lead-generation",
    name: "Lead Generation",
    description: "Capture prospect details and qualify them automatically.",
    emoji: "🤝",
    category: "marketing",
    fileName: "lead-gen.json",
  },
  {
    id: "customer-support",
    name: "Customer Support",
    description: "Help your users with common questions and issues.",
    emoji: "💁‍♂️",
    category: "customer_service",
    fileName: "customer-support.json",
  },
  {
    id: "nps-survey",
    name: "NPS Survey",
    description: "Measure customer satisfaction with a Net Promoter Score survey.",
    emoji: "⭐",
    category: "product",
    fileName: "nps.json",
  },
  {
    id: "faq-bot",
    name: "FAQ Bot",
    description: "Provide instant answers to frequently asked questions.",
    emoji: "💬",
    category: "customer_service",
    fileName: "faq.json",
  },
];
