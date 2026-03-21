import React from "react";
import { AnthropicLogo } from "./logo";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const AnthropicNodeConfig: NodeConfig = {
  type: NodeType.ANTHROPIC,
  label: "Anthropic",
  category: "integration",
  icon: React.createElement(AnthropicLogo, { className: "size-4 text-black dark:text-white" }),
  description: "Generate responses using Anthropic's Claude models.",
};
