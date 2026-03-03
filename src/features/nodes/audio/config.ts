import { Music } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const AudioNodeConfig: NodeConfig = {
    type: NodeType.SEND_AUDIO,
    label: "Audio",
    category: "messaging",
    icon: React.createElement(Music, { size: 16 }),
    description: "Send an audio file.",
};
