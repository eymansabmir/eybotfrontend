import type { NodeDefinition } from "../types";
import { ScriptNodeConfig } from "./config";
import type { ScriptNodeData } from "./schema";
import { ScriptNodeSchema } from "./schema";
import { ScriptNodeRenderer } from "./renderer";
import { ScriptNodeHandler } from "./handler";

export const scriptNode: NodeDefinition<ScriptNodeData> = {
    config: ScriptNodeConfig,
    schema: ScriptNodeSchema,
    renderer: ScriptNodeRenderer,
    handler: ScriptNodeHandler,
    defaultData: { name: '', content: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
