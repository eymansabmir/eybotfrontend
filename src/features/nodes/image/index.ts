import type { NodeDefinition } from "../types";
import { ImageNodeConfig } from "./config";
import type { ImageNodeData } from "./schema";
import { ImageNodeSchema } from "./schema";
import { ImageNodeRenderer } from "./renderer";
import { ImageNodeHandler } from "./handler";

import { isValidUrlOrVariable } from "../utils";

export const imageNode: NodeDefinition<ImageNodeData> = {
    config: ImageNodeConfig,
    schema: ImageNodeSchema,
    renderer: ImageNodeRenderer,
    handler: ImageNodeHandler,
    defaultData: { url: '', caption: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
    validate: (data) => {
        if (!isValidUrlOrVariable(data.url)) {
            return ["Image URL or variable is required"];
        }
        return null;
    },
};

export * from "./schema";
export * from "./config";
