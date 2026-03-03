import type { NodeDefinition } from "../types";
import { ButtonsNodeConfig } from "./config";
import type { ButtonsNodeData } from "./schema";
import { ButtonsNodeSchema } from "./schema";
import { ButtonsNodeRenderer } from "./renderer";
import { ButtonsNodeHandler } from "./handler";

const defaultButtonId = 'btn_default';

export const buttonsNode: NodeDefinition<ButtonsNodeData> = {
    config: ButtonsNodeConfig,
    schema: ButtonsNodeSchema,
    renderer: ButtonsNodeRenderer,
    handler: ButtonsNodeHandler,
    defaultData: {
        body: '',
        buttons: [{ id: defaultButtonId, title: 'Button 1' }],
        interaction: {
            mode: 'input',
            input: {
                type: 'choice',
                timeoutSeconds: 3600,
                options: [{ id: defaultButtonId, label: 'Button 1', branchKey: defaultButtonId }],
            },
        },
    },
    defaultBranches: [
        { key: defaultButtonId, label: 'Button 1' },
        { key: 'timeout', label: 'Timeout' },
    ],
};

export * from "./schema";
export * from "./config";
