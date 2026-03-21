import type { NodeDefinition } from "../types";
import { DeepSeekNodeConfig } from "./config";
import { DeepSeekNodeSchema, type DeepSeekNodeData } from "./schema";
import { DeepSeekNodeRenderer } from "./renderer";
import { DeepSeekNodeHandler } from "./handler";

export const deepseekNode: NodeDefinition<DeepSeekNodeData> = {
  config: DeepSeekNodeConfig,
  schema: DeepSeekNodeSchema,
  renderer: DeepSeekNodeRenderer,
  handler: DeepSeekNodeHandler,
  defaultData: {},
  defaultBranches: [{ key: "default", label: "Default" }],
};

export * from "./schema";
export * from "./config";
