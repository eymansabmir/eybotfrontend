import type { NodeDefinition } from "../types";
import { StickerNodeConfig } from "./config";
import type { StickerNodeData } from "./schema";
import { StickerNodeSchema } from "./schema";
import { StickerNodeRenderer } from "./renderer";
import { StickerNodeHandler } from "./handler";

export const stickerNode: NodeDefinition<StickerNodeData> = {
    config: StickerNodeConfig,
    schema: StickerNodeSchema,
    renderer: StickerNodeRenderer,
    handler: StickerNodeHandler,
    defaultData: { url: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
