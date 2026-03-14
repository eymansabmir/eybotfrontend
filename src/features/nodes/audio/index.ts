import type { NodeDefinition } from "../types";
import { AudioNodeConfig } from "./config";
import type { AudioNodeData } from "./schema";
import { AudioNodeSchema } from "./schema";
import { AudioNodeRenderer } from "./renderer";
import { AudioNodeHandler } from "./handler";

export const audioNode: NodeDefinition<AudioNodeData> = {
    config: AudioNodeConfig,
    schema: AudioNodeSchema,
    renderer: AudioNodeRenderer,
    handler: AudioNodeHandler,
    defaultData: { filePath: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
