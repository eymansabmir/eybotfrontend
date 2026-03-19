import { Sticker } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const StickerNodeConfig: NodeConfig = {
    type: NodeType.SEND_STICKER,
    label: "Sticker",
    category: "messaging",
    icon: React.createElement(Sticker, { size: 16 }),
    description: "Send a sticker.",
};
