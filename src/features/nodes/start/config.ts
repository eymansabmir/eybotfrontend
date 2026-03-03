import { PlayCircle } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const StartNodeConfig: NodeConfig = {
    type: NodeType.START,
    label: "Start",
    category: "flow_control",
    icon: React.createElement(PlayCircle, { size: 16 }),
    description: "The entry point of your bot flow.",
};
