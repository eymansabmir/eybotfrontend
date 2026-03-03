import type { NodeDefinition } from "../types";
import { DocumentNodeConfig } from "./config";
import type { DocumentNodeData } from "./schema";
import { DocumentNodeSchema } from "./schema";
import { DocumentNodeRenderer } from "./renderer";
import { DocumentNodeHandler } from "./handler";

export const documentNode: NodeDefinition<DocumentNodeData> = {
    config: DocumentNodeConfig,
    schema: DocumentNodeSchema,
    renderer: DocumentNodeRenderer,
    handler: DocumentNodeHandler,
    defaultData: { url: '', caption: '', filename: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
