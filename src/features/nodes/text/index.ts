import type { NodeDefinition } from "../types";
import { TextNodeConfig } from "./config";
import type { TextNodeData } from "./schema";
import  { TextNodeSchema } from "./schema";
import { TextNodeRenderer } from "./renderer";
import { TextNodeHandler } from "./handler";

export const textNode: NodeDefinition<TextNodeData> = {
    config: TextNodeConfig,
    schema: TextNodeSchema,
    renderer: TextNodeRenderer,
    handler: TextNodeHandler,
    defaultData: { message: '', variables: [] },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
