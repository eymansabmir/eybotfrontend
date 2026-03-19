import { FileUp } from "lucide-react";
import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const FileNodeConfig: NodeConfig = {
    type: NodeType.ASK_FILE,
    label: "File",
    category: "messaging",
    icon: React.createElement(FileUp, { size: 16 }),
    description: "Ask the user to upload a file and save its URL to a variable.",
};
