import React from "react";
import { OpenAILogo } from "./logo";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const OpenAINodeConfig: NodeConfig = {
  type: NodeType.OPENAI,
  label: "OpenAI",
  category: "integration",
  icon: React.createElement(OpenAILogo, { className: "size-4 text-black dark:text-white" }),
  description: "Generate AI responses using OpenAI credentials and models.",
};
