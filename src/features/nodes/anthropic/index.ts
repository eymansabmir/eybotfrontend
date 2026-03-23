import type { NodeDefinition } from "../types";
import { AnthropicNodeConfig } from "./config";
import { AnthropicNodeSchema, type AnthropicNodeData } from "./schema";
import { AnthropicNodeRenderer } from "./renderer";
import { AnthropicNodeHandler } from "./handler";

export const anthropicNode: NodeDefinition<AnthropicNodeData> = {
  config: AnthropicNodeConfig,
  schema: AnthropicNodeSchema,
  renderer: AnthropicNodeRenderer,
  handler: AnthropicNodeHandler,
  defaultData: {},
  defaultBranches: [{ key: "default", label: "Default" }],
};

export * from "./schema";
export * from "./config";
