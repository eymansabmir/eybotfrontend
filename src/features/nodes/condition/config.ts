import { GitBranch } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const ConditionNodeConfig: NodeConfig = {
    type: NodeType.CONDITION,
    label: "Condition",
    category: "logic",
    icon: React.createElement(GitBranch, { size: 16 }),
    description: "Branch the flow based on a condition (if/else).",
};
