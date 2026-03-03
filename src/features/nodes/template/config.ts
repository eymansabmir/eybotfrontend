import { LayoutTemplate } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const TemplateNodeConfig: NodeConfig = {
    type: NodeType.SEND_TEMPLATE,
    label: "Template",
    category: "messaging",
    icon: React.createElement(LayoutTemplate, { size: 16 }),
    description: "Send a pre-approved WhatsApp template message.",
};
