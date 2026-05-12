import { Code } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const ScriptNodeConfig: NodeConfig = {
    type: NodeType.SCRIPT,
    label: "Script",
    category: "logic",
    icon: React.createElement(Code, { size: 16 }),
    description: "Execute custom JavaScript or TypeScript code.",
};
