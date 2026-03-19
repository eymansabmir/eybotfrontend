import type { NodeDefinition } from "../types";
import { OpenAINodeConfig } from "./config";
import { OpenAINodeSchema, type OpenAINodeData } from "./schema";
import { OpenAINodeRenderer } from "./renderer";
import { OpenAINodeHandler } from "./handler";

export const openAINode: NodeDefinition<OpenAINodeData> = {
  config: OpenAINodeConfig,
  schema: OpenAINodeSchema,
  renderer: OpenAINodeRenderer,
  handler: OpenAINodeHandler,
  defaultData: {
    mode: "chat_completion",
    voiceAction: "create_speech",
    credentialId: "",
    model: "",
    voice: "alloy",
    prompt: "",
    systemPrompt: "",
    resultVariable: "openai_response",
    resultScope: "session",
    sendResponseToUser: true,
    fallbackText: "",
  },
  defaultBranches: [{ key: "default", label: "Default" }],
};

export * from "./schema";
export * from "./config";
