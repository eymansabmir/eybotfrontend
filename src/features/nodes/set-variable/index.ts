import type { NodeDefinition } from "../types";
import { SetVariableNodeConfig } from "./config";
import type { SetVariableNodeData } from "./schema";
import { SetVariableNodeSchema } from "./schema";
import { SetVariableNodeRenderer } from "./renderer";
import { SetVariableNodeHandler } from "./handler";

export const setVariableNode: NodeDefinition<SetVariableNodeData> = {
    config: SetVariableNodeConfig,
    schema: SetVariableNodeSchema,
    renderer: SetVariableNodeRenderer,
    handler: SetVariableNodeHandler,
    defaultData: {
        assignments: [
            { variable: "", value: "", scope: "session" },
        ],
    },
    defaultBranches: [
        { key: "default", label: "Default" },
    ],
};

export * from "./schema";
export * from "./config";
