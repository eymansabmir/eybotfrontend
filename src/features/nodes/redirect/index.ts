import type { NodeDefinition } from "../types";
import { RedirectNodeConfig } from "./config";
import type { RedirectNodeData } from "./schema";
import { RedirectNodeSchema } from "./schema";
import { RedirectNodeRenderer } from "./renderer";
import { RedirectNodeHandler } from "./handler";

export const redirectNode: NodeDefinition<RedirectNodeData> = {
    config: RedirectNodeConfig,
    schema: RedirectNodeSchema,
    renderer: RedirectNodeRenderer,
    handler: RedirectNodeHandler,
    defaultData: { url: '', isNewTab: false },
    defaultBranches: [{ key: 'default', label: 'Default' }],
    validate: (data) => {
        if (!data.url || !data.url.trim()) {
            return ["URL is required"];
        }
        return null;
    },
};

export * from "./schema";
export * from "./config";
