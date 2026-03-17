import { Layout } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const CarouselNodeConfig: NodeConfig = {
    type: NodeType.SEND_CAROUSEL,
    label: "Carousel",
    category: "messaging",
    icon: React.createElement(Layout, { size: 16 }),
    description: "Send an interactive carousel with up to 10 cards.",
};
