import type { NodeDefinition } from "../types";
import { VariableManagerNodeConfig } from "./config";
import type { VariableManagerNodeData } from "./schema";
import { VariableManagerNodeSchema } from "./schema";
import { VariableManagerNodeRenderer } from "./renderer";
import { VariableManagerNodeHandler } from "./handler";

export const variableManagerNode: NodeDefinition<VariableManagerNodeData> = {
    config: VariableManagerNodeConfig,
    schema: VariableManagerNodeSchema,
    renderer: VariableManagerNodeRenderer,
    handler: VariableManagerNodeHandler as any,
    defaultData: {},
    defaultBranches: [],
};

export * from "./schema";
export * from "./config";
