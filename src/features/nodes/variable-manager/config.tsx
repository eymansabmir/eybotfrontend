import React from "react";
import { Variable } from "lucide-react";
import { NodeType } from "../node-types.constants";

export const VariableManagerNodeConfig = {
    type: NodeType.VARIABLE_MANAGER,
    label: "Variable Manager",
    category: "logic" as const,
    description: "Manage global variables",
    icon: React.createElement(Variable, { size: 14 }),
};
