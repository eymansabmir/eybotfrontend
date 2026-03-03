import type { NodeDefinition } from "../types";
import { RandomSplitNodeConfig } from "./config";
import type { RandomSplitNodeData } from "./schema";
import { RandomSplitNodeSchema } from "./schema";
import { RandomSplitNodeRenderer } from "./renderer";
import { RandomSplitNodeHandler } from "./handler";

export const randomSplitNode: NodeDefinition<RandomSplitNodeData> = {
    config: RandomSplitNodeConfig,
    schema: RandomSplitNodeSchema,
    renderer: RandomSplitNodeRenderer,
    handler: RandomSplitNodeHandler,
    defaultData: {
        branches: [
            { key: "branch_a", label: "Branch A", percentage: 50 },
            { key: "branch_b", label: "Branch B", percentage: 50 },
        ],
    },
    defaultBranches: [
        { key: "branch_a", label: "Branch A" },
        { key: "branch_b", label: "Branch B" },
    ],
};

export * from "./schema";
export * from "./config";
