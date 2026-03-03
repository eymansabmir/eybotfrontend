import type { NodeDefinition } from "../types";
import { ImageNodeConfig } from "./config";
import type { ImageNodeData } from "./schema";
import { ImageNodeSchema } from "./schema";
import { ImageNodeRenderer } from "./renderer";
import { ImageNodeHandler } from "./handler";

export const imageNode: NodeDefinition<ImageNodeData> = {
    config: ImageNodeConfig,
    schema: ImageNodeSchema,
    renderer: ImageNodeRenderer,
    handler: ImageNodeHandler,
    defaultData: { url: '', caption: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
