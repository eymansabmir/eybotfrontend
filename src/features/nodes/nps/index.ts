import type { NpsNodeData } from "./schema";
import type { NodeDefinition } from "../types";
import { NpsNodeConfig } from "./config";
import { NpsNodeRenderer } from "./renderer";
import { NpsNodeSchema } from "./schema";
import { NpsNodeHandler } from "./handler";

export const npsNode: NodeDefinition<NpsNodeData> = {
    config: NpsNodeConfig,
    renderer: NpsNodeRenderer,
    schema: NpsNodeSchema,
    handler: NpsNodeHandler,
    defaultData: {
        message: "How likely are you to recommend us?",
        variable: "nps_score",
        variableScope: "session",
        length: 10,
        startsAt: 1,
        timeoutSeconds: 3600,
    },
    defaultBranches: [{ key: "default", label: "Default" }],
};
