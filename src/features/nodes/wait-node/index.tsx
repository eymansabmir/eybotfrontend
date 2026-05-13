import { Timer } from "lucide-react";
import { NodeType } from "../node-types.constants";
import type { NodeDefinition } from "../types";
import { waitNodeDataSchema, type WaitNodeData } from "./schema";
import { WaitNodeRenderer } from "./renderer";

export const waitNode: NodeDefinition<WaitNodeData> = {
  config: {
    type: NodeType.WAIT,
    label: "Wait",
    icon: <Timer size={16} />,
    category: "logic",
    description: "Pause flow for a duration",
  },
  schema: waitNodeDataSchema,
  renderer: WaitNodeRenderer,
  handler: async () => {},
  defaultData: {
    duration: 1,
    unit: "minutes",
  },
  defaultBranches: [{ key: "default", label: "Continue" }],
};
