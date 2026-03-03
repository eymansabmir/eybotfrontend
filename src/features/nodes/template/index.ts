import type { NodeDefinition } from "../types";
import { TemplateNodeConfig } from "./config";
import type { TemplateNodeData } from "./schema";
import { TemplateNodeSchema } from "./schema";
import { TemplateNodeRenderer } from "./renderer";
import { TemplateNodeHandler } from "./handler";

export const templateNode: NodeDefinition<TemplateNodeData> = {
    config: TemplateNodeConfig,
    schema: TemplateNodeSchema,
    renderer: TemplateNodeRenderer,
    handler: TemplateNodeHandler,
    defaultData: { templateName: '', languageCode: 'en_US' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
