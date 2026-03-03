import { StopCircle } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const EndNodeConfig: NodeConfig = {
    type: NodeType.END,
    label: "End",
    category: "flow_control",
    icon: React.createElement(StopCircle, { size: 16 }),
    description: "The end point of your bot flow.",
};
