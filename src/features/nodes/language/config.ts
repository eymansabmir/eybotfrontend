import { Languages } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const LanguageNodeConfig: NodeConfig = {
    type: NodeType.LANGUAGE,
    label: "Language",
    category: "integration", // Or "logic", but "integration" seems okay for i18n
    icon: React.createElement(Languages, { size: 16 }),
    description: "Ask user for their preferred language.",
};
