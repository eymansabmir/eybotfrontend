import type { NodeDefinition } from "../types";
import { FileNodeConfig } from "./config";
import type { FileNodeData } from "./schema";
import { FileNodeSchema } from "./schema";
import { FileNodeRenderer } from "./renderer";
import { FileNodeHandler } from "./handler";

export const fileNode: NodeDefinition<FileNodeData> = {
    config: FileNodeConfig,
    schema: FileNodeSchema,
    renderer: FileNodeRenderer,
    handler: FileNodeHandler,
    defaultData: { message: '', variableName: 'file_url', variableScope: 'session', timeoutSeconds: 3600 },
    defaultBranches: [{ key: 'default', label: 'Default' }, { key: 'timeout', label: 'Timeout' }],
};

export * from "./schema";
export * from "./config";
