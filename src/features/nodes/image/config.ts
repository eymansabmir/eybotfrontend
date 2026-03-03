import { Image } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const ImageNodeConfig: NodeConfig = {
    type: NodeType.SEND_IMAGE,
    label: "Image",
    category: "messaging",
    icon: React.createElement(Image, { size: 16 }),
    description: "Send an image with an optional caption.",
};
