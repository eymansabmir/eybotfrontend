import type { NodeDefinition } from "../types";
import { ConditionNodeConfig } from "./config";
import type { ConditionNodeData } from "./schema";
import { ConditionNodeSchema } from "./schema";
import { ConditionNodeRenderer } from "./renderer";
import { ConditionNodeHandler } from "./handler";

export const conditionNode: NodeDefinition<ConditionNodeData> = {
    config: ConditionNodeConfig,
    schema: ConditionNodeSchema,
    renderer: ConditionNodeRenderer,
    handler: ConditionNodeHandler,
    defaultData: {
        expression: {
            operator: "AND",
            rules: [
                { variable: "", comparator: "eq", value: "" },
            ],
        },
    },
    defaultBranches: [
        { key: "yes", label: "Yes" },
        { key: "no", label: "No" },
    ],
};

export * from "./schema";
export * from "./config";
