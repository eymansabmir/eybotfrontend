import type { NodeDefinition } from "../types";
import { EndNodeConfig } from "./config";
import type { EndNodeData } from "./schema";
import { EndNodeSchema } from "./schema";
import { EndNodeRenderer } from "./renderer";
import { EndNodeHandler } from "./handler";

export const endNode: NodeDefinition<EndNodeData> = {
    config: EndNodeConfig,
    schema: EndNodeSchema,
    renderer: EndNodeRenderer,
    handler: EndNodeHandler,
    defaultData: {},
    defaultBranches: [],
};

export * from "./schema";
export * from "./config";
