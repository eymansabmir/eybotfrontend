import { ExternalLink } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const RedirectNodeConfig: NodeConfig = {
    type: NodeType.REDIRECT,
    label: "Redirect",
    category: "logic",
    icon: React.createElement(ExternalLink, { size: 16 }),
    description: "Redirect the user to a given URL.",
};
