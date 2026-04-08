import type { NodeDefinition } from "../types";
import { LanguageNodeConfig } from "./config";
import type { LanguageNodeData } from "./schema";
import { LanguageNodeSchema } from "./schema";
import { LanguageNodeRenderer } from "./renderer";
import { LanguageNodeHandler } from "./handler";

export const languageNode: NodeDefinition<LanguageNodeData> = {
    config: LanguageNodeConfig,
    schema: LanguageNodeSchema,
    renderer: LanguageNodeRenderer,
    handler: LanguageNodeHandler,
    defaultData: {
        message: 'Please select your language',
        variableName: 'selected_language',
        variableScope: 'session',
        timeoutSeconds: 3600,
        localizationEnabled: false,
        languages: [],
        defaultLanguage: undefined,
    },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
export * from "./renderer";
