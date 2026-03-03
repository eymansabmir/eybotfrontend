import { MessageSquare } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const TextNodeConfig: NodeConfig = {
    type: NodeType.SEND_TEXT,
    label: "Text",
    category: "messaging",
    icon: React.createElement(MessageSquare, { size: 16 }),
    description: "Send a simple text message to the user.",
};
