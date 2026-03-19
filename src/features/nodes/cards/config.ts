import { Layout } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const CardsNodeConfig: NodeConfig = {
    type: NodeType.SEND_CARDS,
    label: "Cards",
    category: "messaging",
    icon: React.createElement(Layout, { size: 16 }),
    description: "Send a sequence of cards (image + text + buttons).",
};
