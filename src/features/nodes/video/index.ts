import type { NodeDefinition } from "../types";
import { VideoNodeConfig } from "./config";
import type { VideoNodeData } from "./schema";
import { VideoNodeSchema } from "./schema";
import { VideoNodeRenderer } from "./renderer";
import { VideoNodeHandler } from "./handler";
import { isValidUrlOrVariable } from "../utils";

export const videoNode: NodeDefinition<VideoNodeData> = {
    config: VideoNodeConfig,
    schema: VideoNodeSchema,
    renderer: VideoNodeRenderer,
    handler: VideoNodeHandler,
    defaultData: { url: '', caption: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
    validate: (data) => {
        if (!isValidUrlOrVariable(data.url)) {
            return ["Video URL or variable is required"];
        }
        return null;
    },
};

export * from "./schema";
export * from "./config";
