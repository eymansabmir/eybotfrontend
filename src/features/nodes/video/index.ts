import type { NodeDefinition } from "../types";
import { VideoNodeConfig } from "./config";
import type { VideoNodeData } from "./schema";
import { VideoNodeSchema } from "./schema";
import { VideoNodeRenderer } from "./renderer";
import { VideoNodeHandler } from "./handler";

export const videoNode: NodeDefinition<VideoNodeData> = {
    config: VideoNodeConfig,
    schema: VideoNodeSchema,
    renderer: VideoNodeRenderer,
    handler: VideoNodeHandler,
    defaultData: { url: '', caption: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
