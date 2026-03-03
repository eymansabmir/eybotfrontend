import { Variable } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const SetVariableNodeConfig: NodeConfig = {
    type: NodeType.SET_VARIABLE,
    label: "Set Variable",
    category: "logic",
    icon: React.createElement(Variable, { size: 16 }),
    description: "Assign values to session or contact variables.",
};
