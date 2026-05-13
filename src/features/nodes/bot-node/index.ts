import { botNodeConfig } from "./config";
import { BotNodeRenderer } from "./renderer";
import { BotNodeSchema } from "./schema";
import type { NodeDefinition } from "../types";

export const botNode: NodeDefinition = {
  config: botNodeConfig,
  renderer: BotNodeRenderer,
  schema: BotNodeSchema,
  handler: async () => {},
  defaultData: {
    type: "bot_node",
    targetFlowId: "",
  },
  defaultBranches: [],
};
