export type TemplateCategory = 'marketing' | 'customer_service' | 'product' | 'feedback' | 'other' | 'all';

export interface ChatbotTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: TemplateCategory;
  features: string[];
  fullDescription?: string;
  keyBenefits?: string[];
  setupSteps?: string[];
}

export const CHATBOT_TEMPLATES: ChatbotTemplate[] = [
  {
    id: "lead-gen",
    name: "Lead Generation",
    description: "Capture visitor details and qualify leads automatically using conversational forms.",
    emoji: "🎯",
    category: "marketing",
    features: ["Contact Capture", "Qualification Logic", "CRM Sync Ready"],
    fullDescription: "Our Lead Generation template is designed for high conversion. It greets users, collects essential contact information (name, email, phone), and asks qualification questions to ensure your sales team focus on high-intent prospects.",
    keyBenefits: [
      "24/7 Lead Capture without human intervention",
      "Automated qualification reducing manual filtering",
      "Instant data validation for email and phone formats",
      "Seamless integration with marketing automation tools"
    ],
    setupSteps: [
      "Customize the welcome message in the first Text node",
      "Set up your CRM variables in the Variable Manager",
      "Configure the final thank you message",
      "Deploy to your website or WhatsApp channel"
    ]
  },
  {
    id: "support-routing",
    name: "Support Routing",
    description: "Route customers to the right department or agent based on their specific needs.",
    emoji: "🛠️",
    category: "customer_service",
    features: ["Department Routing", "FAQ Integration", "Priority Handling"],
    fullDescription: "Streamline your support desk with automated routing. This template uses interactive buttons to categorize customer issues and direct them to specialized agents or provide immediate answers to common questions.",
    keyBenefits: [
      "Reduced wait times for customers",
      "Higher First Contact Resolution (FCR) rates",
      "Automatic ticket categorization for support teams",
      "Built-in fallback for complex issues"
    ],
    setupSteps: [
      "Define your support departments in the Buttons node",
      "Add frequently asked questions to the List node",
      "Connect your helpdesk API in the Webhook node (optional)",
      "Set up out-of-office automated replies"
    ]
  },
  {
    id: "customer-feedback",
    name: "Customer Feedback",
    description: "Gather qualitative and quantitative insights from your customers post-interaction.",
    emoji: "⭐",
    category: "feedback",
    features: ["CSAT Score", "Text Feedback", "Automated Follow-up"],
    fullDescription: "Understand your customers' sentiment with this professional feedback flow. It combines structured rating questions with open-ended text fields to give you a complete picture of the customer experience.",
    keyBenefits: [
      "Real-time monitoring of customer satisfaction",
      "Identify pain points through qualitative comments",
      "Automated alerting for negative feedback",
      "Higher response rates compared to email surveys"
    ],
    setupSteps: [
      "Adjust the CSAT rating scale if needed",
      "Customize the open-ended feedback prompt",
      "Set up a logic branch to alert agents on low scores",
      "Export results to your preferred BI tool"
    ]
  }
];
