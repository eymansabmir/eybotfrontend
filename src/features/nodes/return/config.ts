import { NodeType } from "../node-types.constants";
import type { NodeConfig } from "../types";
import { CornerDownLeft } from "lucide-react";
import React from "react";

export const returnNodeConfig: NodeConfig = {
    type: NodeType.RETURN,
    label: "Return",
    category: "logic",
    icon: React.createElement(CornerDownLeft, { size: 16 }),
    description: "Return to the previous jump location",
};
