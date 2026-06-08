import { PmvbryNodeConfig } from "./config";
import { PmvbryNodeHandler } from "./handler";
import { PmvbryNodeRenderer } from "./renderer";
import { PmvbryNodeSchema, type PmvbryNodeData } from "./schema";
import type { NodeDefinition } from "../types";

export const pmvbryNode: NodeDefinition<PmvbryNodeData> = {
  config: PmvbryNodeConfig,
  schema: PmvbryNodeSchema,
  renderer: PmvbryNodeRenderer,
  handler: PmvbryNodeHandler,
  defaultData: {
    mobileNumber: "{{contact.wa_id}}",
    statusVariableName: "PMVStatus",
    timeoutMs: 30000,
    responseMapping: [],
  },
  defaultBranches: [{ key: "default", label: "Default" }],
  validate: (data) => {
    const errors: string[] = [];
    if (!data.mobileNumber) {
        errors.push("Mobile number is required");
    }
    return errors.length > 0 ? errors : null;
  },
};

export * from "./config";
export * from "./schema";
