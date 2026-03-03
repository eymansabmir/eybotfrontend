import type { NodeDefinition } from "../types";
import { LocationNodeConfig } from "./config";
import type { LocationNodeData } from "./schema";
import { LocationNodeSchema } from "./schema";
import { LocationNodeRenderer } from "./renderer";
import { LocationNodeHandler } from "./handler";

export const locationNode: NodeDefinition<LocationNodeData> = {
    config: LocationNodeConfig,
    schema: LocationNodeSchema,
    renderer: LocationNodeRenderer,
    handler: LocationNodeHandler,
    defaultData: { latitude: 0, longitude: 0, name: '', address: '' },
    defaultBranches: [{ key: 'default', label: 'Default' }],
};

export * from "./schema";
export * from "./config";
