import { Keyboard } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const InputNodeConfig: NodeConfig = {
    type: NodeType.ASK_QUESTION,
    label: "Input",
    category: "messaging",
    icon: React.createElement(Keyboard, { size: 16 }),
    description: "Ask a question and save the user's response to a variable.",
};
