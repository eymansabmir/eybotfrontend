import { List } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const ListNodeConfig: NodeConfig = {
    type: NodeType.SEND_LIST,
    label: "List",
    category: "messaging",
    icon: React.createElement(List, { size: 16 }),
    description: "Send an interactive list message with sections and rows.",
};
