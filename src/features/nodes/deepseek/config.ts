import React from "react";
import { DeepSeekLogo } from "./logo";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const DeepSeekNodeConfig: NodeConfig = {
  type: NodeType.DEEPSEEK,
  label: "DeepSeek",
  category: "integration",
  icon: React.createElement(DeepSeekLogo, { className: "size-4 text-black dark:text-white" }),
  description: "Generate responses using DeepSeek models.",
};
