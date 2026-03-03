import type { NodeDefinition } from "../types";
import { ListNodeConfig } from "./config";
import type { ListNodeData } from "./schema";
import { ListNodeSchema } from "./schema";
import { ListNodeRenderer } from "./renderer";
import { ListNodeHandler } from "./handler";

export const listNode: NodeDefinition<ListNodeData> = {
    config: ListNodeConfig,
    schema: ListNodeSchema,
    renderer: ListNodeRenderer,
    handler: ListNodeHandler,
    defaultData: {
        body: '',
        buttonTitle: 'View options',
        sections: [
            {
                title: 'Options',
                rows: [
                    { id: 'row_1', title: 'Option 1' },
                ],
            },
        ],
        footer: '',
        interaction: {
            mode: 'input',
            input: {
                type: 'choice',
                timeoutSeconds: 3600,
            },
        },
    },
    defaultBranches: [
        { key: 'row_1', label: 'Option 1' },
        { key: 'default', label: 'Default' },
    ],
};

export * from "./schema";
export * from "./config";
