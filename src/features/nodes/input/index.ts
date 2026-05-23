import type { NodeDefinition } from "../types";
import { InputNodeConfig } from "./config";
import type { InputNodeData } from "./schema";
import { InputNodeSchema } from "./schema";
import { InputNodeRenderer } from "./renderer";
import { InputNodeHandler } from "./handler";

export const inputNode: NodeDefinition<InputNodeData> = {
    config: InputNodeConfig,
    schema: InputNodeSchema,
    renderer: InputNodeRenderer,
    handler: InputNodeHandler,
    defaultData: { message: '', variableName: 'var_name', variableScope: 'session', validationType: 'text', timeoutSeconds: 3600 },
    defaultBranches: [{ key: 'default', label: 'Default' }, { key: 'timeout', label: 'Timeout' }],
};

export * from "./schema";
export * from "./config";
