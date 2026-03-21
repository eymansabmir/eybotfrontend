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
  defaultData: {},
  defaultBranches: [{ key: "default", label: "Default" }],
};

export * from "./schema";
export * from "./config";
