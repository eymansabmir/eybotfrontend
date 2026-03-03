import { ListChecks } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const ButtonsNodeConfig: NodeConfig = {
    type: NodeType.SEND_BUTTONS,
    label: "Buttons",
    category: "messaging",
    icon: React.createElement(ListChecks, { size: 16 }),
    description: "Send a message with up to 3 interactive buttons.",
};
