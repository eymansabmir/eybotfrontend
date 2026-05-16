import { jumpNodeConfig } from "./config";
import { JumpNodeDataSchema } from "./schema";
import { JumpNodeRenderer } from "./renderer";
import type { NodeDefinition } from "../types";

export const jumpNode: NodeDefinition = {
    config: jumpNodeConfig,
    schema: JumpNodeDataSchema,
    renderer: JumpNodeRenderer,
    handler: async (data) => data,
    defaultData: {
        targetNodeId: "",
    },
    defaultBranches: [{ key: "default", label: "Default" }],
};
