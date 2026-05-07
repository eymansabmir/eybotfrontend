import type { NodeDefinition } from "../types";
import { AudioNodeConfig } from "./config";
import type { AudioNodeData } from "./schema";
import { AudioNodeSchema } from "./schema";
import { AudioNodeRenderer } from "./renderer";
import { AudioNodeHandler } from "./handler";
import { isValidUrlOrVariable } from "../utils";

export const audioNode: NodeDefinition<AudioNodeData> = {
    config: AudioNodeConfig,
    schema: AudioNodeSchema,
    renderer: AudioNodeRenderer,
    handler: AudioNodeHandler,
    defaultData: { url: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
    validate: (data) => {
        if (!isValidUrlOrVariable(data.url)) {
            return ["Audio URL or variable is required"];
        }
        return null;
    },
};

export * from "./schema";
export * from "./config";
