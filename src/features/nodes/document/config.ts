import { FileText } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const DocumentNodeConfig: NodeConfig = {
    type: NodeType.SEND_DOCUMENT,
    label: "Document",
    category: "messaging",
    icon: React.createElement(FileText, { size: 16 }),
    description: "Send a document (PDF, DOCX, etc.) with an optional caption.",
};
