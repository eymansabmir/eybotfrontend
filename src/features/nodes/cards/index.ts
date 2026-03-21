import { CardsNodeConfig } from "./config";
import { CardsNodeRenderer } from "./renderer";
import { CardsNodeSchema, type CardsNodeData } from "./schema";
import { CardsNodeHandler } from "./handler";
import type { NodeDefinition } from "../types";

export const cardsNode: NodeDefinition<CardsNodeData> = {
    config: CardsNodeConfig,
    renderer: CardsNodeRenderer,
    schema: CardsNodeSchema,
    handler: CardsNodeHandler,
    defaultData: {
        items: [
            {
                id: "card_1",
                title: "Welcome!",
                description: "Select an option below",
                buttons: [
                    { id: "btn_1", text: "Option A", branchKey: "a" }
                ]
            }
        ],
        interaction: { 
            mode: "input",
            input: {
                variableName: "choice",
                variableScope: "session",
                timeoutSeconds: 300,
                defaultBranchKey: "default"
            }
        }
    },
    defaultBranches: [
        { key: "a", label: "Option A" },
        { key: "timeout", label: "Timeout" }
    ]
};
