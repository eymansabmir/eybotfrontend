import { nocodbConfig } from "./config";
import { nocodbHandler } from "./handler";
import { NocoDBNodeRenderer } from "./renderer";
import { NocoDBNodeDataSchema } from "./schema";
import type { NocoDBNodeData } from "./schema";

export const nocodbNode = {
  config: nocodbConfig,
  handler: nocodbHandler,
  renderer: NocoDBNodeRenderer,
  schema: NocoDBNodeDataSchema,
  defaultData: {
    action: 'create_record',
    responseMapping: [],
  },
  defaultBranches: [],
};

export type { NocoDBNodeData };
