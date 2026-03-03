import { Video } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const VideoNodeConfig: NodeConfig = {
    type: NodeType.SEND_VIDEO,
    label: "Video",
    category: "messaging",
    icon: React.createElement(Video, { size: 16 }),
    description: "Send a video with an optional caption.",
};
