import type { NodeDefinition } from "../types";
import { StartNodeConfig } from "./config";
import type { StartNodeData } from "./schema";
import { StartNodeSchema } from "./schema";
import { StartNodeRenderer } from "./renderer";
import { StartNodeHandler } from "./handler";

export const startNode: NodeDefinition<StartNodeData> = {
    config: StartNodeConfig,
    schema: StartNodeSchema,
    renderer: StartNodeRenderer,
    handler: StartNodeHandler,
    defaultData: {},
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
