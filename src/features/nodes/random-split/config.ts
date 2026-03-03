import { Shuffle } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const RandomSplitNodeConfig: NodeConfig = {
    type: NodeType.RANDOM_SPLIT,
    label: "Random Split",
    category: "logic",
    icon: React.createElement(Shuffle, { size: 16 }),
    description: "Split the flow randomly by percentage weights.",
};
