import { returnNodeConfig } from "./config";
import { ReturnNodeDataSchema } from "./schema";
import { ReturnNodeRenderer } from "./renderer";
import type { NodeDefinition } from "../types";

export const returnNode: NodeDefinition = {
    config: returnNodeConfig,
    schema: ReturnNodeDataSchema,
    renderer: ReturnNodeRenderer,
    handler: async (data) => data,
    defaultData: {},
    defaultBranches: [],
};
