import type { NodeDefinition } from "../types";
import { LocationRequestNodeConfig } from "./config";
import type { LocationRequestNodeData } from "./schema";
import { LocationRequestNodeSchema } from "./schema";
import { LocationRequestNodeRenderer } from "./renderer";
import { LocationRequestNodeHandler } from "./handler";

export const locationRequestNode: NodeDefinition<LocationRequestNodeData> = {
    config: LocationRequestNodeConfig,
    schema: LocationRequestNodeSchema,
    renderer: LocationRequestNodeRenderer,
    handler: LocationRequestNodeHandler,
    defaultData: { message: 'Please share your location', variablePrefix: 'location' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
