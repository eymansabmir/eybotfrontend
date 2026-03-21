import { BarChart3 } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const NpsNodeConfig: NodeConfig = {
    type: NodeType.NPS,
    label: "NPS Survey",
    category: "messaging",
    icon: React.createElement(BarChart3, { size: 16 }),
    description: "Collect Net Promoter Score (0-10) using a WhatsApp List.",
};
