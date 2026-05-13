import { NodeType } from "../node-types.constants";
import type { NodeConfig } from "../types";
import { GitBranch } from "lucide-react";
import React from "react";

export const jumpNodeConfig: NodeConfig = {
    type: NodeType.JUMP,
    label: "Jump",
    category: "logic",
    icon: React.createElement(GitBranch, { size: 16 }),
    description: "Jump to a specific node in the flow",
};
